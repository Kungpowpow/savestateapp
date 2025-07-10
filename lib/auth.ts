import AsyncStorage from 'expo-sqlite/kv-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface AuthSession {
  user: User;
  token: string;
  refresh_token: string;
}

class AuthService {
  private async getStoredSession(): Promise<AuthSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem('auth_session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting stored session:', error);
      return null;
    }
  }

  private async storeSession(session: AuthSession): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_session', JSON.stringify(session));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  private async clearStoredSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_session');
    } catch (error) {
      console.error('Error clearing stored session:', error);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const session = await this.getStoredSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    const session: AuthSession = {
      user: data.user,
      token: data.token,
      refresh_token: data.refresh_token,
    };

    await this.storeSession(session);
    return session;
  }

  async signUp(name: string, email: string, password: string, password_confirmation: string): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    const session: AuthSession = {
      user: data.user,
      token: data.token,
      refresh_token: data.refresh_token,
    };

    await this.storeSession(session);
    return session;
  }

  async signOut(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await this.clearStoredSession();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.makeRequest('/auth/user');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshed = await this.refreshToken();
          if (!refreshed) {
            await this.clearStoredSession();
            return null;
          }
          // Retry the request with new token
          const retryResponse = await this.makeRequest('/auth/user');
          if (!retryResponse.ok) {
            await this.clearStoredSession();
            return null;
          }
          const userData = await retryResponse.json();
          return userData.data;
        }
        await this.clearStoredSession();
        return null;
      }

      const userData = await response.json();
      return userData.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      await this.clearStoredSession();
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const session = await this.getStoredSession();
      if (!session?.refresh_token) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const updatedSession: AuthSession = {
        ...session,
        token: data.data.token,
      };

      await this.storeSession(updatedSession);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const session = await this.getStoredSession();
    if (!session) {
      return null;
    }

    // Verify the session is still valid by getting current user
    const user = await this.getCurrentUser();
    if (!user) {
      return null;
    }

    return session;
  }
}

export const authService = new AuthService(); 
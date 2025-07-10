import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister, getUser, logout as apiLogout, getToken, updateProfile as apiUpdateProfile } from '@/lib/api';

interface User {
  id: number;
  name: string;
  username: string;
  slug: string;
  email: string;
  email_verified_at: string | null;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: { name?: string; username?: string; email?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On mount, try to load user if token exists
    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const userData = await getUser();
          setUser(userData);
          setSession({
            user: userData,
            access_token: token
          });
        }
      } catch (e: any) {
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiLogin(email, password);
      const token = await getToken();
      setUser(userData);
      setSession({
        user: userData,
        access_token: token!
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Login failed');
      setUser(null);
      setSession(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiRegister(name, email, password, password_confirmation);
      const token = await getToken();
      setUser(userData);
      setSession({
        user: userData,
        access_token: token!
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed');
      setUser(null);
      setSession(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiLogout();
      setUser(null);
      setSession(null);
    } catch (e: any) {
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getUser();
      const token = await getToken();
      setUser(userData);
      setSession({
        user: userData,
        access_token: token!
      });
    } catch (e: any) {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: { name?: string; username?: string; email?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiUpdateProfile(profileData);
      const token = await getToken();
      setUser(userData);
      setSession({
        user: userData,
        access_token: token!
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Profile update failed');
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
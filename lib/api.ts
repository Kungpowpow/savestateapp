import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api';
const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Attach token to requests if available
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  const token = response.data.data.token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  return response.data.data.user;
}

export async function register(name: string, email: string, password: string, password_confirmation: string) {
  const response = await api.post('/auth/register', { name, email, password, password_confirmation });
  const token = response.data.data.token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  return response.data.data.user;
}

export async function getUser() {
  const response = await api.get('/auth/user');
  return response.data.data;
}

export async function updateProfile(profileData: { name?: string; username?: string; email?: string }) {
  const response = await api.put('/auth/profile', profileData);
  return response.data.data.user;
}

export async function logout() {
  await api.post('/auth/logout');
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// User search and profile functions
export async function searchUsers(query: string, limit: number = 20) {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data.users;
}

export async function getUserProfile(slug: string) {
  const response = await api.get(`/users/${slug}`);
  return response.data;
}

export async function toggleFollowUser(slug: string) {
  const response = await api.post(`/users/${slug}/follow`);
  return response.data;
}

export default api; 
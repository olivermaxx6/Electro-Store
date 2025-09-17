import { create } from 'zustand';
import axios from 'axios';
import { api, initializeTokenRefresh } from '../lib/api';

// Create a separate API instance for auth store
const authApi = axios.create({
  baseURL: '',                // Empty baseURL to use Vite proxy
  timeout: 30000,
  withCredentials: false,
});

export const useAuth = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('access_token') || null,
  loading: false,

  isAuthed: () => !!get().token,

  // Initialize auth header if token exists
  init: () => {
    const token = get().token;
    if (token) {
      authApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Initialize proactive token refresh
      initializeTokenRefresh();
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.post('/api/auth/login/', { username, password });
      console.log('[AUTH] Login response:', data);
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ token: data.access, user: data.user, loading: false });
      
      // Set authorization header for future requests
      authApi.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      
      // Initialize proactive token refresh after successful login
      initializeTokenRefresh();
      
      console.log('[AUTH] User set:', data.user);
      return { ok: true };
    } catch (e) {
      console.error('[AUTH] Login error:', e);
      set({ loading: false });
      return { ok: false, error: e.response?.data || 'Login failed' };
    }
  },

  me: async () => {
    try {
      const { data } = await authApi.get('/api/auth/me/');
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data });
      return data;
    } catch {
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await authApi.put('/api/auth/profile/', profileData);
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data });
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.response?.data || 'Update failed' };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const { data } = await authApi.post('/api/auth/password/', passwordData);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.response?.data || 'Password change failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete authApi.defaults.headers.common.Authorization;
    delete api.defaults.headers.common.Authorization;
    set({ token: null, user: null });
  },
}));

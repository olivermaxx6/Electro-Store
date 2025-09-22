import { create } from 'zustand';
import axios from 'axios';
import { api, initializeTokenRefresh } from '../lib/api';

// Create a separate API instance for auth store
const authApi = axios.create({
  baseURL: 'http://127.0.0.1:8001',  // Direct connection to backend
  timeout: 30000,
  withCredentials: false,
});

export const useAuth = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth') || '{}').user || null,
  token: JSON.parse(localStorage.getItem('auth') || '{}').access || null,
  loading: false,

  isAuthed: () => !!get().token,

  // Initialize auth header if token exists
  init: () => {
    const token = get().token;
    console.log('[AUTH] Initializing auth store with token:', token ? 'present' : 'missing');
    if (token) {
      authApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Initialize proactive token refresh
      initializeTokenRefresh();
      console.log('[AUTH] Auth headers set and token refresh initialized');
    } else {
      console.log('[AUTH] No token found, auth not initialized');
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.post('/api/auth/login/', { username, password });
      console.log('[AUTH] Login response:', data);
      
      // Store auth data in the format expected by API lib
      const authData = {
        access: data.access,
        refresh: data.refresh,
        user: data.user
      };
      localStorage.setItem('auth', JSON.stringify(authData));
      // Also store ACCESS token directly for WebSocket connections
      localStorage.setItem('access_token', data.access);
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
      // Update the auth data in localStorage
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      authData.user = data;
      localStorage.setItem('auth', JSON.stringify(authData));
      set({ user: data });
      return data;
    } catch (error) {
      console.error('[AUTH] Me error:', error);
      // If it's a 401, the token is invalid
      if (error.response?.status === 401) {
        console.log('[AUTH] Token invalid, clearing auth data');
        localStorage.removeItem('auth');
        localStorage.removeItem('access_token');
        delete authApi.defaults.headers.common.Authorization;
        delete api.defaults.headers.common.Authorization;
        set({ token: null, user: null });
      }
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await authApi.put('/api/auth/profile/', profileData);
      // Update the auth data in localStorage
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      authData.user = data;
      localStorage.setItem('auth', JSON.stringify(authData));
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
    localStorage.removeItem('auth');
    localStorage.removeItem('access_token');
    delete authApi.defaults.headers.common.Authorization;
    delete api.defaults.headers.common.Authorization;
    set({ token: null, user: null });
  },
}));

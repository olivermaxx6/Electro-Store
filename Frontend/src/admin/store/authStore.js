import { create } from 'zustand';
import axios from 'axios';

// Create a separate API instance for auth store
const authApi = axios.create({
  baseURL: '/api',  // Use proxy for backend connection
  timeout: 30000,
  withCredentials: false,
});

// Add response interceptor for token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = JSON.parse(localStorage.getItem('auth') || '{}').refresh;
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('auth', JSON.stringify({
            ...JSON.parse(localStorage.getItem('auth') || '{}'),
            access
          }));
          localStorage.setItem('access_token', access);
          
          authApi.defaults.headers.common.Authorization = `Bearer ${access}`;
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('auth');
        localStorage.removeItem('access_token');
        delete authApi.defaults.headers.common.Authorization;
        window.location.href = '/sign-in';
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize token refresh
const initializeTokenRefresh = () => {
  console.log('Token refresh initialized');
  // Token refresh logic is handled by the API interceptor
  // No additional setup needed for now
};

export const useAuth = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth') || '{}').user || null,
  token: JSON.parse(localStorage.getItem('auth') || '{}').access || null,
  refreshToken: JSON.parse(localStorage.getItem('auth') || '{}').refresh || null,
  loading: false,

  isAuthed: () => {
    const token = get().token;
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  // Initialize auth header if token exists
  init: () => {
    // Re-read from localStorage to get the latest token
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const token = authData.access || localStorage.getItem('access_token');
    
    console.log('[AUTH] Initializing auth store with token:', token ? 'present' : 'missing');
    console.log('[AUTH] Auth data from localStorage:', authData);
    console.log('[AUTH] Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Update the store state with current token
    set({ 
      token: token,
      refreshToken: authData.refresh || null,
      user: authData.user || null
    });
    
    if (token) {
      authApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Initialize proactive token refresh
      initializeTokenRefresh();
      console.log('[AUTH] Auth headers set and token refresh initialized');
    } else {
      console.log('[AUTH] No token found, auth not initialized');
    }
    return Promise.resolve(); // Return a promise to indicate initialization is complete
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
      set({ 
        token: data.access, 
        refreshToken: data.refresh,
        user: data.user, 
        loading: false 
      });
      
      // Set authorization header for future requests
      authApi.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      
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
      console.log('[AUTH] Calling /api/auth/me/ with token:', !!authApi.defaults.headers.common.Authorization);
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

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      console.log('[AUTH] No refresh token available');
      return false;
    }

    try {
      console.log('[AUTH] Attempting to refresh access token...');
      const response = await axios.post('/api/auth/refresh/', {
        refresh: refreshToken
      });

      const { access } = response.data;
      
      // Update stored auth data
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      authData.access = access;
      localStorage.setItem('auth', JSON.stringify(authData));
      localStorage.setItem('access_token', access);
      
      // Update store state
      set({ token: access });
      
      // Update API headers
      authApi.defaults.headers.common.Authorization = `Bearer ${access}`;
      
      console.log('[AUTH] Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[AUTH] Token refresh failed:', error);
      // Clear auth data on refresh failure
      get().logout();
      return false;
    }
  },

  logout: () => {
    console.log('[AUTH] Logging out user...');
    localStorage.removeItem('auth');
    localStorage.removeItem('access_token');
    delete authApi.defaults.headers.common.Authorization;
    set({ token: null, user: null, refreshToken: null });
    console.log('[AUTH] User logged out successfully');
  },
}));

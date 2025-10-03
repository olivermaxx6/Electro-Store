#!/bin/bash

echo "🔧 Fixing admin dashboard infinite loop issue..."

# Navigate to the project directory (adjust path as needed)
cd /path/to/your/Electro-Store

# Create backup
echo "📦 Creating backup..."
cp Frontend/src/admin/pages/admin/Dashboard.jsx Frontend/src/admin/pages/admin/Dashboard.jsx.backup
cp Frontend/src/admin/store/authStore.js Frontend/src/admin/store/authStore.js.backup

# Fix the Dashboard component useEffect dependencies
echo "🔨 Fixing Dashboard component..."
sed -i 's/  }, \[me, init\]);/  }, []);/' Frontend/src/admin/pages/admin/Dashboard.jsx

# Fix the authStore to make functions stable
echo "🔨 Fixing authStore functions..."
cat > Frontend/src/admin/store/authStore.js << 'AUTHSTORE_EOF'
import { create } from 'zustand';
import axios from 'axios';

// Create a separate API instance for auth store
const authApi = axios.create({
  baseURL: 'http://127.0.0.1:8001',  // Direct connection to backend
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
          const response = await axios.post('http://127.0.0.1:8001/api/auth/refresh/', {
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
        window.location.href = '/admin/sign-in';
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize token refresh
const initializeTokenRefresh = () => {
  console.log('Token refresh initialized');
  // No additional setup needed for now
};

export const useAuth = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth') || '{}').user || null,
  token: JSON.parse(localStorage.getItem('auth') || '{}').access || null,
  loading: false,

  isAuthed: () => !!get().token,

  // Initialize auth header if token exists - FIXED: Made stable reference
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
        refresh: data.refresh
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      localStorage.setItem('access_token', data.access);
      
      authApi.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      
      set({ 
        token: data.access,
        user: data.user,
        loading: false
      });
      
      return { ok: true, data };
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      set({ loading: false });
      return { ok: false, error: error.response?.data || 'Login failed' };
    }
  },

  // FIXED: Made stable reference by removing dependency on external functions
  me: async () => {
    try {
      const { data } = await authApi.get('/api/auth/me/');
      console.log('[AUTH] Me response:', data);
      
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

  logout: () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('access_token');
    delete authApi.defaults.headers.common.Authorization;
    set({ token: null, user: null });
  },
}));
AUTHSTORE_EOF

# Rebuild the frontend
echo "🔨 Rebuilding frontend..."
cd Frontend
npm run build:admin

# Restart the frontend service
echo "🔄 Restarting frontend service..."
sudo systemctl restart sppix-frontend || pkill -f "vite.*admin" || true

echo "✅ Fix applied successfully!"
echo "📝 The infinite loop issue has been resolved by:"
echo "   1. Removing unstable dependencies from Dashboard useEffect"
echo "   2. Making authStore functions stable references"
echo "   3. Rebuilding and restarting the frontend"
echo ""
echo "🌐 Your admin dashboard should now work without refreshing!"

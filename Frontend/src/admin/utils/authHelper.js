// Authentication helper utilities for admin panel
import axios from 'axios';

const API_BASE_URL = '/api';

// Check if user is authenticated
export const isUserAuthenticated = () => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const token = authData.access || localStorage.getItem('access_token');
    
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
};

// Get authentication token
export const getAuthToken = () => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    return authData.access || localStorage.getItem('access_token');
  } catch {
    return null;
  }
};

// Get authentication headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Test authentication with backend
export const testAuthentication = async () => {
  const token = getAuthToken();
  if (!token) {
    return { authenticated: false, error: 'No token found' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const userData = await response.json();
      return { authenticated: true, user: userData };
    } else if (response.status === 401) {
      return { authenticated: false, error: 'Token expired or invalid' };
    } else {
      return { authenticated: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
};

// Attempt token refresh
export const attemptTokenRefresh = async () => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const refreshToken = authData.refresh;
    
    if (!refreshToken) {
      return false;
    }

    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
      refresh: refreshToken
    });
    
    const { access } = response.data;
    
    // Update stored tokens
    const updatedAuthData = {
      ...authData,
      access
    };
    localStorage.setItem('auth', JSON.stringify(updatedAuthData));
    localStorage.setItem('access_token', access);
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear invalid tokens
    localStorage.removeItem('auth');
    localStorage.removeItem('access_token');
    return false;
  }
};

// Clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('access_token');
  localStorage.removeItem('authToken');
};

// Redirect to login
export const redirectToLogin = () => {
  if (window.location.pathname !== '/sign-in') {
    window.location.href = '/sign-in';
  }
};

// Enhanced API request with authentication handling
export const authenticatedRequest = async (endpoint, options = {}) => {
  console.log('[AuthHelper] Making authenticated request to:', endpoint);
  
  // Check authentication before making request
  if (!isUserAuthenticated()) {
    console.warn(`[AuthHelper] Unauthenticated request to ${endpoint} - redirecting to login`);
    redirectToLogin();
    throw new Error('Authentication required');
  }

  const token = getAuthToken();
  console.log('[AuthHelper] Using token:', token ? token.substring(0, 20) + '...' : 'No token');

  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  // Handle FormData (for file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']; // Let browser set boundary
  }

  try {
    console.log('[AuthHelper] Making request with config:', { endpoint, method: config.method || 'GET' });
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('[AuthHelper] Response status:', response.status);
    
    // Handle authentication errors
    if (response.status === 401) {
      console.warn(`[API] Authentication failed for ${endpoint} - attempting token refresh`);
      
      // Try to refresh the token
      const refreshSuccess = await attemptTokenRefresh();
      if (refreshSuccess) {
        // Retry the request with new token
        config.headers = getAuthHeaders();
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (retryResponse.status === 401) {
          // Still 401 after refresh, redirect to login
          clearAuthData();
          redirectToLogin();
          throw new Error('Authentication expired - please login again');
        }
        
        return retryResponse;
      } else {
        // Refresh failed, redirect to login
        clearAuthData();
        redirectToLogin();
        throw new Error('Authentication expired - please login again');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (error.message.includes('Authentication') || error.message.includes('401')) {
      // Don't show authentication errors to user, just redirect
      return null;
    }
    throw error;
  }
};

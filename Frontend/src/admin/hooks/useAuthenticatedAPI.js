import { useState, useCallback } from 'react';
import { useAuth } from '../store/authStore';
import { isUserAuthenticated } from '../lib/apiInterceptor';

// Hook for making authenticated API calls with automatic error handling
export const useAuthenticatedAPI = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (apiFunction, ...args) => {
    // Check authentication before making request
    if (!isUserAuthenticated()) {
      const error = new Error('Authentication required');
      setError(error);
      throw error;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      console.error('[useAuthenticatedAPI] Request failed:', err);
      
      // Handle different types of errors
      if (err.message.includes('Network error') || err.message.includes('fetch')) {
        setError(new Error('Network connection failed. Please check your internet connection.'));
      } else if (err.message.includes('Authentication') || err.message.includes('401')) {
        console.warn('[useAuthenticatedAPI] Authentication error, logging out');
        logout();
        setError(new Error('Session expired. Please login again.'));
      } else if (err.message.includes('404') || err.message.includes('No ServiceCategory matches the given query')) {
        setError(new Error('Resource not found. It may have been deleted already.'));
      } else if (err.message.includes('500')) {
        setError(new Error('Server error. Please try again later.'));
      } else {
        setError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return {
    makeRequest,
    loading,
    error,
    clearError: () => setError(null)
  };
};

// Hook for components that need to check authentication status
export const useAuthStatus = () => {
  const { isAuthed, user, token, init } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      await init();
      const authenticated = isAuthed() && user && token;
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('[useAuthStatus] Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  }, [isAuthed, user, token, init]);

  return {
    isAuthenticated,
    isChecking,
    checkAuth,
    user,
    token
  };
};

export default useAuthenticatedAPI;

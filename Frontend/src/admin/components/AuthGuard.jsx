import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

const AuthGuard = ({ children }) => {
  const { isAuthed, init, refreshAccessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Memoize the authentication check function to prevent infinite loops
  const checkAuthentication = useCallback(async () => {
    try {
      // Initialize auth store
      await init();
      
      // Check if user is authenticated
      let authenticated = isAuthed();
      
      // If not authenticated but we have a refresh token, try to refresh
      if (!authenticated) {
        console.log('[AuthGuard] Token expired, attempting refresh...');
        const refreshSuccess = await refreshAccessToken();
        if (refreshSuccess) {
          authenticated = isAuthed();
          console.log('[AuthGuard] Token refreshed successfully');
        }
      }
      
      if (authenticated) {
        console.log('[AuthGuard] User is authenticated');
      } else {
        console.log('[AuthGuard] User is not authenticated, redirecting to login');
        
        // Only redirect if we're not already on the sign-in page
        if (location.pathname !== '/sign-in') {
          navigate('/sign-in', { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      }
    } catch (error) {
      console.error('[AuthGuard] Authentication check failed:', error);
      navigate('/sign-in', { replace: true });
    } finally {
      setIsChecking(false);
    }
  }, [init, isAuthed, refreshAccessToken, navigate, location.pathname]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🔐</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Check authentication status and render accordingly
  const authenticated = isAuthed();
  
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🚫</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return children;
};

export default AuthGuard;

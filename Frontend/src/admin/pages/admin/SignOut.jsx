import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

export default function SignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('[SignOut] Starting logout process...');
        
        // Call logout to clear tokens and auth state
        logout();
        
        console.log('[SignOut] Logout completed, redirecting to sign-in...');
        
        // Redirect to sign-in page
        navigate('/sign-in', { replace: true });
      } catch (error) {
        console.error('[SignOut] Logout error:', error);
        // Even if there's an error, redirect to sign-in
        navigate('/sign-in', { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">🚪</span>
        </div>
        <div className="text-slate-600 dark:text-slate-400 font-medium">Signing out...</div>
        <div className="text-sm text-slate-500 dark:text-slate-500 mt-2">Please wait while we log you out</div>
      </div>
    </div>
  );
}

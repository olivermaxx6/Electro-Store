import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../store/authStore';

export default function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const onLogout = () => {
    logout();
    nav('/sign-in');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/60 border-b">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <Link to="/admin" className="font-semibold">⚡ Admin</Link>
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/chat" 
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Chat with users"
            >
              💬
            </Link>
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm opacity-80">Hi, {user.username}</span>
                <button onClick={onLogout} className="text-sm rounded-xl border px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Logout
                </button>
              </>
            ) : (
              loc.pathname !== '/sign-in' && (
                <Link to="/sign-in" className="text-sm rounded-xl border px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

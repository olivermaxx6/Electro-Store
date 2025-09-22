import { useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

export default function SignIn() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('[SignIn] Attempting login with:', username, password);
    const res = await login(username, password);
    console.log('[SignIn] Login result:', res);
    if (res.ok) {
      console.log('[SignIn] Login successful, navigating to dashboard');
      nav('/admin/dashboard');
    } else {
      console.log('[SignIn] Login failed:', res.error);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-900">
      {/* Theme toggle in top-right corner */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="mx-auto max-w-md rounded-2xl border p-6 bg-white dark:bg-slate-950">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Admin Sign In</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-white">Username or Email</label>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600" 
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-white">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600" 
            />
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          <button 
            disabled={loading}
            className="w-full rounded-xl border px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-3 text-xs opacity-70 text-gray-600 dark:text-gray-300">Tip: seeded admin is <code className="text-gray-800 dark:text-gray-200">admin@example.com / admin123</code></p>
      </div>
    </div>
  );
}

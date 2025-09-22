import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

export default function SignInPage() {
  useEffect(()=>{ console.log('[SignInPage] mounted') },[]);
  
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  // Handle redirect reason from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reason = urlParams.get('r');
    if (reason) {
      setMsg(`Redirected: ${decodeURIComponent(reason)}`);
    }
  }, [location.search]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!username.trim() || !password) { setMsg('Enter username and password.'); return; }
    try {
      setBusy(true);
      const result = await login(username.trim(), password);
      if (result.ok) {
        // Safe redirect - check if there's a from location, otherwise go to dashboard
        const from = location.state?.from?.pathname;
        nav(from && from !== '/admin/sign-in' ? from : '/admin/dashboard', { replace: true });
      } else {
        setMsg(result.error?.detail || 'Login failed');
      }
    } catch (err) {
      setMsg('Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-900">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border p-6 bg-white dark:bg-slate-950">
        <h1 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Admin Sign In</h1>
        {msg && <div className="mb-3 rounded-xl border px-3 py-2 text-sm text-gray-700 dark:text-white bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600">{msg}</div>}
        <input className="w-full mb-3 rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Username or Email" value={username} onChange={(e)=>setU(e.target.value)} />
        <input className="w-full mb-4 rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Password" type="password" value={password} onChange={(e)=>setP(e.target.value)} />
        <button type="submit" disabled={busy} className="w-full rounded-xl border px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600">
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

import { useEffect } from 'react';
import { useAuth } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import AdminShell from '../../components/AdminShell';

export default function Welcome() {
  const { isAuthed } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthed()) nav('/dashboard');
  }, [isAuthed, nav]);

  return (
    <AdminShell>
      <div className="rounded-2xl border p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome</h1>
        <p className="mb-6 opacity-80">This is the admin area. Please sign in to continue.</p>
        <Link to="/sign-in" className="rounded-xl border px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          Go to Sign In
        </Link>
      </div>
    </AdminShell>
  );
}

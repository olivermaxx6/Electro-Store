import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Pager from '../../components/ui/Pager';
// import { listUsers, deleteUser, suspendUser, unsuspendUser } from '../../lib/api';

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const load = async () => {
    // const { data } = await listUsers({ page });
    const data = { results: [], count: 0 }; // Mock data
    setRows(data.results || data);
    setHasNext(!!data.next); setHasPrev(!!data.previous);
  };
  useEffect(()=>{ load(); }, [page]);

  const remove = async (id) => { if (confirm('Delete user?')) { /* await deleteUser(id); */ console.log('Delete user:', id); await load(); } };
  const toggleActive = async (u) => {
    // if (u.is_active) await suspendUser(u.id); else await unsuspendUser(u.id);
    console.log('Toggle user status:', u.id, u.is_active);
    await load();
  };

  return (
    <Card title="Users">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left"><th className="py-2 pr-3">Username</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Status</th><th className="py-2">Actions</th></tr></thead>
            <tbody>
              {rows.map(u=>(
                <tr key={u.id} className="border-t">
                  <td className="py-2 pr-3">{u.username}</td>
                  <td className="py-2 pr-3">{u.email || '—'}</td>
                  <td className="py-2 pr-3">{u.is_active ? 'Active' : 'Suspended'}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button onClick={()=>toggleActive(u)} className="rounded-xl border px-2 py-1">{u.is_active?'Suspend':'Unsuspend'}</button>
                      <button onClick={()=>remove(u.id)} className="rounded-xl border px-2 py-1">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3"><Pager page={page} setPage={setPage} hasNext={hasNext} hasPrev={hasPrev}/></div>
      </Card>
  );
}

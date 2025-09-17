import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Pager from '../../components/ui/Pager';
// import { listInquiries, updateInquiry } from '../../lib/api';

export default function InquiriesPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const load = async () => {
    // const { data } = await listInquiries({ page, status: status || undefined });
    const data = { results: [], count: 0 }; // Mock data
    setRows(data.results || data);
    setHasNext(!!data.next); setHasPrev(!!data.previous);
  };
  useEffect(()=>{ load(); }, [page, status]);

  const update = async (id, s) => { /* await updateInquiry(id, { status: s }); */ console.log('Update inquiry:', id, s); await load(); };

  return (
    <div className="grid gap-4 md:grid-cols-1">
      <Card title="Service Inquiries">
          <div className="mb-2">
            <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left"><th className="py-2 pr-3">Service</th><th className="py-2 pr-3">Customer</th><th className="py-2 pr-3">Contact</th><th className="py-2 pr-3">Status</th><th className="py-2">Details</th></tr></thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.id} className="border-t align-top">
                    <td className="py-2 pr-3">{r.service_name}</td>
                    <td className="py-2 pr-3">{r.customer_name}</td>
                    <td className="py-2 pr-3"><div>{r.customer_email}</div><div className="opacity-70">{r.customer_phone}</div></td>
                    <td className="py-2 pr-3">
                      <select value={r.status} onChange={e=>update(r.id, e.target.value)} className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 capitalize">
                        <option value="pending">pending</option>
                        <option value="contacted">contacted</option>
                        <option value="resolved">resolved</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <pre className="whitespace-pre-wrap text-xs bg-slate-100 dark:bg-slate-800 rounded p-2">{JSON.stringify(r.inquiry_details, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3"><Pager page={page} setPage={setPage} hasNext={hasNext} hasPrev={hasPrev}/></div>
        </Card>
      </div>
  );
}

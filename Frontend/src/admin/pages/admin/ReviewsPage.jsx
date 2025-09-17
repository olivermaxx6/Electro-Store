import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Pager from '../../components/ui/Pager';
// import { listReviews, deleteReview } from '../../lib/api';

export default function ReviewsPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const load = async () => {
    // const { data } = await listReviews({ page });
    const data = { results: [], count: 0 }; // Mock data
    setRows(data.results || data);
    setHasNext(!!data.next); setHasPrev(!!data.previous);
  };
  useEffect(()=>{ load(); }, [page]);

  const remove = async (id) => { if (confirm('Delete review?')) { /* await deleteReview(id); */ console.log('Delete review:', id); await load(); } };

  return (
    <Card title="Reviews & Ratings">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left"><th className="py-2 pr-3">Product</th><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Rating</th><th className="py-2 pr-3">Comment</th><th className="py-2">Actions</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-3">{r.product_name}</td>
                  <td className="py-2 pr-3">{r.user_name || '—'}</td>
                  <td className="py-2 pr-3">{r.rating} ★</td>
                  <td className="py-2 pr-3">{r.comment}</td>
                  <td className="py-2"><button onClick={()=>remove(r.id)} className="rounded-xl border px-2 py-1">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3"><Pager page={page} setPage={setPage} hasNext={hasNext} hasPrev={hasPrev}/></div>
      </Card>
  );
}

import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Pager from '../../components/ui/Pager';
import { ThemeLayout, ThemeCard, ThemeSelect, ThemeButton } from '@shared/theme';
import { useCurrency } from '../../store/currencyStore';
import { listOrders, updateOrder } from '../../lib/api';
import { Copy, Check } from 'lucide-react';

export default function OrdersPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { formatAmount } = useCurrency();

  const load = async () => {
    try {
      const { data } = await listOrders({ page, status: status || undefined });
      setRows(data.results || data);
      setHasNext(!!data.next); setHasPrev(!!data.previous);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setRows([]);
      setHasNext(false); setHasPrev(false);
    }
  };
  useEffect(()=>{ load(); }, [page, status]);

  const update = async (id, s) => { 
    try {
      await updateOrder(id, { status: s }); 
      console.log('Update order:', id, s); 
      await load(); 
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const copyTrackingId = async (trackingId) => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopiedId(trackingId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy tracking ID:', error);
    }
  };

  return (
    <ThemeLayout>
        <ThemeCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orders Management</h2>
          </div>
          
          <div className="mb-6">
            <ThemeSelect
              label="Filter by Status"
              value={status} 
              onChange={e=>setStatus(e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
          <div className="overflow-auto">
            <div className="space-y-4">
              {rows.map(o=>(
                <div key={o.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Order #{o.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">Tracking: {o.tracking_id}</span>
                          <button
                            onClick={() => copyTrackingId(o.tracking_id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                            title="Copy tracking ID"
                          >
                            {copiedId === o.tracking_id ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <span className="text-slate-600 dark:text-slate-400">{o.shipping_name || '—'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatAmount(Number(o.total_price))}</span>
                    </div>
                    <ThemeSelect
                      value={o.status} 
                      onChange={e=>update(o.id, e.target.value)}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'processing', label: 'Processing' },
                        { value: 'shipped', label: 'Shipped' },
                        { value: 'delivered', label: 'Delivered' },
                        { value: 'cancelled', label: 'Cancelled' }
                      ]}
                      className="w-40"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <div className="font-semibold mb-2">Items:</div>
                      <ul className="space-y-1">
                        {o.items?.map(it=>(
                          <li key={it.id} className="flex justify-between">
                            <span>{it.product_name} × {it.quantity}</span>
                            <span>@ {formatAmount(Number(it.unit_price))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">Order Details:</div>
                      <div className="space-y-1">
                        <div><span className="font-medium">Customer:</span> {o.customer_email || 'Guest'}</div>
                        <div><span className="font-medium">Created:</span> {new Date(o.created_at).toLocaleDateString()}</div>
                        <div><span className="font-medium">Payment:</span> {o.payment_method || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">No orders found</div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Pager page={page} setPage={setPage} hasNext={hasNext} hasPrev={hasPrev}/>
          </div>
        </ThemeCard>
      </ThemeLayout>
  );
}

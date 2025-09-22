import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Pager from '../../components/ui/Pager';
import { ThemeLayout, ThemeCard, ThemeSelect, ThemeButton } from '@shared/theme';
import { useCurrency } from '../../store/currencyStore';
import { listOrders, updateOrder, deleteOrder } from '../../lib/api';
import { Copy, Check, Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { formatAmount } = useCurrency();

  const load = async () => {
    try {
      setIsLoading(true);
      console.log('Loading orders with filters:', { page, status: status || 'all' });
      const { data } = await listOrders({ page, status: status || undefined });
      setRows(data.results || data);
      setHasNext(!!data.next); setHasPrev(!!data.previous);
      console.log('✅ Orders loaded successfully:', data.results?.length || data.length || 0, 'orders');
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      setRows([]);
      setHasNext(false); setHasPrev(false);
      alert(`Failed to load orders: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(()=>{ load(); }, [page, status]);

  const update = async (id, s) => { 
    try {
      console.log('Updating order:', id, 'to status:', s);
      await updateOrder(id, { status: s }); 
      console.log('✅ Order updated successfully:', id, s); 
      await load(); 
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      // You could add a toast notification here for user feedback
      alert(`Failed to update order status: ${error.message || 'Unknown error'}`);
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

  const copyPaymentId = async (paymentId) => {
    try {
      await navigator.clipboard.writeText(paymentId);
      setCopiedPaymentId(paymentId);
      setTimeout(() => setCopiedPaymentId(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy payment ID:', error);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    try {
      console.log('🗑️ Deleting order:', orderToDelete.id);
      setIsLoading(true); // Show loading state
      
      await deleteOrder(orderToDelete.id);
      console.log('✅ Order deleted successfully from database:', orderToDelete.id);
      
      // Reload the orders list to remove from UI
      await load();
      console.log('✅ Orders list refreshed, order removed from UI');
      
      // Show success message briefly
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      alert(`Failed to delete order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
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
                { value: '', label: 'All order statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
          <div className="overflow-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Loading orders...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {rows.map(o=>(
                <div key={o.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Order #{o.id}</span>
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tracking:</span>
                            <span className="text-sm font-mono bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200 px-2 py-1 rounded border">
                              {o.tracking_id}
                            </span>
                            <button
                              onClick={() => copyTrackingId(o.tracking_id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                              title="Copy tracking ID"
                            >
                              {copiedId === o.tracking_id ? (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              )}
                            </button>
                          </div>
                          {o.payment_id && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment:</span>
                              <span className="text-sm font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded border border-blue-200 dark:border-blue-700">
                                {o.payment_id}
                              </span>
                              <button
                                onClick={() => copyPaymentId(o.payment_id)}
                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                                title="Copy payment ID"
                              >
                                {copiedPaymentId === o.payment_id ? (
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-600 dark:text-slate-400">{o.shipping_name || '—'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatAmount(Number(o.total_price))}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-500">Order:</span>
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
                          className="w-32 text-xs"
                        />
                        <button
                          onClick={() => handleDeleteClick(o)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors text-red-600 dark:text-red-400"
                          title="Delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-500">Payment:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          o.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : o.payment_status === 'unpaid'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : o.payment_status === 'failed'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {o.payment_status === 'paid' ? 'Paid' : 
                           o.payment_status === 'unpaid' ? 'Unpaid' :
                           o.payment_status === 'failed' ? 'Failed' :
                           o.payment_status === 'refunded' ? 'Refunded' : o.payment_status}
                        </span>
                      </div>
                    </div>
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
                        <div><span className="font-medium">Phone:</span> {o.customer_phone || 'Not provided'}</div>
                        <div><span className="font-medium">Created:</span> {new Date(o.created_at).toLocaleDateString()}</div>
                        <div><span className="font-medium">Payment:</span> {o.payment_method || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  {o.shipping_address && Object.keys(o.shipping_address).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Shipping Info:</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <div className="mb-2">
                          <span className="font-medium">Name:</span> {o.shipping_address.firstName} {o.shipping_address.lastName}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Phone:</span> {o.customer_phone || 'Not provided'}
                        </div>
                        <div className="font-medium mb-1">Address:</div>
                        <div>{o.shipping_address.address1}</div>
                        {o.shipping_address.address2 && <div>{o.shipping_address.address2}</div>}
                        <div>{o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.postcode}</div>
                        {o.shipping_address.country && <div>{o.shipping_address.country}</div>}
                      </div>
                    </div>
                  )}
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
            )}
          </div>
          <div className="mt-6">
            <Pager page={page} setPage={setPage} hasNext={hasNext} hasPrev={hasPrev}/>
          </div>
        </ThemeCard>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && orderToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              {deleteSuccess ? (
                // Success State
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Order Deleted Successfully!</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Order #{orderToDelete.id} has been removed from the database and order list.
                  </p>
                </div>
              ) : (
                // Confirmation State
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Delete Order</h3>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      Are you sure you want to delete this order? This action cannot be undone.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <div className="font-semibold mb-2">Order Details:</div>
                        <div>Order #{orderToDelete.id}</div>
                        <div>Customer: {orderToDelete.customer_email || 'Guest'}</div>
                        <div>Total: {formatAmount(Number(orderToDelete.total_price))}</div>
                        <div>Status: {orderToDelete.status}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleDeleteCancel}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deleting...' : 'Delete Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </ThemeLayout>
  );
}

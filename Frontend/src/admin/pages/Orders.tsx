import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../storefront/lib/format';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Edit } from 'lucide-react';
import { getOrders, updateOrder } from '../lib/api';
import { useAuth } from '../store/authStore';

interface Order {
  id: number;
  tracking_id: string;
  payment_id: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid' | 'payment_failed';
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  shipping_name: string;
  shipping_method: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    product: {
      id: number;
      title: string;
      price: number;
    };
    quantity: number;
    unit_price: number;
  }>;
  payments?: Array<{
    id: string;
    stripe_payment_intent_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    created_at: string;
  }>;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { isAuthed, init } = useAuth();
  
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'shipped', label: 'Shipped', color: 'green' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];
  
  useEffect(() => {
    // Initialize auth first, then fetch orders
    const initializeAndFetch = async () => {
      try {
        await init();
        await fetchOrders();
      } catch (error) {
        console.error('Failed to initialize and fetch orders:', error);
      }
    };
    
    initializeAndFetch();
    
    // Auto-refresh every 30 seconds to check for payment status updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [init]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Initialize auth store first to ensure token is loaded
      await init();
      
      // Check authentication after initialization
      if (!isAuthed()) {
        console.error('❌ User not authenticated after init');
        console.log('🔍 Debugging authentication state...');
        
        // Debug localStorage
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');
        const token = authData.access || localStorage.getItem('access_token');
        console.log('🔐 Auth data from localStorage:', authData);
        console.log('🔐 Token present:', !!token);
        
        // Try to refresh token if refresh token exists
        if (authData.refresh) {
          console.log('🔄 Attempting token refresh...');
          try {
            const response = await fetch('http://127.0.0.1:8001/api/auth/refresh/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: authData.refresh })
            });
            
            if (response.ok) {
              const refreshData = await response.json();
              const newAuthData = { ...authData, access: refreshData.access };
              localStorage.setItem('auth', JSON.stringify(newAuthData));
              localStorage.setItem('access_token', refreshData.access);
              console.log('✅ Token refreshed successfully');
              
              // Re-initialize auth store with new token
              await init();
              
              // Check authentication again
              if (!isAuthed()) {
                throw new Error('Authentication still failed after token refresh');
              }
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            setOrders([]);
            return;
          }
        } else {
          setOrders([]);
          return;
        }
      }
      
      console.log('🔄 Fetching orders...');
      const response = await getOrders();
      console.log('✅ Orders fetched successfully:', response.data);
      
      // Handle both paginated and non-paginated responses
      const ordersData = response.data.results || response.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.error('Authentication failed - redirecting to login');
        // The auth interceptor should handle redirect
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
      
      const response = await updateOrder(orderId, { status: newStatus });
      console.log('✅ Order status updated successfully:', response.data);
      
      // Update the order in the local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ));
      
      if (selectedOrder) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any, updated_at: new Date().toISOString() } : null);
      }
      
      // Trigger dashboard refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('ordersUpdated', { 
        detail: { orderId, newStatus } 
      }));
      console.log('📊 Dashboard refresh triggered');
      
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'payment_failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unpaid':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and track customer orders</p>
        </div>
        
        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.tracking_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer_email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status || 'unpaid')}`}>
                        {getPaymentStatusIcon(order.payment_status || 'unpaid')}
                        <span className="ml-1">{(order.payment_status || 'unpaid').charAt(0).toUpperCase() + (order.payment_status || 'unpaid').slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(order.total_price, 'GBP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-slate-800">
              <div className="mt-3">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Order #{selectedOrder.id} - {selectedOrder.tracking_id}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Information */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Order ID:</span>
                          <span className="text-gray-900 dark:text-white">#{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Tracking ID:</span>
                          <span className="text-gray-900 dark:text-white">{selectedOrder.tracking_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Payment ID:</span>
                          <span className="text-gray-900 dark:text-white">{selectedOrder.payment_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusIcon(selectedOrder.status)}
                            <span className="ml-1">{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Email:</span>
                          <span className="text-gray-900 dark:text-white ml-2">{selectedOrder.customer_email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                          <span className="text-gray-900 dark:text-white ml-2">{selectedOrder.customer_phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Shipping Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Method:</span>
                          <span className="text-gray-900 dark:text-white capitalize">
                            {selectedOrder.shipping_method === 'standard' ? 'Standard Shipping (5-7 business days)' : 
                             selectedOrder.shipping_method === 'express' ? 'Express Shipping (2-3 business days)' : 
                             selectedOrder.shipping_method || 'Standard Shipping'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Cost:</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.shipping_cost, 'GBP')}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Address</h5>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>{selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}</p>
                          <p>{selectedOrder.shipping_address.address1}</p>
                          <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postcode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items and Actions */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.product.title}</p>
                              <p className="text-gray-600 dark:text-gray-300">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-gray-900 dark:text-white">{formatCurrency(item.unit_price * item.quantity, 'GBP')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.subtotal, 'GBP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.shipping_cost, 'GBP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.tax_amount, 'GBP')}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-slate-600 pt-2">
                          <span className="font-medium text-gray-900 dark:text-white">Total:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedOrder.total_price, 'GBP')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Update */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Update Status</h4>
                      <div className="space-y-3">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                            disabled={updatingStatus || selectedOrder.status === status.value}
                            className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              selectedOrder.status === status.value
                                ? 'bg-blue-600 text-white cursor-not-allowed'
                                : status.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                                : status.color === 'blue'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                                : status.color === 'green'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                            }`}
                          >
                            {getStatusIcon(status.value)}
                            <span className="ml-2">{status.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-slate-600 dark:text-gray-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

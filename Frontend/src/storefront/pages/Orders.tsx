import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated, selectCurrentUser } from '../store/userSlice';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import LoadingScreen from '../components/common/LoadingScreen';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';
import { Package, Calendar, DollarSign, Eye } from 'lucide-react';

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    price: number;
  };
  quantity: number;
  unit_price: number;
}

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
  status: string;
  payment_method: string;
  shipping_name: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (!isAuthenticated) {
      navigate('/user/sign-in');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the auth token from localStorage
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');
        const token = authData.access;
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://127.0.0.1:8001/api/auth/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading your orders..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Orders</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order History</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {currentUser?.name || currentUser?.email}! Here are all your orders.
          </p>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Placeholder size="lg" className="mx-auto mb-6">
              <Package className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </Placeholder>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order.id}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} item(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {formatCurrency(order.total_price, settings?.currency as Currency || 'USD')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Tracking: {order.tracking_id}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-600">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Payment: {order.payment_method}
                  </div>
                  <button 
                    onClick={() => navigate(`/order-confirmation/${order.tracking_id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-blue-400 hover:text-red-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
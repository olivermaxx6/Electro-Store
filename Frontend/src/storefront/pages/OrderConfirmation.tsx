import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/format';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';

interface OrderData {
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
}

const OrderConfirmation: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const dispatch = useDispatch();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useStoreSettings();
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real app, you'd fetch the order by tracking ID
        // For now, we'll simulate the order data
        const mockOrder: OrderData = {
          id: Math.floor(Math.random() * 1000),
          tracking_id: trackingId || '',
          payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
          customer_email: 'customer@example.com',
          customer_phone: '+1234567890',
          shipping_address: {
            firstName: 'John',
            lastName: 'Doe',
            address1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postcode: '12345'
          },
          subtotal: 299.97,
          shipping_cost: 9.99,
          tax_amount: 24.00,
          total_price: 333.96,
          status: 'pending',
          payment_method: 'credit_card',
          shipping_name: 'Standard Shipping',
          created_at: new Date().toISOString(),
          items: [
            {
              id: 1,
              product: {
                id: 1,
                title: 'Sample Product 1',
                price: 99.99
              },
              quantity: 2,
              unit_price: 99.99
            },
            {
              id: 2,
              product: {
                id: 2,
                title: 'Sample Product 2',
                price: 99.99
              },
              quantity: 1,
              unit_price: 99.99
            }
          ]
        };
        
        setOrder(mockOrder);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        dispatch(addToast({
          message: 'Failed to load order details',
          type: 'error'
        }));
      } finally {
        setLoading(false);
      }
    };
    
    if (trackingId) {
      fetchOrder();
    }
  }, [trackingId, dispatch]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">The order you're looking for could not be found.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for your order. We've received your payment and will process your order shortly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Order Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tracking ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.tracking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Payment ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.payment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    order.status === 'shipped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Shipping Address */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              <div className="text-gray-600 dark:text-gray-300">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postcode}</p>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-slate-600 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.product.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.unit_price * item.quantity, settings?.currency as Currency || 'USD')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal, settings?.currency as Currency || 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.shipping_cost, settings?.currency as Currency || 'USD')}</span>
                </div>
                {order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tax</span>
                    <span className="font-medium">{formatCurrency(order.tax_amount, settings?.currency as Currency || 'USD')}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-red-600 dark:text-blue-400">
                      {formatCurrency(order.total_price, settings?.currency as Currency || 'USD')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/user/orders"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  View All Orders
                </Link>
              </div>
              
              {/* Next Steps */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-md">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">What's Next?</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• You'll receive an order confirmation email</li>
                  <li>• We'll process your order within 1-2 business days</li>
                  <li>• You'll receive tracking information once shipped</li>
                  <li>• Expected delivery: 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

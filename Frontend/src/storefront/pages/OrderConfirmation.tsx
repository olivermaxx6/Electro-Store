import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/uiSlice';
import { selectIsAuthenticated } from '../store/userSlice';
import { formatCurrency } from '../lib/format';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';

type Currency = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

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
  payment_status?: string;
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
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useStoreSettings();
  
  // Utility function to format long IDs
  const formatLongId = (id: string, maxLength: number = 20) => {
    if (id.length <= maxLength) return id;
    return `${id.substring(0, maxLength)}...`;
  };
  

  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!trackingId) {
          // No tracking ID provided - show a helpful message
          setLoading(false);
          return;
        }

        console.log('🔄 Fetching order data from backend API...');
        
        // Use the new checkout session API endpoint
        const orderData = await fetchOrderFromCheckoutSession(trackingId);
        if (orderData) {
          setOrder(orderData);
          setLoading(false);
          return;
        }
        
        // If order not found, show processing message
        console.log('⚠️ Order not found - webhook may still be processing');
        setLoading(false);
        
      } catch (error) {
        console.error('Failed to fetch order:', error);
        dispatch(addToast({
          message: error instanceof Error ? error.message : 'Failed to load order details',
          type: 'error'
        }));
        setLoading(false);
      }
    };

    const fetchOrderFromCheckoutSession = async (sessionId: string): Promise<OrderData | null> => {
      console.log(`🔍 Fetching order from checkout session API: ${sessionId}`);
      
      try {
        const response = await fetch(`http://127.0.0.1:8001/api/public/checkout-session/${sessionId}/`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Order data received from checkout session API:', data);
          
          if (data.order) {
            // Transform the API response to match our interface
            const transformedOrder: OrderData = {
              id: data.order.id,
              tracking_id: data.order.tracking_id,
              payment_id: data.order.payment_id,
              customer_email: data.order.customer_email,
              customer_phone: data.order.customer_phone,
              shipping_address: data.order.shipping_address,
              subtotal: data.order.subtotal,
              shipping_cost: data.order.shipping_cost,
              tax_amount: data.order.tax_amount,
              total_price: data.order.total_price,
              status: data.order.status,
              // If user reached confirmation page, payment was successful
              payment_status: 'paid',
              payment_method: data.order.payment_method,
              shipping_name: data.order.shipping_name,
              created_at: data.order.created_at,
              items: data.order.items.map((item: any) => ({
                id: item.id,
                product: {
                  id: item.id,
                  title: item.product_name,
                  price: item.unit_price
                },
                quantity: item.quantity,
                unit_price: item.unit_price
              }))
            };
            
            console.log('✅ Order transformed successfully:', transformedOrder);
            return transformedOrder;
          } else {
            console.log('⚠️ No order data in response');
            return null;
          }
        } else if (response.status === 404) {
          const errorData = await response.json();
          console.log('⚠️ Order not found (404):', errorData);
          
          if (errorData.processing) {
            console.log('🔄 Order is still processing, will show processing message');
            return null;
          }
          
          throw new Error('Order not found');
        } else {
          const errorData = await response.json();
          console.error('❌ API error:', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error fetching from checkout session API:', error);
        throw error;
      }
    };

    
    if (trackingId) {
      fetchOrder();
    }
  }, [trackingId, dispatch]);
  
  if (loading) {
    return <LoadingScreen message="Loading order details..." />;
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            {!trackingId ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
                  <Package className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Confirmation</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  To view your order confirmation details, please use the tracking ID provided in your confirmation email or receipt.
                </p>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 max-w-md mx-auto mb-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Check your email for the order confirmation</li>
                    <li>• Look for the tracking ID in your receipt</li>
                    <li>• Contact customer support if you can't find it</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
                  >
                    🏠 Back to Home
                  </Link>
                  <Link
                    to="/track-order"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 dark:bg-slate-600 text-white rounded-md hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    🔍 Track Your Order
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  🎉 Your Order Has Been Placed Successfully!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Thank you for your purchase! We've received your payment and your order is now being processed.
                </p>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 max-w-md mx-auto mb-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Processing your order, please wait...</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Order Number:</span>
                      <span className="text-gray-400">Processing...</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Payment Status:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Paid ✅
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Tracking ID:</span>
                      <span className="font-mono text-xs text-gray-900 dark:text-white">
                        {trackingId.length > 20 ? `${trackingId.substring(0, 20)}...` : trackingId}
                      </span>
                    </div>
                  </div>
                  
                  {trackingId && trackingId.startsWith('cs_') && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Status:</strong> Webhook processing...
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        We're fetching your order details from the payment system...
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
                  >
                    🔄 Refresh Page
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 dark:bg-slate-600 text-white rounded-md hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    🏠 Back to Home
                  </Link>
                </div>
              </>
            )}
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
        <div className="text-center mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Your Order Has Been Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Thank you for your purchase! We've received your payment and your order is now being processed. 
            You'll receive a confirmation email shortly with all the details.
          </p>
          
          {/* Order ID Display */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 max-w-md mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Order Number:</p>
            <p className="text-2xl font-bold text-red-600 dark:text-blue-400">
              #{order.id}
            </p>
            <p 
              className="text-sm text-gray-500 dark:text-gray-500 mt-1 cursor-help" 
              title={order.tracking_id}
            >
              Tracking ID: {formatLongId(order.tracking_id)}
            </p>
          </div>

        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Order Number</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">#{order.id}</p>
                </div>
                <div className="md:col-span-1 lg:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Tracking ID</p>
                  <p 
                    className="font-medium text-gray-900 dark:text-white font-mono text-xs cursor-help" 
                    title={order.tracking_id}
                  >
                    {formatLongId(order.tracking_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Order Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    order.status === 'shipped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Payment Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : order.payment_status === 'unpaid'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : order.payment_status === 'failed'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {order.payment_status === 'paid' ? 'Paid' : 
                     order.payment_status === 'unpaid' ? 'Unpaid' :
                     order.payment_status === 'failed' ? 'Failed' :
                     order.payment_status === 'refunded' ? 'Refunded' : 
                     order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.customer_phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Shipping Method</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.shipping_name}</p>
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
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 dark:from-blue-600 dark:to-blue-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🏠 Go Back to Home
                </Link>
                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Continue Shopping
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/account/orders"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    View My Orders
                  </Link>
                )}
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

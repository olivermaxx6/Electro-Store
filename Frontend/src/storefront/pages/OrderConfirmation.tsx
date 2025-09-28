import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/uiSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../store/userSlice';
import { clearCart } from '../store/cartSlice';
import { formatCurrency, currencyOptions } from '../lib/format';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';

// Remove unused Currency type

interface OrderData {
  id: number;
  order_number: string;
  tracking_id: string;
  payment_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_name: string;
  shipping_address: any;
  shipping_method: string;
  billing_address?: any;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_price: number;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  payment_method: string;
  created_at: string;
  updated_at?: string;
}

const OrderConfirmation: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useStoreSettings();
  
  // Utility function to format long IDs
  const formatLongId = (id: string, maxLength: number = 20) => {
    if (id.length <= maxLength) return id;
    return `${id.substring(0, maxLength)}...`;
  };

  // Helper function to get currency object from string
  const getCurrencyObject = (currencyCode: string) => {
    return currencyOptions.find(curr => curr.code === currencyCode) || currencyOptions[0];
  };
  

  
  useEffect(() => {
    console.log('🔍 useEffect triggered with slug:', slug);
    const fetchOrder = async () => {
      try {
        console.log('🔍 Starting fetchOrder with slug:', slug);
        console.log('🔍 Current order state:', order);
        console.log('🔍 Current loading state:', loading);
        
        // Priority: Use tracking ID from URL if available, otherwise check localStorage
        if (slug) {
          // Extract tracking ID from slug
          const trackingId = slug;
          console.log('🔄 Fetching order details for tracking ID:', trackingId);
          
          // Use the order tracking API with the tracking ID
          const apiUrl = `/api/public/track-order/${trackingId}?t=${Date.now()}`;
          console.log('🔍 Fetching from URL:', apiUrl);
          const response = await fetch(apiUrl);
          console.log('🔍 Response status:', response.status);
          console.log('🔍 Response headers:', response.headers);
          
          if (response.ok) {
            const responseData = await response.json();
            console.log('🔍 Response data received:', responseData);
            
            // Handle response data
            const orderData = responseData;
            if (orderData) {
              console.log('🔍 Setting order data:', orderData);
              console.log('🔍 Order data keys:', Object.keys(orderData));
              // Set order data from backend response
              setOrder(orderData);
              console.log('🔍 Order state set, will re-render');
              
              // Clear cart after successful order confirmation
              dispatch(clearCart({ userId }));
              
              // Update payment status in backend if user reached confirmation page successfully
              // Since user reached confirmation page, payment was successful
              if (orderData.payment_status === 'unpaid') {
                try {
                  console.log('🔄 Updating payment status to paid for tracking ID:', trackingId);
                  const updateResponse = await fetch(`/api/public/track-order/${trackingId}/?t=${Date.now()}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      payment_status: 'paid'
                    })
                  });
                  
                  console.log('🔍 Payment update response status:', updateResponse.status);
                  
                  if (updateResponse.ok) {
                    const updateResult = await updateResponse.json();
                    console.log('✅ Payment status updated successfully:', updateResult);
                    // Update local state with the new payment status
                    setOrder(prev => prev ? {...prev, payment_status: 'paid', status: 'pending', payment_status_display: 'Paid'} : null);
                    console.log('✅ Local state updated to paid');
                  } else {
                    console.error('❌ Payment update failed:', updateResponse.status, await updateResponse.text());
                  }
                } catch (error) {
                  // Payment status update failed, but order is still valid
                  console.error('❌ Failed to update payment status:', error);
                }
              } else {
                console.log('📝 Payment status is already:', orderData.payment_status);
              }
            } else {
              throw new Error('Order not found in response data');
            }
          } else {
            console.error('❌ API request failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Order not found: ${response.status} - ${errorText}`);
          }
        } else {
          // Fallback: Check localStorage for order info
          const storedOrder = localStorage.getItem('currentOrder');
          const orderInfo = storedOrder ? JSON.parse(storedOrder) : null;
          
          console.log('🔍 Stored order info:', orderInfo);
          
          if (orderInfo?.orderNumber) {
            console.log('🔄 Fetching order details for orderNumber:', orderInfo.orderNumber);
            
            const response = await fetch(`/api/public/orders/${orderInfo.orderNumber}/?t=${Date.now()}`);
            console.log('🔍 Response status:', response.status);
            
            if (response.ok) {
              const orderData = await response.json();
              console.log('🔍 Order data received:', orderData);
              setOrder(orderData);
              
              // Clear cart after successful order confirmation
              dispatch(clearCart({ userId }));
              
              // Clear order info from localStorage
              localStorage.removeItem('currentOrder');
            } else {
              throw new Error('Order not found');
            }
          } else {
            throw new Error('No order information available');
          }
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch order:', error);
        console.error('❌ Error details:', error);
        dispatch(addToast({
          message: error instanceof Error ? error.message : 'Failed to load order details',
          type: 'error'
        }));
      } finally {
        console.log('🔍 Setting loading to false');
        setLoading(false);
        console.log('🔍 Loading set to false, order state:', order);
      }
    };

    fetchOrder();
  }, [slug, dispatch]);
  
  if (loading) {
    return <LoadingScreen message="Loading order details..." />;
  }
  
  if (!order) {
    console.log('🚨 No order data, showing fallback UI');
    console.log('🚨 Order state:', order);
    console.log('🚨 Loading state:', loading);
    console.log('🚨 Slug:', slug);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            {!slug ? (
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
                  <Package className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Not Found
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Unable to load order details for tracking ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{slug}</span>
                </p>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 max-w-md mx-auto mb-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Possible reasons:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• The tracking ID may be incorrect</li>
                    <li>• The order may not exist in our system</li>
                    <li>• There may be a temporary server issue</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
                  >
                    🔄 Try Again
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
          
          {/* Order Number and Tracking Display */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-blue-400 mb-2">
                Order #{order?.id || 'Loading...'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking:</span>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded border">
                  {order?.tracking_id || 'Loading...'}
                </span>
              </div>
            </div>
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
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Order</p>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">#{order?.id || 'Loading...'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Tracking:</span>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded">
                        {order?.tracking_id ? formatLongId(order.tracking_id) : 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order?.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Order Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    order?.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    order?.status === 'shipped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Loading...'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Payment Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    order?.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : order?.payment_status === 'unpaid'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : order?.payment_status === 'failed'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {order?.payment_status === 'paid' ? 'Paid' : 
                     order?.payment_status === 'unpaid' ? 'Unpaid' :
                     order?.payment_status === 'failed' ? 'Failed' :
                     order?.payment_status === 'refunded' ? 'Refunded' : 
                     order?.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Loading...'}
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
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Customer Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order?.shipping_name || order?.customer_name || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order?.customer_email || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order?.customer_phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Shipping Method</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order?.shipping_method === 'standard' ? 'Standard Shipping (5-7 business days)' : 
                     order?.shipping_method === 'express' ? 'Express Shipping (2-3 business days)' : 
                     order?.shipping_method || 'Standard Shipping'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Shipping Cost</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order?.shipping_cost || 0, getCurrencyObject(settings?.currency || 'GBP'))}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Shipping Address</p>
                  <div className="text-gray-600 dark:text-gray-300">
                    {typeof order?.shipping_address === 'string' ? (
                      <p>{order.shipping_address}</p>
                    ) : (
                      <>
                        <p>{order?.shipping_address?.firstName} {order?.shipping_address?.lastName}</p>
                        <p>{order?.shipping_address?.address}</p>
                        {order?.shipping_address?.address2 && <p>{order.shipping_address.address2}</p>}
                        <p>{order?.shipping_address?.city}, {order?.shipping_address?.state} {order?.shipping_address?.zipCode}</p>
                        <p>{order?.shipping_address?.country}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order?.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-slate-600 last:border-b-0">
                    <div className="flex items-center space-x-4 flex-1">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.product_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Price: {formatCurrency(item.unit_price, getCurrencyObject(settings?.currency || 'GBP'))}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.total_price, getCurrencyObject(settings?.currency || 'GBP'))}
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
                  <span className="font-medium">{formatCurrency(order?.subtotal || 0, getCurrencyObject(settings?.currency || 'GBP'))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-medium">{formatCurrency(order?.shipping_cost || 0, getCurrencyObject(settings?.currency || 'GBP'))}</span>
                </div>
                {(order?.tax_amount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tax</span>
                    <span className="font-medium">{formatCurrency(order?.tax_amount || 0, getCurrencyObject(settings?.currency || 'GBP'))}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-red-600 dark:text-blue-400">
                      {formatCurrency(order?.total_price || 0, getCurrencyObject(settings?.currency || 'GBP'))}
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

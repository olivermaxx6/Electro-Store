import React, { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useContactInfo } from '../../hooks/useContactInfo';
import ChatModal from '../../components/chat/ChatModal';
import { formatCurrency } from '../../lib/format';
import { Currency } from '../../lib/types';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const TrackOrder: React.FC = () => {
  const { contactInfo, loading: contactLoading, error: contactError } = useContactInfo();
  const { settings } = useStoreSettings();
  const [trackingId, setTrackingId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/public/track-order/${trackingId}/`);
      
      if (response.ok) {
        const data = await response.json();
        setTrackingInfo(data);
      } else if (response.status === 404) {
        setError('Order not found. Please check your tracking ID and try again.');
        setTrackingInfo(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to track order. Please try again.');
        setTrackingInfo(null);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Track Your Order</h1>
          
          
          {/* Track Order Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Enter your order details</h2>
            
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Tracking ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter your tracking ID (e.g., abc-123-def-456)"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
            
            {/* Live Chat Support */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Need Help?</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Chat with our support team for real-time assistance with your order.
                  </p>
                </div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Live Chat</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Tracking Results */}
          {trackingInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Order #{trackingInfo.id}</h2>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Tracking: {trackingInfo.tracking_id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    trackingInfo.status === 'delivered' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : trackingInfo.status === 'shipped'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : trackingInfo.status === 'processing'
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  } transition-colors duration-300`}>
                    {trackingInfo.status_display}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                    Created: {new Date(trackingInfo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Order Items</h3>
                  <div className="space-y-3">
                    {trackingInfo.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.total_price, settings?.currency as Currency || 'USD')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatCurrency(item.unit_price, settings?.currency as Currency || 'USD')} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(trackingInfo.subtotal, settings?.currency as Currency || 'USD')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                      <span className="font-medium">{formatCurrency(trackingInfo.shipping_cost, settings?.currency as Currency || 'USD')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                      <span className="font-medium">{formatCurrency(trackingInfo.tax_amount, settings?.currency as Currency || 'USD')}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3">
                      <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(trackingInfo.total_price, settings?.currency as Currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Information */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Delivery Address</h4>
                    <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      {trackingInfo.shipping_address ? (
                        <div>
                          <p>{trackingInfo.shipping_address.firstName} {trackingInfo.shipping_address.lastName}</p>
                          <p>{trackingInfo.shipping_address.address1}</p>
                          {trackingInfo.shipping_address.address2 && <p>{trackingInfo.shipping_address.address2}</p>}
                          <p>{trackingInfo.shipping_address.city}, {trackingInfo.shipping_address.state} {trackingInfo.shipping_address.postcode}</p>
                          <p>{trackingInfo.shipping_address.email}</p>
                          <p>{trackingInfo.shipping_address.phone}</p>
                        </div>
                      ) : (
                        <p>Address not available</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Shipping Information</h4>
                    <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      <p><strong>Method:</strong> {trackingInfo.shipping_name}</p>
                      <p><strong>Payment:</strong> {trackingInfo.payment_method}</p>
                      <p><strong>Customer:</strong> {trackingInfo.customer_email}</p>
                      <p><strong>Phone:</strong> {trackingInfo.customer_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Help Section */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Need help with tracking?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Can't find your order?</h4>
                <p className="transition-colors duration-300">Make sure you're using the correct order number from your confirmation email.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Tracking not updating?</h4>
                <p className="transition-colors duration-300">It may take up to 24 hours for tracking information to appear after shipping.</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Contact our support team for assistance →
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default TrackOrder;
import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useContactInfo } from '../../hooks/useContactInfo';

const TrackOrder: React.FC = () => {
  const { contactInfo, loading: contactLoading, error: contactError } = useContactInfo();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTrackingInfo({
        orderNumber: orderNumber,
        status: 'Shipped',
        estimatedDelivery: '2024-01-25',
        trackingNumber: 'TRK123456789',
        history: [
          { status: 'Order Placed', date: '2024-01-20', time: '10:30 AM' },
          { status: 'Processing', date: '2024-01-21', time: '2:15 PM' },
          { status: 'Shipped', date: '2024-01-22', time: '9:45 AM' },
        ]
      });
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Track Your Order</h1>
          
          {/* Track Order Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enter your order details</h2>
            
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter your order number (e.g., #ABC123DEF)"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>
          
          {/* Tracking Results */}
          {trackingInfo && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order {trackingInfo.orderNumber}</h2>
                  <p className="text-gray-600">Tracking: {trackingInfo.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    trackingInfo.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800'
                      : trackingInfo.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trackingInfo.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Est. Delivery: {trackingInfo.estimatedDelivery}
                  </p>
                </div>
              </div>
              
              {/* Progress Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
                
                <div className="space-y-4">
                  {trackingInfo.history.map((item: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === trackingInfo.history.length - 1
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index === trackingInfo.history.length - 1 ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{item.status}</h4>
                          <span className="text-sm text-gray-600">
                            {item.date} at {item.time}
                          </span>
                        </div>
                        {index === trackingInfo.history.length - 1 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Your order is on its way to you!
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Delivery Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-gray-600">
                      {contactLoading ? (
                        'Loading address...'
                      ) : contactError ? (
                        'Address not available'
                      ) : (
                        contactInfo.address || 'Address not set'
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Carrier Information</h4>
                    <p className="text-gray-600">
                      Carrier: FedEx<br />
                      Service: Ground<br />
                      Estimated Delivery: {trackingInfo.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Help Section */}
          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need help with tracking?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Can't find your order?</h4>
                <p>Make sure you're using the correct order number from your confirmation email.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tracking not updating?</h4>
                <p>It may take up to 24 hours for tracking information to appear after shipping.</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/contact"
                className="text-primary hover:text-primary-600 transition-colors"
              >
                Contact our support team for assistance →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
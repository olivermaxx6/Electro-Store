import React from 'react';
import { Truck, Clock, MapPin, Shield, Package } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { formatCurrency } from '../../lib/format';
import { Currency } from '../../lib/types';

const ShippingInfo: React.FC = () => {
  const { settings, loading: settingsLoading } = useStoreSettings();
  const standardRate = settings && !settingsLoading ? parseFloat((settings as any)?.standard_shipping_rate?.toString() || '0') || 0 : 0;
  const expressRate = settings && !settingsLoading ? parseFloat((settings as any)?.express_shipping_rate?.toString() || '0') || 0 : 0;
  
  const shippingOptions = [
    {
      name: 'Standard Shipping',
      price: standardRate === 0 ? 'Free' : formatCurrency(standardRate, settings?.currency as Currency || 'USD'),
      duration: '5-7 business days',
      description: 'Regular delivery to most locations',
      icon: Package
    },
    {
      name: 'Express Shipping',
      price: expressRate === 0 ? 'Free' : formatCurrency(expressRate, settings?.currency as Currency || 'USD'),
      duration: '2-3 business days',
      description: 'Faster delivery for urgent orders',
      icon: Truck
    },
    {
      name: 'Overnight Shipping',
      price: expressRate === 0 ? 'Free' : formatCurrency(expressRate * 2, settings?.currency as Currency || 'USD'),
      duration: '1 business day',
      description: 'Next business day delivery',
      icon: Clock
    }
  ];

  const shippingFeatures = [
    {
      icon: Shield,
      title: 'Secure Packaging',
      description: 'All items are carefully packaged to ensure safe delivery'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track your package from warehouse to your doorstep'
    },
    {
      icon: Truck,
      title: 'Reliable Carriers',
      description: 'We work with trusted shipping partners worldwide'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Shipping Information</h1>
          
          {/* Shipping Options */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shippingOptions.map((option, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
                  <option.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{option.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{option.price}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">{option.duration}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Why Choose Our Shipping?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shippingFeatures.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                  <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Policy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Shipping Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Processing Time</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Orders are typically processed within 1-2 business days. During peak seasons, processing may take up to 3 business days.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Delivery Areas</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  We currently ship to all 50 US states. International shipping is not available at this time.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Delivery Attempts</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Our carriers will make up to 3 delivery attempts. If delivery is unsuccessful, packages will be held at the local facility for pickup.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Holiday Shipping</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  During holidays, shipping times may be extended. Please allow extra time for delivery during peak seasons.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">Questions About Shipping?</h2>
            <p className="mb-6 opacity-90">
              Our customer service team is here to help with any shipping questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/track-order"
                className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Track Your Order
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;

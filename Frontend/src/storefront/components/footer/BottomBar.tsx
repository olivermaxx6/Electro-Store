import React from 'react';
import { CreditCard, Shield, Truck, Headphones } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

const BottomBar: React.FC = () => {
  const { storeSettings } = useStore();
  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '💰' },
    { name: 'Apple Pay', icon: '🍎' },
    { name: 'Google Pay', icon: 'G' },
  ];
  
  const features = [
    { icon: Truck, text: 'Free Shipping' },
    { icon: Shield, text: 'Secure Payment' },
    { icon: Headphones, text: '24/7 Support' },
  ];
  
  return (
    <div className="bg-gray-900 dark:bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-gray-400 dark:text-gray-300">
            © 2024 {storeSettings.store_name}. All rights reserved.
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400 dark:text-gray-300 mr-2">We accept:</span>
            <div className="flex items-center space-x-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300"
                  title={method.name}
                >
                  {method.icon}
                </div>
              ))}
            </div>
          </div>
          
          {/* Features */}
          <div className="flex items-center space-x-6">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center space-x-2 text-sm text-gray-300 dark:text-gray-400">
                <feature.icon className="w-4 h-4" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
import React from 'react';
import { RotateCcw, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const Returns: React.FC = () => {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Log into your account and request a return within 30 days',
      icon: RotateCcw
    },
    {
      step: 2,
      title: 'Print Label',
      description: 'We\'ll email you a prepaid return shipping label',
      icon: Package
    },
    {
      step: 3,
      title: 'Package & Ship',
      description: 'Pack your item securely and drop it off at any carrier location',
      icon: CheckCircle
    },
    {
      step: 4,
      title: 'Receive Refund',
      description: 'Once received, we\'ll process your refund within 5-7 business days',
      icon: Clock
    }
  ];

  const returnPolicy = [
    {
      title: 'Return Window',
      content: 'Items must be returned within 30 days of delivery for a full refund.'
    },
    {
      title: 'Condition Requirements',
      content: 'Items must be in original condition with tags attached and original packaging.'
    },
    {
      title: 'Return Shipping',
      content: 'Return shipping is free for eligible returns. We provide prepaid return labels.'
    },
    {
      title: 'Refund Processing',
      content: 'Refunds are processed within 5-7 business days after we receive your return.'
    }
  ];

  const nonReturnableItems = [
    'Personalized or custom items',
    'Items damaged by misuse',
    'Items without original packaging',
    'Items returned after 30 days',
    'Digital products or downloads'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Returns & Exchanges</h1>
          
          {/* Return Process */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">How to Return an Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnSteps.map((step, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.step}
                  </div>
                  <step.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Return Policy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Return Policy</h2>
            
            <div className="space-y-6">
              {returnPolicy.map((policy, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">{policy.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{policy.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-8 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">Non-Returnable Items</h2>
            </div>
            <p className="text-red-800 dark:text-red-200 mb-4">
              The following items cannot be returned or exchanged:
            </p>
            <ul className="list-disc list-inside space-y-2 text-red-800 dark:text-red-200">
              {nonReturnableItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Exchange Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Exchanges</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                We offer exchanges for items in different sizes or colors. To exchange an item:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Follow the same return process above</li>
                <li>In the return reason, select "Exchange"</li>
                <li>Specify the size or color you'd like to exchange for</li>
                <li>We'll send the new item once we receive your return</li>
              </ol>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <strong>Note:</strong> Exchanges are subject to availability. If the requested item is out of stock, 
                we'll process a refund instead.
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">Need Help with Returns?</h2>
            <p className="mb-6 opacity-90">
              Our customer service team is here to help with any return questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;

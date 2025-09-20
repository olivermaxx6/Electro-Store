import React from 'react';
import { Shield, Clock, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const Warranty: React.FC = () => {
  const warrantyTypes = [
    {
      name: 'Manufacturer Warranty',
      duration: '1-3 years',
      coverage: 'Defects in materials and workmanship',
      icon: Shield
    },
    {
      name: 'Extended Warranty',
      duration: 'Up to 5 years',
      coverage: 'Additional protection beyond manufacturer warranty',
      icon: Clock
    },
    {
      name: 'Service Warranty',
      duration: '90 days',
      coverage: 'Repairs and service work performed by our technicians',
      icon: Wrench
    }
  ];

  const warrantyCoverage = [
    {
      title: 'What\'s Covered',
      items: [
        'Manufacturing defects',
        'Material failures',
        'Workmanship issues',
        'Normal wear and tear (limited)',
        'Power surges (electronics only)'
      ],
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'What\'s Not Covered',
      items: [
        'Accidental damage',
        'Misuse or abuse',
        'Water damage',
        'Cosmetic damage',
        'Normal wear and tear',
        'Damage from unauthorized repairs'
      ],
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400'
    }
  ];

  const warrantyProcess = [
    {
      step: 1,
      title: 'Register Your Product',
      description: 'Register your product online within 30 days of purchase to activate warranty coverage.'
    },
    {
      step: 2,
      title: 'Report the Issue',
      description: 'Contact our support team with your product details and description of the issue.'
    },
    {
      step: 3,
      title: 'Get Authorization',
      description: 'We\'ll review your claim and provide authorization for repair or replacement.'
    },
    {
      step: 4,
      title: 'Repair or Replace',
      description: 'We\'ll repair your item or provide a replacement if repair isn\'t possible.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Warranty Information</h1>
          
          {/* Warranty Types */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Warranty Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {warrantyTypes.map((warranty, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
                  <warranty.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{warranty.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{warranty.duration}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{warranty.coverage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty Coverage */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Warranty Coverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {warrantyCoverage.map((coverage, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <coverage.icon className={`w-6 h-6 ${coverage.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">{coverage.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {coverage.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <span className="text-xs mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty Process */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Warranty Claim Process</h2>
            
            <div className="space-y-6">
              {warrantyProcess.map((process, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {process.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{process.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{process.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Important Warranty Notes</h2>
            <div className="space-y-3 text-blue-800 dark:text-blue-200">
              <p>• Warranty coverage begins from the date of purchase</p>
              <p>• Keep your original receipt and warranty documentation</p>
              <p>• Warranty is non-transferable and applies only to the original purchaser</p>
              <p>• Some products may have specific warranty terms - check product documentation</p>
              <p>• Warranty claims must be submitted within the warranty period</p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">Need Warranty Support?</h2>
            <p className="mb-6 opacity-90">
              Our technical support team is here to help with warranty claims and product issues.
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

export default Warranty;

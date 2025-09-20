import React from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import TitleUpdater from '../../components/common/TitleUpdater';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <TitleUpdater pageTitle="Privacy Policy" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Privacy Policy</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact us for support.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, and communicate with you.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Information Sharing</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Data Security</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                If you have any questions about this Privacy Policy, please contact us at 
                privacy@electro.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
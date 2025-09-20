import React from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import TitleUpdater from '../../components/common/TitleUpdater';
import { useStore } from '../../contexts/StoreContext';

const Terms: React.FC = () => {
  const { storeSettings } = useStore();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <TitleUpdater pageTitle="Terms of Service" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Terms of Service</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                By accessing and using this website, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Use License</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                Permission is granted to temporarily download one copy of the materials on {storeSettings?.store_name || 'Store'}'s 
                website for personal, non-commercial transitory viewing only.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Disclaimer</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                The materials on {storeSettings?.store_name || 'Store'}'s website are provided on an 'as is' basis. {storeSettings?.store_name || 'Store'} makes 
                no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Limitations</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                In no event shall {storeSettings?.store_name || 'Store'} or its suppliers be liable for any damages arising out of 
                the use or inability to use the materials on {storeSettings?.store_name || 'Store'}'s website.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                These terms and conditions are governed by and construed in accordance with the laws 
                of the United States.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
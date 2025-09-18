import React from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useStore } from '../../contexts/StoreContext';

const Terms: React.FC = () => {
  const { storeSettings } = useStore();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600 mb-6">
                By accessing and using this website, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-600 mb-6">
                Permission is granted to temporarily download one copy of the materials on {storeSettings.store_name}'s 
                website for personal, non-commercial transitory viewing only.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
              <p className="text-gray-600 mb-6">
                The materials on {storeSettings.store_name}'s website are provided on an 'as is' basis. {storeSettings.store_name} makes 
                no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitations</h2>
              <p className="text-gray-600 mb-6">
                In no event shall {storeSettings.store_name} or its suppliers be liable for any damages arising out of 
                the use or inability to use the materials on {storeSettings.store_name}'s website.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-600">
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
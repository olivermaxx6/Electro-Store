import React from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Placeholder from '../../components/common/Placeholder';
import TitleUpdater from '../../components/common/TitleUpdater';
import { useStore } from '../../contexts/StoreContext';

const About: React.FC = () => {
  const { storeSettings } = useStore();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="About" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About {storeSettings?.store_name || 'Store'}</h1>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 mb-8">
            {storeSettings?.about_us_picture ? (
              <img 
                src={storeSettings.about_us_picture} 
                alt={`About ${storeSettings?.store_name || 'Store'}`}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            ) : (
              <Placeholder ratio="16/9" className="w-full h-64 mb-6">
                <div className="text-gray-400 dark:text-slate-500">About Us Image</div>
              </Placeholder>
            )}
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Story</h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                {storeSettings?.store_name || 'Store'} is your premier destination for the latest electronics and technology products. 
                Founded with a passion for innovation and quality, we've been serving customers worldwide 
                with the best selection of laptops, smartphones, cameras, and accessories.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                We believe that technology should be accessible to everyone. Our mission is to provide 
                high-quality electronics at competitive prices, backed by exceptional customer service 
                and support.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Why Choose {storeSettings?.store_name || 'Store'}?</h2>
              <ul className="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
                <li>Wide selection of top brands and products</li>
                <li>Competitive pricing and regular deals</li>
                <li>Fast and reliable shipping</li>
                <li>24/7 customer support</li>
                <li>Easy returns and exchanges</li>
                <li>Secure payment processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
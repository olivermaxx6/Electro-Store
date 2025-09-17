import React from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Placeholder from '../../components/common/Placeholder';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Electro</h1>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <Placeholder ratio="16/9" className="w-full h-64 mb-6">
              <div className="text-gray-400">About Us Image</div>
            </Placeholder>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-6">
                Electro is your premier destination for the latest electronics and technology products. 
                Founded with a passion for innovation and quality, we've been serving customers worldwide 
                with the best selection of laptops, smartphones, cameras, and accessories.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                We believe that technology should be accessible to everyone. Our mission is to provide 
                high-quality electronics at competitive prices, backed by exceptional customer service 
                and support.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Electro?</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
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
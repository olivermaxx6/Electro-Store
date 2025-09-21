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
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                Last updated: August 22, 2025
              </p>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                sppix operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). sppix is powered by Shopify, which enables us to provide the Services to you. This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.
              </p>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
                Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Personal Information We Collect or Process</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, including inferences drawn from this personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:
              </p>
              
              <ul className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300 list-disc pl-6 space-y-2">
                <li><strong>Contact details</strong> including your name, address, billing address, shipping address, phone number, and email address.</li>
                <li><strong>Financial information</strong> including credit card, debit card, and financial account numbers, payment card information, financial account information, transaction details, form of payment, payment confirmation and other payment details.</li>
                <li><strong>Account information</strong> including your username, password, security questions, preferences and settings.</li>
                <li><strong>Transaction information</strong> including the items you view, put in your cart, add to your wishlist, or purchase, return, exchange or cancel and your past transactions.</li>
                <li><strong>Communications with us</strong> including the information you include in communications with us, for example, when sending a customer support inquiry.</li>
                <li><strong>Device information</strong> including information about your device, browser, or network connection, your IP address, and other unique identifiers.</li>
                <li><strong>Usage information</strong> including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.</li>
              </ul>
              
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
                privacy@sppix.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
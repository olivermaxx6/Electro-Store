import React from 'react';
import { Search, HelpCircle, Truck, CreditCard, Shield, RotateCcw } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useContactInfo } from '../../hooks/useContactInfo';

const Help: React.FC = () => {
  const { contactInfo, loading, error } = useContactInfo();
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our products, add items to your cart, and proceed to checkout. Follow the steps to complete your purchase."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and payment on delivery."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days."
    },
    {
      question: "Can I return or exchange items?",
      answer: "Yes, you can return items within 30 days of purchase for a full refund or exchange."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within the United States. International shipping will be available soon."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order using the tracking number provided in your order confirmation email."
    }
  ];
  
  const helpCategories = [
    {
      icon: Search,
      title: "Ordering",
      description: "Learn how to place and manage orders"
    },
    {
      icon: Truck,
      title: "Shipping",
      description: "Information about delivery and tracking"
    },
    {
      icon: CreditCard,
      title: "Payment",
      description: "Payment methods and billing questions"
    },
    {
      icon: Shield,
      title: "Security",
      description: "How we protect your information"
    },
    {
      icon: RotateCcw,
      title: "Returns",
      description: "Return and exchange policies"
    },
    {
      icon: HelpCircle,
      title: "General",
      description: "Other frequently asked questions"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
          
          {/* Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Search for help</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {helpCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <category.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Support */}
          <div className="bg-primary rounded-lg p-8 mt-8 text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
            <p className="mb-6 opacity-90">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href={`mailto:${loading || error ? 'contact@store.com' : contactInfo.email || 'contact@store.com'}`}
                className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
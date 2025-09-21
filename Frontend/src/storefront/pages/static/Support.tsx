import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, Search, Send, X, Copy } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import ChatModal from '../../components/chat/ChatModal';

const Support: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const supportMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      availability: 'Available 24/7',
      action: () => setIsChatOpen(true),
      buttonText: 'Start Chat',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      availability: 'Response within 24 hours',
      action: () => setIsEmailDialogOpen(true),
      buttonText: 'Send Email',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      availability: 'Mon-Fri 9AM-6PM EST',
      action: () => setIsPhoneDialogOpen(true),
      buttonText: 'Call Now',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const faqCategories = [
    {
      title: 'Ordering & Payment',
      questions: [
        'How do I place an order?',
        'What payment methods do you accept?',
        'Can I modify my order after placing it?',
        'How do I apply a discount code?'
      ]
    },
    {
      title: 'Shipping & Delivery',
      questions: [
        'How long does shipping take?',
        'Do you offer international shipping?',
        'Can I track my order?',
        'What if my package is damaged?'
      ]
    },
    {
      title: 'Returns & Exchanges',
      questions: [
        'What is your return policy?',
        'How do I return an item?',
        'Can I exchange an item?',
        'How long do refunds take?'
      ]
    },
    {
      title: 'Account & Technical',
      questions: [
        'How do I create an account?',
        'I forgot my password',
        'How do I update my profile?',
        'Is my information secure?'
      ]
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/public/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message. We will get back to you soon!');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setSubmitMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Customer Support</h1>
          
          {/* Support Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Get Help</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportMethods.map((method, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg transition-all duration-300">
                  <method.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{method.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">{method.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">{method.availability}</p>
                  <button
                    onClick={method.action}
                    className={`w-full ${method.color} text-white px-4 py-2 rounded-md font-semibold transition-colors`}
                  >
                    {method.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Send us a Message</h2>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  required
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
                  {submitMessage}
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
                  {submitMessage}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* FAQ Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqCategories.map((category, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.questions.map((question, qIndex) => (
                      <li key={qIndex}>
                        <a
                          href="/help"
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors duration-300"
                        >
                          {question}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Support Hours</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-800 dark:text-blue-200">
              <div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p>24/7 Available</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p>Mon-Fri: 9AM-6PM EST</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p>Response within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/track-order" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Track Order</a>
              <a href="/returns" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Returns</a>
              <a href="/shipping" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Shipping Info</a>
              <a href="/warranty" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Warranty</a>
              <a href="/help" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Help Center</a>
              <a href="/contact" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Contact Us</a>
              <a href="/privacy" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Privacy Policy</a>
              <a href="/terms" className="text-blue-600 hover:text-blue-600-600 transition-colors duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Email Support Dialog */}
      {isEmailDialogOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={() => setIsEmailDialogOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Support</h3>
              <button
                onClick={() => setIsEmailDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Support Email:</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg font-mono text-gray-900 dark:text-white">sppix.ltd@gmail.com</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('sppix.ltd@gmail.com');
                      // You could add a toast notification here
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy email"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    window.open('mailto:sppix.ltd@gmail.com', '_blank');
                    setIsEmailDialogOpen(false);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                >
                  Open Email Client
                </button>
                <button
                  onClick={() => setIsEmailDialogOpen(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Phone Support Dialog */}
      {isPhoneDialogOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={() => setIsPhoneDialogOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone Support</h3>
              <button
                onClick={() => setIsPhoneDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Call us for immediate assistance
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Mon-Fri 9AM-6PM EST
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Support Phone:</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg font-mono text-gray-900 dark:text-white">07379846808</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('07379846808');
                      // You could add a toast notification here
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy phone number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    window.open('tel:07379846808', '_self');
                    setIsPhoneDialogOpen(false);
                  }}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors"
                >
                  Call Now
                </button>
                <button
                  onClick={() => setIsPhoneDialogOpen(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;

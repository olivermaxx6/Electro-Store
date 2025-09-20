import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import TitleUpdater from '../../components/common/TitleUpdater';
import { useContactInfo } from '../../hooks/useContactInfo';

const Contact: React.FC = () => {
  const { contactInfo, loading, error } = useContactInfo();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/public/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message. We will get back to you soon!');
        setFormData({ name: '', email: '', subject: '', message: '' });
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="Contact" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Contact Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
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
                  className={`w-full py-3 px-4 rounded-md transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white'
                      : 'bg-primary dark:bg-blue-600 text-white hover:bg-primary-600 dark:hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Get in touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                      {loading ? (
                        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
                      ) : error ? (
                        <p className="text-gray-400 dark:text-gray-500">Email not available</p>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300">{contactInfo.email || 'Email not set'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Phone</h3>
                      {loading ? (
                        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
                      ) : error ? (
                        <p className="text-gray-400 dark:text-gray-500">Phone not available</p>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300">{contactInfo.phone_number || 'Phone not set'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Address</h3>
                      {loading ? (
                        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
                      ) : error ? (
                        <p className="text-gray-400 dark:text-gray-500">Address not available</p>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300">{contactInfo.address || 'Address not set'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Business Hours</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Support</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our customer support team is here to help you with any questions or concerns. 
                  We typically respond within 24 hours.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• Product inquiries and recommendations</p>
                  <p>• Order status and tracking</p>
                  <p>• Returns and exchanges</p>
                  <p>• Technical support</p>
                  <p>• Account assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
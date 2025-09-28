import React from 'react';
import { X, Phone, MessageCircle } from 'lucide-react';
import { useContactInfo } from '../../hooks/useContactInfo';

interface PhoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'call' | 'message';
}

const PhoneDialog: React.FC<PhoneDialogProps> = ({ isOpen, onClose, type }) => {
  const { contactInfo, loading } = useContactInfo();

  if (!isOpen) return null;

  const handleCall = () => {
    if (contactInfo.phone) {
      window.open(`tel:${contactInfo.phone}`, '_self');
    }
  };

  const handleMessage = () => {
    if (contactInfo.phone) {
      // For WhatsApp (you can modify this for other messaging platforms)
      const message = encodeURIComponent("Hello! I'm interested in your electrical services. Could you please provide me with more information?");
      window.open(`https://wa.me/${contactInfo.phone.replace(/[^\d]/g, '')}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              type === 'call' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {type === 'call' ? (
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {type === 'call' ? 'Call Now' : 'Send Message'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {type === 'call' ? 'Speak with our expert' : 'Get instant support'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading contact information...</p>
            </div>
          ) : contactInfo.phone ? (
            <div className="space-y-6">
              {/* Phone Number Display */}
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Our Phone Number</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {contactInfo.phone}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {type === 'call' ? (
                  <button
                    onClick={handleCall}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </button>
                ) : (
                  <button
                    onClick={handleMessage}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send WhatsApp Message
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Additional Info */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {type === 'call' 
                    ? 'Our team is available to help you with all your electrical needs.'
                    : 'Send us a message and we\'ll get back to you as soon as possible.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Contact Information Not Available
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Phone number is not configured. Please contact the administrator to set up contact information.
              </p>
              <div className="space-y-3">
                <a
                  href="http://localhost:5174/admin/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Go to Admin Settings
                </a>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneDialog;

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useContactInfo } from '../../hooks/useContactInfo';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { formatCurrencySymbol } from '../../lib/format';
import { Currency } from '../../lib/types';

const TopBar: React.FC = () => {
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { settings, loading: settingsLoading } = useStoreSettings();
  
  return (
    <div className="bg-red-600 dark:bg-blue-800 text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm space-y-2 sm:space-y-0">
          {/* Left side - Contact info */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{contactLoading ? 'Loading...' : contactInfo.phone}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{contactLoading ? 'Loading...' : contactInfo.email}</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{contactLoading ? 'Loading...' : `${contactInfo.city}, ${contactInfo.country}`}</span>
            </div>
          </div>
          
          {/* Right side - User actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-1">
              <span className="text-xs sm:text-sm font-semibold">
                {settingsLoading ? 'Loading...' : formatCurrencySymbol((settings?.currency as Currency) || 'USD')}
              </span>
              <span className="text-xs sm:text-sm">{settingsLoading ? 'Loading...' : settings?.currency || 'USD'}</span>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
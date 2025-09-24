import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useContactInfo } from '../../hooks/useContactInfo';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { formatCurrencySymbol } from '../../lib/format';
import { Currency } from '../../lib/types';

const TopBar: React.FC = () => {
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { settings, loading: settingsLoading } = useStoreSettings();
  
  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 text-white border-b border-red-500/20 dark:border-blue-600/30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center py-2 lg:py-3 space-y-2 lg:space-y-0">
          {/* Left side - Contact info */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
            {/* Phone */}
            <div className="flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : contactInfo.phone}
              </span>
            </div>
            
            {/* Email - Hidden on mobile, shown on tablet+ */}
            <div className="hidden sm:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : contactInfo.email}
              </span>
            </div>
            
            {/* Location - Hidden on mobile/tablet, shown on desktop+ */}
            <div className="hidden lg:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : `${contactInfo.city}, ${contactInfo.country}`}
              </span>
            </div>
            
            {/* Business Hours - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">Mon-Fri: 9AM-6PM</span>
            </div>
          </div>
          
          {/* Right side - User actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Currency Display */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/20">
              <span className="text-sm font-bold">
                {settingsLoading ? '...' : formatCurrencySymbol((settings?.currency as Currency) || 'USD')}
              </span>
              <span className="text-xs font-medium opacity-90">
                {settingsLoading ? 'Loading...' : settings?.currency || 'USD'}
              </span>
            </div>
            
            {/* Theme Toggle */}
            <div className="bg-white/10 rounded-lg p-1 backdrop-blur-sm border border-white/20">
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
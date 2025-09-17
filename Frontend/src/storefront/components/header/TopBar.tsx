import React from 'react';
import { Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useContactInfo } from '../../hooks/useContactInfo';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const TopBar: React.FC = () => {
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { settings, loading: settingsLoading } = useStoreSettings();
  
  return (
    <div className="bg-red-600 dark:bg-blue-800 text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center text-sm">
          {/* Left side - Contact info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>{contactLoading ? 'Loading...' : contactInfo.phone_number}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{contactLoading ? 'Loading...' : contactInfo.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{contactLoading ? 'Loading...' : contactInfo.address}</span>
            </div>
          </div>
          
          {/* Right side - User actions */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{settingsLoading ? 'Loading...' : settings?.currency || 'USD'}</span>
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
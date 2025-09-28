import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
// Removed problematic hooks - using direct fetch instead
import { formatCurrencySymbol, currencyOptions } from '../../lib/format';
// import { Currency } from '../../lib/types';




/*Top Bar (where currency and dark mode is showing)*/

interface ContactInfo {
  phone: string;
  email: string;
  city: string;
  country: string;
  businessHours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
}

interface StoreSettings {
  id: number;
  currency: string;
  tax_rate: number;
  shipping_rate: number;
  standard_shipping_rate: number;
  express_shipping_rate: number;
}

const TopBar: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    email: '',
    city: '',
    country: '',
    businessHours: {
      mondayFriday: 'Monday - Friday: 9:00 AM - 6:00 PM',
      saturday: 'Saturday: 10:00 AM - 4:00 PM',
      sunday: 'Sunday: Closed'
    }
  });
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/api/public/store-settings/');
        if (response.ok) {
          const data = await response.json();
          
          // Set contact info
          setContactInfo({
            phone: data.phone || '',
            email: data.email || '',
            city: data.city || '',
            country: data.country || '',
            businessHours: {
              mondayFriday: data.monday_friday_hours || 'Monday - Friday: 9:00 AM - 6:00 PM',
              saturday: data.saturday_hours || 'Saturday: 10:00 AM - 4:00 PM',
              sunday: data.sunday_hours || 'Sunday: Closed'
            }
          });
          
          // Set store settings
          setSettings({
            id: data.id,
            currency: data.currency || 'USD',
            tax_rate: data.tax_rate || 0,
            shipping_rate: data.shipping_rate || 0,
            standard_shipping_rate: data.standard_shipping_rate || 0,
            express_shipping_rate: data.express_shipping_rate || 0
          });
        }
      } catch (error) {
        console.error('Error loading store settings:', error);
      } finally {
        setContactLoading(false);
        setSettingsLoading(false);
      }
    };

    loadData();
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 text-white border-b border-red-500/20 dark:border-blue-600/30 shadow-sm relative z-30">
      <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="flex flex-col lg:flex-row justify-between items-center py-2 lg:py-3 space-y-2 lg:space-y-0">
          {/* Left side - Contact info */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
            {/* Phone */}
            <div className="flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : contactInfo.phone || 'Phone not set'}
              </span>
            </div>
            
            {/* Email - Hidden on mobile, shown on tablet+ */}
            <div className="hidden sm:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : contactInfo.email || 'Email not set'}
              </span>
            </div>
            
            {/* Location - Hidden on mobile/tablet, shown on desktop+ */}
            <div className="hidden lg:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : contactInfo.city && contactInfo.country ? `${contactInfo.city}, ${contactInfo.country}` : 'Location not set'}
              </span>
            </div>
            
            {/* Business Hours - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">
                {contactLoading ? 'Loading...' : contactInfo.businessHours?.mondayFriday ? 
                  contactInfo.businessHours.mondayFriday.replace('Monday - Friday: ', 'Mon-Fri: ') : 
                  'Mon-Fri: 9AM-6PM'}
              </span>
            </div>


    {/* Free Shipping - Hidden on mobile, shown on tablet+ */}
    <div className="hidden md:flex items-center space-x-2 group">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                <span className="text-xs">🚚</span>
              </div>
              <span className="font-medium">
                Free shipping above {formatCurrencySymbol(currencyOptions.find(c => c.code === settings?.currency) || currencyOptions[0])}8
              </span>
            </div>

          </div>

 


          {/* Right side - User actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency Display */}
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/20">
              <span className="text-sm font-bold">
                {settingsLoading ? '...' : formatCurrencySymbol(currencyOptions.find(c => c.code === settings?.currency) || currencyOptions[0])}
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
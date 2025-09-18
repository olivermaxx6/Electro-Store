import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Mail, Navigation } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';

interface StoreAddress {
  street_address: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  monday_friday_hours: string;
  saturday_hours: string;
  sunday_hours: string;
}

const FindUs: React.FC = () => {
  const [storeAddress, setStoreAddress] = useState<StoreAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoreSettings = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/api/public/store-settings/');
        if (response.ok) {
          const data = await response.json();
          setStoreAddress({
            street_address: data.street_address || '',
            city: data.city || '',
            postcode: data.postcode || '',
            country: data.country || '',
            phone: data.phone || '',
            email: data.email || '',
            monday_friday_hours: data.monday_friday_hours || '',
            saturday_hours: data.saturday_hours || '',
            sunday_hours: data.sunday_hours || ''
          });
        } else {
          setError('Failed to load store address');
        }
      } catch (err) {
        setError('Failed to load store address');
        console.error('Error loading store settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoreSettings();
  }, []);

  const getFullAddress = () => {
    if (!storeAddress) return '';
    const parts = [
      storeAddress.street_address,
      storeAddress.city,
      storeAddress.postcode,
      storeAddress.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getGoogleMapsUrl = () => {
    const address = getFullAddress();
    if (!address) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Find Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Store Information */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Store Location</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Address</h3>
                      {loading ? (
                        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
                      ) : error ? (
                        <p className="text-gray-400 dark:text-gray-500">Address not available</p>
                      ) : storeAddress && getFullAddress() ? (
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">{getFullAddress()}</p>
                          <a
                            href={getGoogleMapsUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-primary dark:text-blue-400 hover:text-primary-600 dark:hover:text-blue-300 transition-colors"
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Get Directions
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500">Store address not set</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Business Hours</h3>
                      <div className="text-gray-600 dark:text-gray-300 space-y-1">
                        {loading ? (
                          <p>Loading...</p>
                        ) : storeAddress ? (
                          <>
                            <p>Monday - Friday: {storeAddress.monday_friday_hours || '9:00 AM - 6:00 PM'}</p>
                            <p>Saturday: {storeAddress.saturday_hours || '10:00 AM - 4:00 PM'}</p>
                            <p>Sunday: {storeAddress.sunday_hours || 'Closed'}</p>
                          </>
                        ) : (
                          <>
                            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                            <p>Saturday: 10:00 AM - 4:00 PM</p>
                            <p>Sunday: Closed</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Phone</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {loading ? 'Loading...' : storeAddress ? 
                          (storeAddress.phone || 'Phone not available') : 
                          'Phone not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {loading ? 'Loading...' : storeAddress ? 
                          (storeAddress.email || 'Email not available') : 
                          'Email not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visit Our Store</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Come visit our physical store to see our products in person, get expert advice from our staff, 
                  and experience our customer service firsthand.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• Browse our full product selection</p>
                  <p>• Get hands-on product demonstrations</p>
                  <p>• Receive personalized recommendations</p>
                  <p>• Take advantage of in-store only deals</p>
                  <p>• Free parking available</p>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Store Location</h2>
              
              {loading ? (
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
                </div>
              ) : error ? (
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Map not available</p>
                </div>
              ) : storeAddress && getFullAddress() ? (
                <div className="h-96 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dgs3u5f3vH8j2E&q=${encodeURIComponent(getFullAddress())}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Store Location Map"
                  />
                </div>
              ) : (
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Store address not set</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Please contact the store administrator to set the store address.
                    </p>
                  </div>
                </div>
              )}
              
              {storeAddress && getFullAddress() && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> The map shows the approximate location based on the store address. 
                    For exact directions, please use the "Get Directions" link above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindUs;

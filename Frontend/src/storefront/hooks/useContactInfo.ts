import { useState, useEffect } from 'react';
import { contentRepo } from '../lib/repo';

interface ContactInfo {
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  businessHours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    email: '',
    city: '',
    country: '',
    address: '',
    businessHours: {
      mondayFriday: 'Monday - Friday: 9:00 AM - 6:00 PM',
      saturday: 'Saturday: 10:00 AM - 4:00 PM',
      sunday: 'Sunday: Closed'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        console.log('useContactInfo - Fetching contact info...');
        const data = await contentRepo.getContactInfo();
        console.log('useContactInfo - Received data:', data);
        console.log('useContactInfo - Phone:', data.phone, 'Type:', typeof data.phone);
        console.log('useContactInfo - Email:', data.email, 'Type:', typeof data.email);
        console.log('useContactInfo - City:', data.city, 'Type:', typeof data.city);
        console.log('useContactInfo - Country:', data.country, 'Type:', typeof data.country);
        console.log('useContactInfo - Phone empty check:', !data.phone);
        console.log('useContactInfo - Email empty check:', !data.email);
        console.log('useContactInfo - Phone length:', data.phone?.length);
        console.log('useContactInfo - Email length:', data.email?.length);
        console.log('useContactInfo - Phone truthy check:', !!data.phone);
        console.log('useContactInfo - Email truthy check:', !!data.email);
        setContactInfo(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch contact info:', err);
        setError('Failed to load contact information');
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [refreshTrigger]);

  return { contactInfo, loading, error, refresh };
};

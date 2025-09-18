import { useState, useEffect } from 'react';
import { contentRepo } from '../lib/repo';

interface ContactInfo {
  phone: string;
  email: string;
  city: string;
  country: string;
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    email: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const data = await contentRepo.getContactInfo();
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
  }, []);

  return { contactInfo, loading, error };
};

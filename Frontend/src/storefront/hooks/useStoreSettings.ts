import { useState, useEffect } from 'react';

export interface StoreSettings {
  id: number;
  currency: string;
  tax_rate: number;
  shipping_rate: number;
}

export interface UseStoreSettingsReturn {
  settings: StoreSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL = 'http://127.0.0.1:8001/api/public';

export const useStoreSettings = (): UseStoreSettingsReturn => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/store-settings/1/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch store settings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Store settings API response:', data);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch store settings');
      console.error('Error fetching store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
};

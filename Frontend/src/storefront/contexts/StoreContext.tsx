import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StoreSettings {
  store_name: string;
  store_logo: string | null;
  about_us_picture: string | null;
  favicon: string | null;
  currency: string;
  tax_rate: number;
  shipping_rate: number;
  standard_shipping_rate: number;
  express_shipping_rate: number;
}

interface StoreContextType {
  storeSettings: StoreSettings;
  loading: boolean;
  error: string | null;
  refreshStoreSettings: () => void;
}

interface StoreProviderProps {
  children: ReactNode;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: 'Electro',
    store_logo: null,
    about_us_picture: null,
    favicon: null,
    currency: 'USD',
    tax_rate: 0,
    shipping_rate: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8001/api/public/store-settings/');
        if (response.ok) {
          const data = await response.json();
          setStoreSettings(data);
        } else {
          console.warn('Failed to fetch store settings, using defaults');
        }
      } catch (err) {
        console.error('Error fetching store settings:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreSettings();
  }, []);

  const value = {
    storeSettings,
    loading,
    error,
    refreshStoreSettings: () => {
      const fetchStoreSettings = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://127.0.0.1:8001/api/public/store-settings/');
          if (response.ok) {
            const data = await response.json();
            setStoreSettings(data);
          }
        } catch (err) {
          console.error('Error fetching store settings:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchStoreSettings();
    }
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

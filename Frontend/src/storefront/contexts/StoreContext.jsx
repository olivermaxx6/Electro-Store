import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'Electro',
    store_logo: null,
    about_us_picture: null,
    favicon: null,
    currency: 'USD',
    tax_rate: 0,
    shipping_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
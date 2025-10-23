import { useEffect, useRef, useState } from 'react';
import simpleDataService from '../lib/simpleDataService';
import { useAuth } from '../store/authStore';

// Hook for simple HTTP polling data management
export const useSimpleData = (resourceType, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { token } = useAuth();
  const dataRef = useRef(initialData);
  const isInitialized = useRef(false);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Initialize service
  useEffect(() => {
    if (!isInitialized.current && token) {
      isInitialized.current = true;
      simpleDataService.initialize(token);
    }
  }, [token]);

  // Subscribe to resource-specific updates
  useEffect(() => {
    const unsubscribe = simpleDataService.subscribeToResource(resourceType, (payload) => {
      const { action, data: updateData } = payload;
      
      console.log(`[useSimpleData] ${resourceType} update:`, action, updateData);
      
      setData(updateData);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [resourceType]);

  // Optimistic update functions
  const addItem = (newItem) => {
    setData(currentData => {
      const newData = [...currentData, { ...newItem, id: `temp_${Date.now()}` }];
      setLastUpdate(new Date());
      return newData;
    });
  };

  const updateItem = (id, updates) => {
    setData(currentData => {
      const newData = currentData.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      setLastUpdate(new Date());
      return newData;
    });
  };

  const removeItem = (id) => {
    setData(currentData => {
      const newData = currentData.filter(item => item.id !== id);
      setLastUpdate(new Date());
      return newData;
    });
  };

  return {
    data,
    setData,
    isConnected: true, // Always true for HTTP
    lastUpdate,
    refreshData: () => simpleDataService.requestRefresh(resourceType),
    addItem,
    updateItem,
    removeItem
  };
};

// Hook for connection status (always connected for HTTP)
export const useSimpleConnection = () => {
  const [isConnected] = useState(true);
  const [connectionStatus] = useState({
    isConnected: true,
    reconnectAttempts: 0,
    maxReconnectAttempts: 0,
    method: 'HTTP_POLLING'
  });

  return {
    isConnected,
    connectionStatus,
    reconnect: () => console.log('HTTP polling - no reconnection needed')
  };
};

// Hook for specific resource management with HTTP polling
export const useSimpleResource = (resourceType, fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    data: pollingData, 
    lastUpdate, 
    refreshData: requestRefresh,
    addItem,
    updateItem,
    removeItem
  } = useSimpleData(resourceType, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchFunction();
        const fetchedData = response.data || response;
        setData(fetchedData);
        console.log(`[useSimpleResource] Initial ${resourceType} data loaded:`, fetchedData.length, 'items');
      } catch (err) {
        console.error(`[useSimpleResource] Failed to fetch ${resourceType}:`, err);
        // Don't set error for 404s - just show empty data
        if (err.response?.status === 404) {
          console.log(`[useSimpleResource] ${resourceType} endpoint not found - backend may not be running`);
          setData([]);
        } else {
          setError(err.message || 'Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  // Sync polling data with fetched data
  useEffect(() => {
    if (pollingData.length > 0) {
      setData(pollingData);
    }
  }, [pollingData]);

  // Start polling when component mounts
  useEffect(() => {
    if (fetchFunction) {
      simpleDataService.startPolling(resourceType, fetchFunction);
    }

    return () => {
      simpleDataService.stopPolling(resourceType);
    };
  }, [resourceType, fetchFunction]);

  // Manual refresh function
  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      const fetchedData = response.data || response;
      setData(fetchedData);
      requestRefresh(); // Also request polling refresh
    } catch (err) {
      console.error(`[useSimpleResource] Refresh failed for ${resourceType}:`, err);
      if (err.response?.status === 404) {
        console.log(`[useSimpleResource] ${resourceType} endpoint not found during refresh`);
        setData([]);
      } else {
        setError(err.message || 'Failed to refresh data');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    setData,
    loading,
    error,
    isConnected: true, // Always true for HTTP
    lastUpdate,
    refresh,
    addItem,
    updateItem,
    removeItem
  };
};

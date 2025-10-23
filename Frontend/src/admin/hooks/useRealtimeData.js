import { useEffect, useRef, useState } from 'react';
import realtimeService from '../lib/realtimeService';
import { useAuth } from '../store/authStore';

// Hook for real-time data management
export const useRealtimeData = (resourceType, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { token } = useAuth();
  const dataRef = useRef(initialData);
  const isInitialized = useRef(false);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Initialize real-time connection
  useEffect(() => {
    const initializeRealtime = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        if (token) {
          await realtimeService.connect(token);
          console.log(`[useRealtimeData] Connected for ${resourceType}`);
        }
      } catch (error) {
        console.error(`[useRealtimeData] Connection failed for ${resourceType}:`, error);
      }
    };

    initializeRealtime();

    // Cleanup on unmount
    return () => {
      // Don't disconnect the service as other components might be using it
      // The service will handle cleanup when all components are unmounted
    };
  }, [token, resourceType]);

  // Subscribe to connection status
  useEffect(() => {
    const unsubscribeConnected = realtimeService.subscribe('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = realtimeService.subscribe('disconnected', () => {
      setIsConnected(false);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  // Subscribe to resource-specific updates
  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToResource(resourceType, (payload) => {
      const { action, data: updateData } = payload;
      
      console.log(`[useRealtimeData] ${resourceType} update:`, action, updateData);
      
      setData(currentData => {
        let newData = [...currentData];
        
        switch (action) {
          case 'created':
            // Add new item
            newData = [...currentData, updateData];
            break;
            
          case 'updated':
            // Update existing item
            newData = currentData.map(item => 
              item.id === updateData.id ? { ...item, ...updateData } : item
            );
            break;
            
          case 'deleted':
            // Remove deleted item
            newData = currentData.filter(item => item.id !== updateData.id);
            break;
            
          case 'bulk_update':
            // Replace entire dataset
            newData = updateData;
            break;
            
          default:
            console.warn(`[useRealtimeData] Unknown action: ${action}`);
            return currentData;
        }
        
        setLastUpdate(new Date());
        return newData;
      });
    });

    return unsubscribe;
  }, [resourceType]);

  // Request data refresh
  const refreshData = () => {
    realtimeService.requestRefresh(resourceType);
  };

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
    isConnected,
    lastUpdate,
    refreshData,
    addItem,
    updateItem,
    removeItem
  };
};

// Hook for real-time connection status
export const useRealtimeConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});

  useEffect(() => {
    const unsubscribeConnected = realtimeService.subscribe('connected', () => {
      setIsConnected(true);
      setConnectionStatus(realtimeService.getConnectionStatus());
    });

    const unsubscribeDisconnected = realtimeService.subscribe('disconnected', () => {
      setIsConnected(false);
      setConnectionStatus(realtimeService.getConnectionStatus());
    });

    // Initial status check
    setConnectionStatus(realtimeService.getConnectionStatus());
    setIsConnected(realtimeService.isConnected);

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    reconnect: () => realtimeService.connect(realtimeService.authToken)
  };
};

// Hook for specific resource management
export const useRealtimeResource = (resourceType, fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    data: realtimeData, 
    isConnected, 
    lastUpdate, 
    refreshData: requestRefresh,
    addItem,
    updateItem,
    removeItem
  } = useRealtimeData(resourceType, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchFunction();
        const fetchedData = response.data || response;
        setData(fetchedData);
        console.log(`[useRealtimeResource] Initial ${resourceType} data loaded:`, fetchedData.length, 'items');
      } catch (err) {
        console.error(`[useRealtimeResource] Failed to fetch ${resourceType}:`, err);
        // Don't set error for 404s - just show empty data
        if (err.response?.status === 404) {
          console.log(`[useRealtimeResource] ${resourceType} endpoint not found - backend may not be running`);
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

  // Sync real-time data with fetched data
  useEffect(() => {
    if (realtimeData.length > 0) {
      setData(realtimeData);
    }
  }, [realtimeData]);

  // Manual refresh function
  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      const fetchedData = response.data || response;
      setData(fetchedData);
      requestRefresh(); // Also request real-time refresh
    } catch (err) {
      console.error(`[useRealtimeResource] Refresh failed for ${resourceType}:`, err);
      if (err.response?.status === 404) {
        console.log(`[useRealtimeResource] ${resourceType} endpoint not found during refresh`);
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
    isConnected,
    lastUpdate,
    refresh,
    addItem,
    updateItem,
    removeItem
  };
};

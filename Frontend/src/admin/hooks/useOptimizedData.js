import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../store/authStore';
import { api } from '../lib/api';
import realtimeService from '../lib/realtimeService';

// Centralized data store for optimized fetching
const optimizedDataStore = new Map(); // Stores { resourceType: { data, lastFetch, dataListeners, errorListeners, fetchFunction, timeoutId } }
const POLLING_INTERVAL = 5000; // 5 seconds for better real-time experience
const DEBOUNCE_REFRESH_DELAY = 500; // 0.5 seconds debounce for manual refreshes

const notifyListeners = (resourceType, isError = false) => {
  const storeEntry = optimizedDataStore.get(resourceType);
  if (storeEntry) {
    if (isError && storeEntry.errorListeners && storeEntry.errorListeners.size > 0) {
      // Notify error listeners
      console.log(`[useOptimizedData] Notifying ${storeEntry.errorListeners.size} error listeners for ${resourceType}`);
      storeEntry.errorListeners.forEach(callback => {
        try {
          callback(storeEntry.error);
        } catch (error) {
          console.error(`[useOptimizedData] Error in error listener for ${resourceType}:`, error);
        }
      });
    } else if (!isError && storeEntry.dataListeners && storeEntry.dataListeners.size > 0) {
      // Notify data listeners
      console.log(`[useOptimizedData] Notifying ${storeEntry.dataListeners.size} data listeners for ${resourceType}`);
      storeEntry.dataListeners.forEach(callback => {
        try {
          callback(storeEntry.data);
        } catch (error) {
          console.error(`[useOptimizedData] Error in data listener for ${resourceType}:`, error);
        }
      });
    } else {
      console.log(`[useOptimizedData] No listeners to notify for ${resourceType} (isError: ${isError})`);
    }
  }
};

const fetchDataAndNotify = async (resourceType) => {
  const storeEntry = optimizedDataStore.get(resourceType);
  if (!storeEntry || !storeEntry.fetchFunction) {
    console.warn(`[useOptimizedData] No fetch function for ${resourceType}`);
    return;
  }

  try {
    console.log(`[useOptimizedData] Fetching data for ${resourceType}...`);
    const response = await storeEntry.fetchFunction();
    
    // Handle different response structures
    let newData;
    if (response.data) {
      // If response has data property
      newData = response.data.results || response.data;
    } else if (response.results) {
      // If response has results property directly
      newData = response.results;
    } else {
      // If response is the data itself
      newData = response;
    }

    // Ensure newData is always an array for consistency
    const normalizedData = Array.isArray(newData) ? newData : [];

    // Always update data and notify listeners to ensure UI updates
    storeEntry.data = normalizedData;
    storeEntry.lastFetch = new Date();
    storeEntry.error = null; // Clear any previous errors
    notifyListeners(resourceType);
    console.log(`[useOptimizedData] ${resourceType} data updated with ${normalizedData.length} items.`);
  } catch (error) {
    console.error(`[useOptimizedData] Failed to fetch ${resourceType}:`, error);
    // Store the error in the store entry
    if (storeEntry) {
      storeEntry.error = error;
      storeEntry.lastFetch = new Date(); // Update timestamp to prevent immediate retry
    }
    // Notify listeners of the error
    notifyListeners(resourceType, true);
  }
};

const startPolling = (resourceType, interval = POLLING_INTERVAL) => {
  const storeEntry = optimizedDataStore.get(resourceType);
  if (storeEntry && !storeEntry.intervalId) {
    const intervalId = setInterval(() => fetchDataAndNotify(resourceType), interval);
    storeEntry.intervalId = intervalId;
    console.log(`[useOptimizedData] Started polling for ${resourceType} with ${interval}ms interval`);
  }
};

const stopPolling = (resourceType) => {
  const storeEntry = optimizedDataStore.get(resourceType);
  if (storeEntry && storeEntry.intervalId) {
    clearInterval(storeEntry.intervalId);
    delete storeEntry.intervalId;
    console.log(`[useOptimizedData] Stopped polling for ${resourceType}`);
  }
};

export const useOptimizedData = (resourceType, fetchFunction, initialData = [], options = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthed } = useAuth();
  
  // Extract options
  const { enablePolling = true, pollingInterval = POLLING_INTERVAL, disableWebSocket = false } = options;

  const refreshTimeoutRef = useRef(null);
  const wsUnsubscribeRef = useRef(null);

  // Initialize or update store entry for this resource
  useEffect(() => {
    if (!optimizedDataStore.has(resourceType)) {
      console.log(`[useOptimizedData] Initializing store entry for ${resourceType}`);
      optimizedDataStore.set(resourceType, {
        data: initialData,
        lastFetch: null,
        dataListeners: new Set(),
        errorListeners: new Set(),
        fetchFunction: fetchFunction,
        intervalId: null,
      });
    } else {
      // Update fetch function if it changes (e.g., due to dependencies)
      console.log(`[useOptimizedData] Updating fetch function for existing ${resourceType}`);
      optimizedDataStore.get(resourceType).fetchFunction = fetchFunction;
    }

    const storeEntry = optimizedDataStore.get(resourceType);

    // Add current component's setData as a data listener
    storeEntry.dataListeners.add(setData);

    // Add error listener
    const errorListener = (errorData) => {
      // Only set error if we actually received an error object
      if (errorData && (errorData instanceof Error || errorData.message)) {
        setError(errorData);
        setLoading(false);
      }
    };
    storeEntry.errorListeners.add(errorListener);

    // Initial fetch if not already fetched or if stale
    if (!storeEntry.lastFetch || (new Date() - storeEntry.lastFetch > POLLING_INTERVAL)) {
      setLoading(true);
      setError(null);
      fetchDataAndNotify(resourceType).finally(() => setLoading(false));
    } else {
      setData(storeEntry.data); // Use existing data if fresh
      setError(storeEntry.error); // Set any existing error
      setLoading(false);
    }

    // Subscribe to WebSocket updates if authenticated and WebSocket is not disabled
    if (isAuthed() && token && !disableWebSocket) {
      console.log(`[useOptimizedData] Subscribing to WebSocket updates for ${resourceType}`);
      
      try {
        // Subscribe to resource-specific updates
        wsUnsubscribeRef.current = realtimeService.subscribeToResource(resourceType, (updateData) => {
          console.log(`[useOptimizedData] WebSocket update received for ${resourceType}:`, updateData);
          
          if (updateData.action === 'bulk_update' && updateData.data) {
            // Bulk update - replace all data
            storeEntry.data = updateData.data;
            storeEntry.lastFetch = new Date();
            notifyListeners(resourceType);
          } else if (updateData.action === 'create' && updateData.data) {
            // Add new item
            storeEntry.data = [...storeEntry.data, updateData.data];
            storeEntry.lastFetch = new Date();
            notifyListeners(resourceType);
          } else if (updateData.action === 'update' && updateData.data) {
            // Update existing item
            storeEntry.data = storeEntry.data.map(item => 
              item.id === updateData.data.id ? updateData.data : item
            );
            storeEntry.lastFetch = new Date();
            notifyListeners(resourceType);
          } else if (updateData.action === 'delete' && updateData.data) {
            // Remove item
            storeEntry.data = storeEntry.data.filter(item => item.id !== updateData.data.id);
            storeEntry.lastFetch = new Date();
            notifyListeners(resourceType);
          }
        });

        // Subscribe to general data updates
        const generalUnsubscribe = realtimeService.subscribe('data_update', (updateData) => {
          if (updateData.resource === resourceType) {
            console.log(`[useOptimizedData] General data update for ${resourceType}:`, updateData);
            // Trigger a refresh for this resource
            fetchDataAndNotify(resourceType);
          }
        });

        // Store both unsubscribe functions
        const originalUnsubscribe = wsUnsubscribeRef.current;
        wsUnsubscribeRef.current = () => {
          if (originalUnsubscribe) originalUnsubscribe();
          generalUnsubscribe();
        };
      } catch (error) {
        console.warn(`[useOptimizedData] Failed to subscribe to realtime updates for ${resourceType}:`, error);
        // Fallback to polling if realtime subscription fails and polling is enabled
        if (enablePolling) {
          startPolling(resourceType, pollingInterval);
        }
      }
    } else {
      // Fallback to polling if not authenticated or WebSocket not available and polling is enabled
      if (enablePolling) {
        startPolling(resourceType, pollingInterval);
      }
    }

    return () => {
      // Remove listeners when component unmounts
      storeEntry.dataListeners.delete(setData);
      storeEntry.errorListeners.delete(errorListener);
      
      // Unsubscribe from WebSocket
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
        wsUnsubscribeRef.current = null;
      }
      
      if (storeEntry.dataListeners.size === 0 && storeEntry.errorListeners.size === 0) {
        stopPolling(resourceType);
      }
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [resourceType, fetchFunction, token, isAuthed, enablePolling, pollingInterval, disableWebSocket]);

  const refresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    setLoading(true);
    setError(null);
    // For immediate refresh, don't use debounce delay
    fetchDataAndNotify(resourceType).finally(() => setLoading(false));
  }, [resourceType]);

  const refreshImmediate = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    setLoading(true);
    setError(null);
    // Immediate refresh without any delay
    fetchDataAndNotify(resourceType).finally(() => setLoading(false));
  }, [resourceType]);

  // Expose optimistic update functions (these directly modify local state and then trigger a refresh)
  const addItem = (newItem) => {
    setData(currentData => [...currentData, { ...newItem, id: `temp_${Date.now()}` }]);
    refresh();
  };

  const updateItem = (id, updates) => {
    setData(currentData => currentData.map(item => item.id === id ? { ...item, ...updates } : item));
    refresh();
  };

  const removeItem = (id) => {
    setData(currentData => currentData.filter(item => item.id !== id));
    refresh();
  };

  const setDataDirect = (newData) => {
    setData(newData);
    // Also update the store
    const storeEntry = optimizedDataStore.get(resourceType);
    if (storeEntry) {
      storeEntry.data = newData;
      storeEntry.lastFetch = new Date();
    }
  };

  return {
    data,
    loading,
    error,
    refresh,
    refreshImmediate,
    addItem,
    updateItem,
    removeItem,
    setData: setDataDirect,
    isConnected: realtimeService?.isConnected || false,
  };
};
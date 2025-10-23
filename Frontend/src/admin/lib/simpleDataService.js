// Simple HTTP polling service for admin dashboard (replaces WebSocket)
class SimpleDataService {
  constructor() {
    this.pollingIntervals = new Map();
    this.listeners = new Map();
    this.authToken = null;
    this.baseUrl = '/api';
    this.pollingInterval = 5000; // 5 seconds
  }

  // Initialize the service with auth token
  initialize(token) {
    this.authToken = token;
    console.log('[SimpleDataService] Initialized with token');
  }

  // Start polling for a specific resource
  startPolling(resourceType, fetchFunction) {
    if (this.pollingIntervals.has(resourceType)) {
      console.log(`[SimpleDataService] Already polling ${resourceType}`);
      return;
    }

    console.log(`[SimpleDataService] Starting polling for ${resourceType}`);
    
    const poll = async () => {
      try {
        const response = await fetchFunction();
        const data = response.data || response;
        
        // Notify listeners of data update
        this.notifyListeners(`${resourceType}_update`, { 
          action: 'bulk_update', 
          data: data 
        });
        
        console.log(`[SimpleDataService] ${resourceType} data updated:`, data.length, 'items');
      } catch (error) {
        console.warn(`[SimpleDataService] Polling error for ${resourceType}:`, error.message);
        // Don't stop polling on errors - just log them
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    const intervalId = setInterval(poll, this.pollingInterval);
    this.pollingIntervals.set(resourceType, intervalId);
  }

  // Stop polling for a specific resource
  stopPolling(resourceType) {
    const intervalId = this.pollingIntervals.get(resourceType);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(resourceType);
      console.log(`[SimpleDataService] Stopped polling for ${resourceType}`);
    }
  }

  // Stop all polling
  stopAllPolling() {
    this.pollingIntervals.forEach((intervalId, resourceType) => {
      clearInterval(intervalId);
      console.log(`[SimpleDataService] Stopped polling for ${resourceType}`);
    });
    this.pollingIntervals.clear();
  }

  // Subscribe to specific events
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  // Notify all listeners of an event
  notifyListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[SimpleDataService] Listener error:', error);
        }
      });
    }
  }

  // Subscribe to specific resource updates
  subscribeToResource(resourceType, callback) {
    return this.subscribe(`${resourceType}_update`, callback);
  }

  // Request data refresh for specific resource
  requestRefresh(resourceType) {
    console.log(`[SimpleDataService] Refresh requested for ${resourceType}`);
    // This will trigger the next poll cycle
  }

  // Get connection status (always true for HTTP)
  getConnectionStatus() {
    return {
      isConnected: true,
      reconnectAttempts: 0,
      maxReconnectAttempts: 0,
      method: 'HTTP_POLLING'
    };
  }

  // Cleanup
  cleanup() {
    this.stopAllPolling();
    this.listeners.clear();
    console.log('[SimpleDataService] Cleaned up');
  }
}

// Create singleton instance
const simpleDataService = new SimpleDataService();

export default simpleDataService;

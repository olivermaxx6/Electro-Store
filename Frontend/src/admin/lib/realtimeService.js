/**
 * Simple REST API-based Realtime Service
 * No WebSocket dependencies - uses polling for updates
 */
class RealtimeService {
  constructor() {
    this.isConnected = false;
    this.listeners = new Map();
    this.authToken = null;
    this.pollingInterval = null;
    this.pollingIntervalMs = 5000; // Poll every 5 seconds
  }

  // Simple REST API approach (no WebSocket needed)
  connect(token) {
    this.authToken = token;
    console.log('[RealtimeService] Using REST API approach (no WebSocket required)');
    this.isConnected = true;
    this.lastConnected = new Date();
    this.lastError = null;
    
    // Start polling for updates
    this.startPolling();
    
    // Notify listeners
    this.notifyListeners('connected', {});
    
    return Promise.resolve();
  }

  // Start polling for updates
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, this.pollingIntervalMs);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Poll for updates (placeholder - can be extended)
  pollForUpdates() {
    // This can be extended to poll for specific updates
    // For now, just maintain connection status
    if (!this.isConnected) {
      this.stopPolling();
    }
  }

  // Disconnect
  disconnect() {
    console.log('[RealtimeService] Disconnecting');
    this.isConnected = false;
    this.lastError = null;
    this.stopPolling();
    this.notifyListeners('disconnected', {});
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify listeners
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[RealtimeService] Error in listener:', error);
        }
      });
    }
  }

  // Send message (placeholder for compatibility)
  send(type, data) {
    console.log('[RealtimeService] Send method called (REST API mode):', type, data);
    // In REST API mode, this would typically make an HTTP request
    return Promise.resolve();
  }

  // Subscribe to resource-specific updates (compatibility method)
  subscribeToResource(resourceType, callback) {
    console.log(`[RealtimeService] Subscribing to resource: ${resourceType}`);
    
    // Add the callback to listeners for this resource type
    const eventKey = `resource_${resourceType}`;
    this.on(eventKey, callback);
    
    // Return unsubscribe function
    return () => {
      this.off(eventKey, callback);
    };
  }

  // Subscribe to general events (compatibility method)
  subscribe(event, callback) {
    console.log(`[RealtimeService] Subscribing to event: ${event}`);
    this.on(event, callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  // Get connection status (compatibility method)
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      lastConnected: this.lastConnected || null,
      error: this.lastError || null
    };
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
import React from 'react';
import realtimeService from '../lib/realtimeService';

const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = React.useState({
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  });
  const [showOfflineWarning, setShowOfflineWarning] = React.useState(false);

  React.useEffect(() => {
    // Get initial status
    try {
      setConnectionStatus(realtimeService.getConnectionStatus());
    } catch (error) {
      console.warn('[ConnectionStatus] Error getting connection status:', error);
      // Set default status if method doesn't exist
      setConnectionStatus({
        isConnected: false,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5
      });
    }

    // Subscribe to connection status changes
    const unsubscribeConnected = realtimeService.subscribe('connected', () => {
      try {
        setConnectionStatus(realtimeService.getConnectionStatus());
      } catch (error) {
        console.warn('[ConnectionStatus] Error getting connection status:', error);
      }
      setShowOfflineWarning(false); // Hide warning when connected
    });

    const unsubscribeDisconnected = realtimeService.subscribe('disconnected', () => {
      try {
        setConnectionStatus(realtimeService.getConnectionStatus());
      } catch (error) {
        console.warn('[ConnectionStatus] Error getting connection status:', error);
      }
      // Only show warning after multiple failed attempts
      setTimeout(() => {
        try {
          const status = realtimeService.getConnectionStatus();
          if (!status.isConnected && status.reconnectAttempts > 2) {
            setShowOfflineWarning(true);
          }
        } catch (error) {
          console.warn('[ConnectionStatus] Error getting connection status:', error);
        }
      }, 5000); // Wait 5 seconds before showing warning
    });

    const unsubscribeError = realtimeService.subscribe('error', () => {
      try {
        setConnectionStatus(realtimeService.getConnectionStatus());
      } catch (error) {
        console.warn('[ConnectionStatus] Error getting connection status:', error);
      }
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
    };
  }, []);

  // Don't show offline warning immediately - give WebSocket time to connect
  if (!connectionStatus.isConnected && !showOfflineWarning) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-blue-700 dark:text-blue-300">
          Connecting...
        </span>
      </div>
    );
  }

  if (!connectionStatus.isConnected && showOfflineWarning) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-yellow-700 dark:text-yellow-300">
          Offline Mode
        </span>
        {connectionStatus.reconnectAttempts > 0 && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            (Reconnecting... {connectionStatus.reconnectAttempts}/{connectionStatus.maxReconnectAttempts})
          </span>
        )}
        <button 
          onClick={() => {
            console.log('🔄 Manual WebSocket reconnect triggered');
            const token = localStorage.getItem('access_token') || JSON.parse(localStorage.getItem('auth') || '{}').access;
            if (token) {
              realtimeService.connect(token).catch(error => {
                console.error('Manual reconnect failed:', error);
              });
            }
          }}
          className="ml-2 px-2 py-1 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm text-green-700 dark:text-green-300">
        Live Updates
      </span>
    </div>
  );
};

export default ConnectionStatus;

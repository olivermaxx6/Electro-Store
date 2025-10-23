import { useEffect } from 'react';
import { useAuth } from '../store/authStore';
import realtimeService from '../lib/realtimeService';

const WebSocketInitializer = () => {
  const { isAuthed, user, token } = useAuth();

  useEffect(() => {
    // Auto-connect WebSocket when admin is authenticated
    if (isAuthed() && user && token) {
      console.log('[WebSocketInitializer] Admin authenticated, connecting real-time service...');
      console.log('[WebSocketInitializer] Token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Temporarily disable WebSocket connection to prevent infinite reconnection
      console.log('[WebSocketInitializer] WebSocket connection temporarily disabled');
      return;
      
      realtimeService.connect(token).catch(error => {
        console.warn('[WebSocketInitializer] Failed to connect (backend may not be running):', error.message);
        // Don't show error to user - backend might not be running
      });
    } else if (!isAuthed()) {
      // Disconnect when not authenticated
      console.log('[WebSocketInitializer] Admin not authenticated, disconnecting...');
      realtimeService.disconnect();
    } else {
      console.log('[WebSocketInitializer] Auth state:', { isAuthed: isAuthed(), user: !!user, token: !!token });
    }
  }, [isAuthed, user, token]);

  // Less aggressive reconnection - only try once every 30 seconds
  useEffect(() => {
    if (isAuthed() && user && token) {
      const reconnectInterval = setInterval(() => {
        if (isAuthed() && user && !realtimeService.isConnected && token) {
          console.log('[WebSocketInitializer] Attempting reconnection...');
          realtimeService.connect(token).catch(error => {
            console.warn('[WebSocketInitializer] Reconnection failed (backend may not be running):', error.message);
          });
        }
      }, 30000); // Try to reconnect every 30 seconds instead of 5

      return () => clearInterval(reconnectInterval);
    }
  }, [isAuthed, user, token]);

  return null; // This component doesn't render anything
};

export default WebSocketInitializer;

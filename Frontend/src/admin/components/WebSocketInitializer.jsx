import { useEffect } from 'react';
import { useAuth } from '../store/authStore';
import useChatApiStore from '../../store/chatApiStore';

const WebSocketInitializer = () => {
  const { isAuthed, user } = useAuth();
  const { connectAdminWebSocket, isConnected } = useChatApiStore();

  useEffect(() => {
    // Auto-connect WebSocket when admin is authenticated
    if (isAuthed() && user && !isConnected) {
      console.log('[WebSocketInitializer] Admin authenticated, connecting WebSocket...');
      setTimeout(() => {
        connectAdminWebSocket();
      }, 500); // Small delay to ensure everything is ready
    }
  }, [isAuthed, user, isConnected, connectAdminWebSocket]);

  // Reconnect if connection is lost
  useEffect(() => {
    if (isAuthed() && user && !isConnected) {
      console.log('[WebSocketInitializer] WebSocket disconnected, attempting reconnection...');
      const reconnectInterval = setInterval(() => {
        if (isAuthed() && user && !isConnected) {
          connectAdminWebSocket();
        } else {
          clearInterval(reconnectInterval);
        }
      }, 5000); // Try to reconnect every 5 seconds

      return () => clearInterval(reconnectInterval);
    }
  }, [isAuthed, user, isConnected, connectAdminWebSocket]);

  return null; // This component doesn't render anything
};

export default WebSocketInitializer;

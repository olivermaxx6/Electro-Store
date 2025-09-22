import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/userSlice';
import useChatApiStore from '../../store/chatApiStore';

const WebSocketInitializer: React.FC = () => {
  const currentUser = useSelector(selectCurrentUser);
  const { initializeCustomerChat, isConnected } = useChatApiStore();

  useEffect(() => {
    // Auto-initialize customer chat when user is authenticated
    if (currentUser?.isAuthenticated && !isConnected) {
      console.log('[WebSocketInitializer] User authenticated, initializing customer chat...');
      setTimeout(() => {
        const customerInfo = {
          name: currentUser.name || currentUser.username || 'User',
          email: currentUser.email || 'user@example.com'
        };
        initializeCustomerChat(customerInfo).catch(console.error);
      }, 500); // Small delay to ensure everything is ready
    }
  }, [currentUser, isConnected, initializeCustomerChat]);

  // Reconnect if connection is lost
  useEffect(() => {
    if (currentUser?.isAuthenticated && !isConnected) {
      console.log('[WebSocketInitializer] WebSocket disconnected, attempting reconnection...');
      const reconnectInterval = setInterval(() => {
        if (currentUser?.isAuthenticated && !isConnected) {
          const customerInfo = {
            name: currentUser.name || currentUser.username || 'User',
            email: currentUser.email || 'user@example.com'
          };
          initializeCustomerChat(customerInfo).catch(console.error);
        } else {
          clearInterval(reconnectInterval);
        }
      }, 5000); // Try to reconnect every 5 seconds

      return () => clearInterval(reconnectInterval);
    }
  }, [currentUser, isConnected, initializeCustomerChat]);

  return null; // This component doesn't render anything
};

export default WebSocketInitializer;

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/userSlice';
import chatConnectionService, { ChatConnection, ChatConnectionOptions } from '../../services/chatConnectionService';

export interface UseChatConnectionReturn {
  // Connection state
  activeConnection: ChatConnection | null;
  isConnecting: boolean;
  isConnected: boolean;
  hasError: boolean;
  
  // Connection actions
  createConnection: (options?: Partial<ChatConnectionOptions>) => Promise<ChatConnection>;
  closeConnection: () => void;
  refreshConnection: () => void;
  
  // Connection info
  connectionUrl: string | null;
  chatLink: string | null;
  
  // User connections
  userConnections: ChatConnection[];
}

export const useChatConnection = (): UseChatConnectionReturn => {
  const currentUser = useSelector(selectCurrentUser);
  const [activeConnection, setActiveConnection] = useState<ChatConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [userConnections, setUserConnections] = useState<ChatConnection[]>([]);

  // Subscribe to connection changes
  useEffect(() => {
    const unsubscribe = chatConnectionService.subscribe((connection) => {
      setActiveConnection(connection);
      setIsConnecting(connection?.status === 'connecting');
      setHasError(connection?.status === 'error');
      
      // Update user connections list
      if (currentUser?.id) {
        const connections = chatConnectionService.getUserConnections(currentUser.id);
        setUserConnections(connections);
      }
    });

    // Initialize with current connection
    const currentConn = chatConnectionService.getActiveConnection();
    setActiveConnection(currentConn);
    setIsConnecting(currentConn?.status === 'connecting');
    setHasError(currentConn?.status === 'error');

    return unsubscribe;
  }, [currentUser?.id]);

  // Create a new connection
  const createConnection = useCallback(async (options?: Partial<ChatConnectionOptions>): Promise<ChatConnection> => {
    if (!currentUser?.id) {
      throw new Error('User must be logged in to create a chat connection');
    }

    setIsConnecting(true);
    setHasError(false);

    try {
      const connectionOptions: ChatConnectionOptions = {
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username || 'Anonymous User',
        userEmail: currentUser.email || 'user@example.com',
        createNewRoom: true,
        ...options
      };

      const connection = await chatConnectionService.createConnection(connectionOptions);
      return connection;
    } catch (error) {
      setHasError(true);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [currentUser]);

  // Close current connection
  const closeConnection = useCallback(() => {
    if (activeConnection) {
      chatConnectionService.closeConnection(activeConnection.id);
    }
  }, [activeConnection]);

  // Refresh connection
  const refreshConnection = useCallback(() => {
    if (activeConnection) {
      chatConnectionService.updateActivity(activeConnection.id);
    }
  }, [activeConnection]);

  // Get connection URL
  const connectionUrl = activeConnection?.connectionUrl || null;

  // Get chat link
  const chatLink = activeConnection ? 
    chatConnectionService.generateChatLink(activeConnection.roomId) : 
    null;

  return {
    // Connection state
    activeConnection,
    isConnecting,
    isConnected: activeConnection?.status === 'connected',
    hasError,
    
    // Connection actions
    createConnection,
    closeConnection,
    refreshConnection,
    
    // Connection info
    connectionUrl,
    chatLink,
    
    // User connections
    userConnections
  };
};

export default useChatConnection;

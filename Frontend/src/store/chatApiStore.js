// Chat API Store for WebSocket communication

import { create } from 'zustand';
import { makeWsUrl } from '../lib/wsUrl';

// WebSocket connection states
const WS_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

const useChatApiStore = create((set, get) => ({
  // Connection state
  connectionState: WS_STATES.DISCONNECTED,
  ws: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,

  // Chat state
  currentRoom: null,
  messages: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Connection management
  connect: (roomId = null) => {
    const { ws, connectionState } = get();
    
    // Don't connect if already connected or connecting
    if (ws && (connectionState === WS_STATES.CONNECTED || connectionState === WS_STATES.CONNECTING)) {
      return;
    }

    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found for WebSocket connection');
      set({ connectionState: WS_STATES.ERROR, error: 'No authentication token found' });
      return;
    }

    const wsUrl = makeWsUrl('/admin/chat/');
    const newWs = new WebSocket(`${wsUrl}?token=${token}${roomId ? `&room=${roomId}` : ''}`);

    set({ 
      ws: newWs, 
      connectionState: WS_STATES.CONNECTING,
      reconnectAttempts: 0,
      error: null
    });

    newWs.onopen = () => {
      console.log('WebSocket connected');
      set({ 
        connectionState: WS_STATES.CONNECTED,
        reconnectAttempts: 0,
        error: null
      });
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          set(state => ({
            messages: [...state.messages, data.message],
            unreadCount: data.message.is_admin ? state.unreadCount : state.unreadCount + 1
          }));
        } else if (data.type === 'message_history') {
          set({ messages: data.messages || [] });
        } else if (data.type === 'room_created') {
          set({ currentRoom: data.room });
        } else if (data.type === 'room_updated') {
          set({ currentRoom: data.room });
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.error);
          set({ error: data.error });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        set({ error: 'Failed to parse message' });
      }
    };

    newWs.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      set({ connectionState: WS_STATES.DISCONNECTED });

      // Attempt to reconnect if not a manual close
      if (event.code !== 1000) {
        get().attemptReconnect();
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ connectionState: WS_STATES.ERROR, error: 'WebSocket connection failed' });
    };
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close(1000, 'Manual disconnect');
      set({ 
        ws: null, 
        connectionState: WS_STATES.DISCONNECTED,
        reconnectAttempts: 0
      });
    }
  },

  // Alias for disconnect to match ChatModal expectations
  disconnectWebSocket: () => {
    get().disconnect();
  },

  // Alias for connect to match ChatModal expectations
  connectWebSocket: (roomId = null) => {
    get().connect(roomId);
  },

  // Admin WebSocket connection function
  connectAdminWebSocket: () => {
    get().connect();
  },

  attemptReconnect: () => {
    const { reconnectAttempts, maxReconnectAttempts, reconnectInterval } = get();
    
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      set({ connectionState: WS_STATES.ERROR, error: 'Max reconnection attempts reached' });
      return;
    }

    set({ 
      connectionState: WS_STATES.RECONNECTING,
      reconnectAttempts: reconnectAttempts + 1
    });

    setTimeout(() => {
      get().connect();
    }, reconnectInterval);
  },

  // Retry connection function for ChatModal
  retryConnection: () => {
    set({ error: null, reconnectAttempts: 0 });
    get().connect();
  },

  // Clear error function for ChatModal
  clearError: () => {
    set({ error: null });
  },

  // Customer chat initialization
  initializeCustomerChat: async (customerInfo) => {
    set({ loading: true, error: null });
    
    try {
      // Create a mock room for now - in a real implementation, this would call an API
      const mockRoom = {
        id: `room_${Date.now()}`,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        created_at: new Date().toISOString(),
        is_active: true
      };

      set({ 
        currentRoom: mockRoom,
        loading: false,
        error: null
      });

      // Connect to WebSocket with the room
      get().connect(mockRoom.id);
      
      return { success: true, room: mockRoom };
    } catch (error) {
      console.error('Failed to initialize customer chat:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to initialize chat'
      });
      return { success: false, error: error.message };
    }
  },

  // Get chat room messages
  getChatRoom: async (roomId) => {
    set({ loading: true, error: null });
    
    try {
      // Mock implementation - in a real app, this would call an API
      const mockMessages = [
        {
          id: `msg_${Date.now()}`,
          content: 'Welcome! How can I help you today?',
          sender_type: 'admin',
          sender_name: 'Admin',
          is_read: true,
          created_at: new Date().toISOString()
        }
      ];

      set({ 
        messages: mockMessages,
        loading: false,
        error: null
      });

      // Connect to WebSocket for this room
      get().connect(roomId);
      
      return { success: true, messages: mockMessages };
    } catch (error) {
      console.error('Failed to get chat room:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to load chat room'
      });
      return { success: false, error: error.message };
    }
  },

  // Update customer info
  updateCustomerInfo: async (roomId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUser && currentUser.name) {
        const updatedRoom = {
          ...get().currentRoom,
          customer_name: currentUser.name,
          customer_email: currentUser.email
        };
        
        set({ currentRoom: updatedRoom });
        return { success: true };
      }
      
      return { success: false, error: 'No user information available' };
    } catch (error) {
      console.error('Failed to update customer info:', error);
      return { success: false, error: error.message };
    }
  },

  sendMessage: async (roomId, message) => {
    const { ws, connectionState } = get();
    
    if (!ws || connectionState !== WS_STATES.CONNECTED) {
      console.error('WebSocket not connected');
      return { success: false, error: 'WebSocket not connected' };
    }

    try {
      const messageData = {
        type: 'message',
        content: message,
        room_id: roomId,
        sender_type: 'customer'
      };

      ws.send(JSON.stringify(messageData));
      
      // Add message to local state immediately
      const newMessage = {
        id: `msg_${Date.now()}`,
        content: message,
        sender_type: 'customer',
        sender_name: get().currentRoom?.customer_name || 'You',
        is_read: false,
        created_at: new Date().toISOString()
      };

      set(state => ({
        messages: [...state.messages, newMessage]
      }));

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  markAsRead: () => {
    set({ unreadCount: 0 });
  },

  clearMessages: () => {
    set({ messages: [], unreadCount: 0 });
  },

  // Getters
  isConnected: () => get().connectionState === WS_STATES.CONNECTED,
  isConnecting: () => get().connectionState === WS_STATES.CONNECTING,
  hasUnread: () => get().unreadCount > 0,
}));

export default useChatApiStore;
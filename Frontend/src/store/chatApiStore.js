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

  // Messages
  messages: [],
  unreadCount: 0,

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
      set({ connectionState: WS_STATES.ERROR });
      return;
    }

    const wsUrl = makeWsUrl('/admin/chat/');
    const newWs = new WebSocket(`${wsUrl}?token=${token}${roomId ? `&room=${roomId}` : ''}`);

    set({ 
      ws: newWs, 
      connectionState: WS_STATES.CONNECTING,
      reconnectAttempts: 0
    });

    newWs.onopen = () => {
      console.log('WebSocket connected');
      set({ 
        connectionState: WS_STATES.CONNECTED,
        reconnectAttempts: 0
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
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.error);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
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
      set({ connectionState: WS_STATES.ERROR });
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

  attemptReconnect: () => {
    const { reconnectAttempts, maxReconnectAttempts, reconnectInterval } = get();
    
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      set({ connectionState: WS_STATES.ERROR });
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

  sendMessage: (message, roomId = null) => {
    const { ws, connectionState } = get();
    
    if (!ws || connectionState !== WS_STATES.CONNECTED) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      ws.send(JSON.stringify({
        type: 'message',
        message: message,
        room: roomId
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
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
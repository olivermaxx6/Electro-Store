// Enhanced Chat API Store for Admin Panel with WebSocket support
import { create } from 'zustand';
import axios from 'axios';

// Chat-specific API helper that works with the existing admin setup
const chatApi = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: false,
});

// Get authentication token
const getAuthToken = () => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    return authData.access || localStorage.getItem('access_token');
  } catch {
    return null;
  }
};

// Add request interceptor for authentication
chatApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh and error handling
chatApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 404 errors for disabled chat functionality gracefully
    if (error.response?.status === 404 && originalRequest.url?.includes('/chat-rooms/')) {
      // Don't log the raw error for chat endpoints
      const customError = new Error('Chat functionality is currently disabled');
      customError.response = error.response;
      customError.status = 404;
      return Promise.reject(customError);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = JSON.parse(localStorage.getItem('auth') || '{}').refresh;
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('auth', JSON.stringify({
            ...JSON.parse(localStorage.getItem('auth') || '{}'),
            access
          }));
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return chatApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('auth');
        localStorage.removeItem('access_token');
        window.location.href = '/sign-in';
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced Chat API Store for Admin Panel
const useEnhancedChatApiStore = create((set, get) => ({
  // State
  conversations: [],
  currentRoom: null,
  messages: [],
  loading: false,
  error: null,
  isConnected: false,
  wsConnection: null,
  connectionStatus: { adminOnline: false, activeCustomers: 0 },
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,

  // Actions
  setConversations: (conversations) => set({ conversations }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setConnected: (isConnected) => set({ isConnected }),
  clearError: () => set({ error: null }),

  // Connect to admin WebSocket
  connectAdminWebSocket: () => {
    const { wsConnection, isConnected } = get();
    
    // Don't connect if already connected
    if (wsConnection && isConnected) {
      console.log('Admin WebSocket already connected');
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found for admin WebSocket connection');
        set({ 
          error: 'No authentication token found',
          isConnected: false 
        });
        return;
      }

      const wsUrl = `ws://127.0.0.1:8001/ws/admin/chat/`;
      console.log('Connecting to admin WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Admin WebSocket connected');
        set({ 
          wsConnection: ws,
          isConnected: true,
          error: null,
          reconnectAttempts: 0
        });
        
        // Send authentication token
        ws.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Admin WebSocket message received:', data);
          
          if (data.type === 'room_status') {
            set({ 
              conversations: data.active_rooms || [],
              connectionStatus: {
                adminOnline: true,
                activeCustomers: data.active_customers || 0
              }
            });
          } else if (data.type === 'new_customer_message') {
            // Update conversations list
            get().getAdminChatRooms();
          } else if (data.type === 'room_activity') {
            // Refresh conversations when room activity changes
            get().getAdminChatRooms();
          } else if (data.type === 'chat_message') {
            // Add new message to current room if it matches
            const { currentRoom, messages } = get();
            if (currentRoom && data.room_id === currentRoom.id) {
              set({
                messages: [...messages, data.message]
              });
            }
          } else if (data.type === 'error') {
            set({ error: data.message });
          } else if (data.type === 'pong') {
            console.log('Received pong from admin server');
          }
        } catch (error) {
          console.error('Error parsing admin WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('Admin WebSocket disconnected:', event.code, event.reason);
        set({ 
          wsConnection: null,
          isConnected: false
        });
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && get().reconnectAttempts < get().maxReconnectAttempts) {
          setTimeout(() => {
            get().attemptAdminReconnect();
          }, get().reconnectInterval);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
        set({ 
          error: 'Admin WebSocket connection failed',
          isConnected: false
        });
      };
      
      set({ wsConnection: ws });
      
    } catch (error) {
      console.error('Failed to connect admin WebSocket:', error);
      set({ 
        error: 'Failed to connect to admin chat server',
        isConnected: false
      });
    }
  },

  // Attempt to reconnect admin WebSocket
  attemptAdminReconnect: () => {
    const { reconnectAttempts, maxReconnectAttempts } = get();
    
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max admin reconnection attempts reached');
      set({ 
        error: 'Unable to connect to admin chat server. Please refresh the page.',
        isConnected: false
      });
      return;
    }
    
    console.log(`Attempting to reconnect admin WebSocket (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    set({ reconnectAttempts: reconnectAttempts + 1 });
    
    get().connectAdminWebSocket();
  },

  // Disconnect admin WebSocket
  disconnectWebSocket: () => {
    const { wsConnection } = get();
    if (wsConnection) {
      wsConnection.close(1000, 'Manual disconnect');
      set({ 
        wsConnection: null,
        isConnected: false,
        reconnectAttempts: 0
      });
    }
  },

  // Send admin message via WebSocket
  sendAdminMessage: async (roomId, content) => {
    const { wsConnection, isConnected } = get();
    
    if (isConnected && wsConnection) {
      try {
        // Send via WebSocket
        wsConnection.send(JSON.stringify({
          type: 'admin_message',
          room_id: roomId,
          content: content
        }));
        
        // Add message to local state immediately (optimistic update)
        const tempMessage = {
          id: `temp_${Date.now()}`,
          content: content,
          sender_type: 'admin',
          sender_name: 'Admin',
          is_read: true,
          created_at: new Date().toISOString()
        };
        
        set(state => ({
          messages: [...state.messages, tempMessage]
        }));
        
        return { success: true, message: tempMessage };
      } catch (error) {
        console.error('Failed to send message via WebSocket:', error);
        // Fallback to REST API
        return await get().sendAdminMessageViaAPI(roomId, content);
      }
    } else {
      // Fallback to REST API
      return await get().sendAdminMessageViaAPI(roomId, content);
    }
  },

  // Send admin message via REST API (fallback)
  sendAdminMessageViaAPI: async (roomId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await chatApi.post(`/api/admin/chat-rooms/${roomId}/send_message/`, {
        content
      });

      const message = response.data;
      
      // Add message to current messages
      set((state) => ({
        messages: [...state.messages, message.data],
        loading: false,
        isConnected: true,
        error: null
      }));

      return { success: true, message: message.data };
    } catch (error) {
      console.error('Failed to send message via API:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to send message', 
        loading: false,
        isConnected: false
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  // Delete chat room
  deleteChatRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const response = await chatApi.delete(`/api/admin/chat-rooms/${roomId}/`);

      // Remove the room from conversations list
      set(state => ({
        conversations: state.conversations.filter(room => room.id !== roomId),
        currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom,
        messages: state.currentRoom?.id === roomId ? [] : state.messages,
        loading: false,
        isConnected: true,
        error: null
      }));

      return { success: true };
    } catch (error) {
      console.error('Failed to delete chat room:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to delete chat room', 
        loading: false,
        isConnected: false
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  // Add message to current room
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Get authentication headers
  getAuthHeaders: () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  },

  // API Methods
  getAdminChatRooms: async () => {
    set({ loading: true, error: null });
    try {
      console.log('[Enhanced ChatStore] Loading admin chat rooms...');
      const response = await chatApi.get('/api/admin/chat-rooms/');

      const data = response.data;
      console.log('[Enhanced ChatStore] Chat rooms loaded:', data.results?.length || 0, 'rooms');
      
      set({ 
        conversations: data.results || [], 
        loading: false,
        isConnected: true,
        error: null
      });
      return { success: true, conversations: data.results || [] };
    } catch (error) {
      // Handle 404 error specifically for disabled chat functionality FIRST
      if (error.response?.status === 404) {
        console.log('[Enhanced ChatStore] Chat functionality is disabled on the server');
        set({ 
          conversations: [], 
          loading: false,
          isConnected: false,
          error: 'Chat functionality is currently disabled'
        });
        return { success: false, error: 'Chat functionality is currently disabled' };
      }
      
      // Log other errors
      console.error('[Enhanced ChatStore] Failed to fetch chat rooms:', error);
      
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch chat rooms', 
        loading: false,
        isConnected: false
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  getAdminChatRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      console.log('[Enhanced ChatStore] Loading messages for room:', roomId);
      const response = await chatApi.get(`/api/admin/chat-rooms/${roomId}/get_messages/`);

      const messages = response.data;
      console.log('[Enhanced ChatStore] Messages loaded:', messages?.length || 0, 'messages');
      
      set({ 
        messages: messages || [], 
        loading: false,
        isConnected: true,
        error: null
      });
      return { success: true, messages: messages || [] };
    } catch (error) {
      console.error('[Enhanced ChatStore] Failed to fetch chat room messages:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch messages', 
        loading: false,
        isConnected: false
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  markAsRead: async (roomId) => {
    try {
      const response = await chatApi.patch(`/api/admin/chat-rooms/${roomId}/mark_as_read/`);

      set({ isConnected: true, error: null });
      return { success: true };
    } catch (error) {
      console.error('Failed to mark as read:', error);
      set({ 
        isConnected: false,
        error: error.response?.data?.detail || error.message || 'Failed to mark as read'
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  // Legacy methods for compatibility
  sendMessage: async (roomId, message) => {
    return get().sendAdminMessage(roomId, message);
  },

  joinRoom: async (roomId) => {
    set({ currentRoom: { id: roomId } });
    return get().getAdminChatRoom(roomId);
  },

  leaveRoom: async () => {
    set({ currentRoom: null, messages: [] });
    return { success: true };
  },

  getRooms: async () => {
    return get().getAdminChatRooms();
  },

  getMessages: async (roomId) => {
    return get().getAdminChatRoom(roomId);
  }
}));

export default useEnhancedChatApiStore;

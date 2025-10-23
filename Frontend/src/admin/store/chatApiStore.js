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

// Chat API Store for Admin Panel
const useChatApiStore = create((set, get) => ({
  // State
  conversations: [],
  currentRoom: null,
  messages: [],
  loading: false,
  error: null,
  isConnected: true, // Start as connected since we use REST API
  connectionStatus: { adminOnline: false, activeCustomers: 0 },

  // Actions
  setConversations: (conversations) => set({ conversations }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setConnected: (isConnected) => set({ isConnected }),
  clearError: () => set({ error: null }),

  // Delete chat room
  deleteChatRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const response = await chatApi.delete(`/admin/chat-rooms/${roomId}/`);

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
      console.log('[ChatStore] Loading admin chat rooms...');
      const response = await chatApi.get('/admin/chat-rooms/');

      const data = response.data;
      console.log('[ChatStore] Chat rooms loaded:', data.results?.length || 0, 'rooms');
      console.log('[ChatStore] Chat rooms data:', data);
      
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
        console.log('[ChatStore] Chat functionality is disabled on the server');
        set({ 
          conversations: [], 
          loading: false,
          isConnected: false,
          error: 'Chat functionality is currently disabled'
        });
        return { success: false, error: 'Chat functionality is currently disabled' };
      }
      
      // Log other errors
      console.error('[ChatStore] Failed to fetch chat rooms:', error);
      
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
      console.log('[ChatStore] Loading messages for room:', roomId);
      const response = await chatApi.get(`/admin/chat-rooms/${roomId}/get_messages/`);

      const messages = response.data;
      console.log('[ChatStore] Messages loaded:', messages?.length || 0, 'messages');
      console.log('[ChatStore] Messages data:', messages);
      
      set({ 
        messages: messages || [], 
        loading: false,
        isConnected: true,
        error: null
      });
      return { success: true, messages: messages || [] };
    } catch (error) {
      console.error('[ChatStore] Failed to fetch chat room messages:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch messages', 
        loading: false,
        isConnected: false
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  sendAdminMessage: async (roomId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await chatApi.post(`/admin/chat-rooms/${roomId}/send_message/`, {
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
      console.error('Failed to send message:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to send message', 
        loading: false,
        isConnected: false
      });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  markAsRead: async (roomId) => {
    try {
      const response = await chatApi.patch(`/admin/chat-rooms/${roomId}/mark_as_read/`);

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

  // Simple REST API methods (no WebSocket needed)
  connectAdminWebSocket: () => {
    // Simple REST API approach - no WebSocket needed
    console.log('Using REST API chat system (no WebSocket required)');
    set({ isConnected: true, error: null });
  },

  disconnectWebSocket: () => {
    // No WebSocket to disconnect - keep connected for REST API
    console.log('REST API chat system - staying connected');
    set({ isConnected: true });
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

export default useChatApiStore;
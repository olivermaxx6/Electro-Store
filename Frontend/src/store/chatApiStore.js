import { create } from 'zustand';
import axios from 'axios';
import { makeWsUrl } from '../lib/wsUrl';

// Import admin API
import { api as adminApi } from '../admin/lib/api';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper function to get auth token
const getAuthToken = () => {
  try {
    // First try to get from localStorage.access_token (direct ACCESS token)
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      return accessToken;
    }
    // Fallback to auth object
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    return authData.access;
  } catch {
    return null;
  }
};

// Generate a simple user ID for demo purposes
const generateUserId = () => {
  const stored = localStorage.getItem('demo_user_id');
  if (stored) return stored;
  const newId = 'user_' + Date.now();
  localStorage.setItem('demo_user_id', newId);
  return newId;
};

const useChatApiStore = create((set, get) => ({
  // Chat conversations from backend
  conversations: [],
  currentRoom: null,
  messages: [],
  loading: false,
  error: null,
  
  // User change tracking
  lastToken: getAuthToken(),
  
  // WebSocket connections
  socket: null,
  isConnected: false,
  isConnecting: false,
  
  // Current user ID (for demo purposes)
  currentUserId: generateUserId(),
  
  // WebSocket connection management
  connectWebSocket(roomId, userType = 'customer') {
    const { socket, currentRoom, isConnecting } = get();
    
    // Don't reconnect if already connected to the same room
    if (socket && currentRoom && currentRoom.id === roomId && socket.readyState === WebSocket.OPEN) {
      console.log(`[WebSocket] Already connected to room ${roomId}, skipping reconnection`);
      return socket;
    }
    
    // Don't start new connection if already connecting
    if (isConnecting) {
      console.log(`[WebSocket] Already connecting, skipping new connection attempt`);
      return socket;
    }
    
    // Set connecting state
    set({ isConnecting: true });
    
    // Close existing connection
    if (socket) {
      console.log(`[WebSocket] Closing existing connection to connect to room ${roomId}`);
      socket.close();
    }
    
    // Get auth token for admin connections
    const token = getAuthToken();
    
    // Build WebSocket URL correctly
    let wsUrl;
    if (userType === 'admin') {
      // Admin WebSocket connection
      const wsBase = import.meta.env.VITE_WS_BASE || 'ws://127.0.0.1:8001';
      const qp = token ? `?token=${encodeURIComponent(token)}` : "";
      wsUrl = `${wsBase}/ws/admin/chat/${qp}`;
    } else {
      // Customer WebSocket connection
      const wsBase = import.meta.env.VITE_WS_BASE || 'ws://127.0.0.1:8001';
      wsUrl = `${wsBase}/ws/chat/${roomId}/`;
    }
    
    console.log(`[WebSocket] Connecting to: ${wsUrl}`);
    console.log(`[WebSocket] Token present: ${!!token}`);
    console.log(`[WebSocket] User type: ${userType}`);
    console.log(`[WebSocket] Room ID: ${roomId}`);
    
    try {
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log(`${userType === 'admin' ? 'Admin' : 'Customer'} WS OPEN`);
        console.log(`[WebSocket] ${userType} connection established successfully`);
        set({ isConnected: true, isConnecting: false, error: null }); // Clear any previous errors
      };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, message, rooms } = data;
        
        console.log(`[WebSocket] ${userType} received message:`, { type, data });
        
        switch (type) {
          case 'chat_message':
            // Add new message to current messages (avoid duplicates)
            set((state) => {
              const messageExists = state.messages.some(msg => msg.id === message.id);
              if (messageExists) {
                console.log('Message already exists, skipping duplicate:', message.id);
                return state;
              }
              return {
                messages: [...state.messages, message]
              };
            });
            break;
            
          case 'room_list':
            // Update conversations list for admin
            set({ conversations: rooms || [] });
            break;
            
          case 'room_info':
            // Update current room info
            set({ currentRoom: data.room });
            break;
            
          case 'new_customer_message':
            // Notify admin of new customer message
            console.log('New customer message received:', data);
            console.log('Refreshing admin chat rooms...');
            get().refreshAdminChatRooms();
            
            // If this message is for the currently selected room, add it to messages
            const { currentRoom } = get();
            if (currentRoom && data.room_id === currentRoom.id) {
              console.log('Adding message to current room:', data.message);
              set((state) => {
                const messageExists = state.messages.some(msg => msg.id === data.message.id);
                if (!messageExists) {
                  return {
                    messages: [...state.messages, data.message]
                  };
                }
                return state;
              });
            }
            break;
            
          case 'admin_message_sent':
            // Admin message was sent to a room
            console.log('Admin message sent:', data);
            get().refreshAdminChatRooms();
            
            // Add admin message to current room messages
            const { currentRoom: adminCurrentRoom } = get();
            if (adminCurrentRoom && data.room_id === adminCurrentRoom.id) {
              console.log('Adding admin message to current room:', data.message);
              set((state) => {
                const messageExists = state.messages.some(msg => msg.id === data.message.id);
                if (!messageExists) {
                  return {
                    messages: [...state.messages, data.message]
                  };
                }
                return state;
              });
            }
            break;
            
          default:
            console.log('Unknown message type:', type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    newSocket.onclose = (e) => {
      console.warn(`${userType === 'admin' ? 'Admin' : 'Customer'} WS CLOSED`, e.code, e.reason);
      set({ isConnected: false, isConnecting: false });
      
      // Handle specific close codes
      let errorMessage = null;
      if (e.code === 4401) {
        errorMessage = "Session expired or invalid. Please sign in again.";
      } else if (e.code === 4403) {
        errorMessage = "Your account lacks admin permissions.";
      } else if (e.code === 4404) {
        errorMessage = "Chat room not found.";
      } else if (e.code === 1011) {
        errorMessage = "Server error. Please try again.";
      } else if (e.code !== 1000 && e.code !== 1001) {
        errorMessage = `Connection failed (code ${e.code}). Check network/server.`;
      }
      
      if (errorMessage) {
        set({ error: errorMessage });
      }
      
      // Don't auto-reconnect for certain error codes
      if (e.code === 4401 || e.code === 4403) {
        console.log('Not attempting reconnection due to authentication/authorization error');
        return;
      }
    };
    
      newSocket.onerror = (e) => {
        console.error(`${userType === 'admin' ? 'Admin' : 'Customer'} WS ERROR`, e);
        console.error(`[WebSocket] ${userType} connection error:`, e);
        set({ 
          isConnected: false, 
          isConnecting: false,
          error: "WebSocket connection error. Please check your network connection." 
        });
      };
    
      set({ socket: newSocket });
      return newSocket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      set({ isConnected: false, error: 'Failed to create WebSocket connection' });
      return null;
    }
  },
  
  disconnectWebSocket() {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },
  
  sendWebSocketMessage(messageData) {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify(messageData));
    } else {
      console.error('WebSocket not connected');
    }
  },
  
  // API functions
  async createChatRoom(customerInfo = {}) {
    set({ loading: true, error: null });
    
    try {
      // Get authentication token for the request
      const token = getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/public/chat-rooms/`, {
        customer_name: customerInfo.name || 'Anonymous User',
        customer_email: customerInfo.email || 'user@example.com',
        customer_phone: customerInfo.phone || '',
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const room = response.data;
      
      // Connect WebSocket for this room
      get().connectWebSocket(room.id, 'customer');
      
      set({ 
        currentRoom: room,
        loading: false 
      });
      
      return room;
    } catch (error) {
      console.error('Error creating chat room:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to create chat room',
        loading: false 
      });
      throw error;
    }
  },
  
  async getChatRooms() {
    set({ loading: true, error: null });
    
    try {
      // Check if user has changed and clear state if needed
      get().checkUserChange();
      
      // Get authentication token for the request
      const token = getAuthToken();
      
      const response = await axios.get(`${API_BASE_URL}/public/chat-rooms/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const conversations = response.data.results || response.data || [];
      set({ 
        conversations: Array.isArray(conversations) ? conversations : [],
        loading: false 
      });
      
      return conversations;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch chat rooms',
        loading: false 
      });
      throw error;
    }
  },
  
  async getChatRoom(roomId) {
    set({ loading: true, error: null });
    
    try {
      // Get authentication token for the request
      const token = getAuthToken();
      
      const response = await axios.get(`${API_BASE_URL}/public/chat-rooms/${roomId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const room = response.data;
      
      // Connect WebSocket for this room (only if not already connected)
      get().connectWebSocket(roomId, 'customer');
      
      // Also fetch messages separately to ensure we have the latest
      try {
        const messagesResponse = await axios.get(`${API_BASE_URL}/public/chat-rooms/${roomId}/get_messages/`);
        set({ 
          currentRoom: room,
          messages: messagesResponse.data || [],
          loading: false 
        });
      } catch (msgError) {
        console.warn('Could not fetch messages separately, using room messages:', msgError);
        set({ 
          currentRoom: room,
          messages: room.messages || [],
          loading: false 
        });
      }
      
      return room;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch chat room',
        loading: false 
      });
      throw error;
    }
  },
  
  async updateCustomerInfo(roomId) {
    try {
      // Get authentication token for the request
      const token = getAuthToken();
      
      const response = await axios.patch(`${API_BASE_URL}/public/chat-rooms/${roomId}/update_customer_info/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update the current room with new customer info
      const { currentRoom } = get();
      if (currentRoom && currentRoom.id === roomId) {
        set({
          currentRoom: {
            ...currentRoom,
            customer_name: response.data.customer_name,
            customer_email: response.data.customer_email
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating customer info:', error);
      // Don't throw error as this is not critical
      return null;
    }
  },
  
  async sendMessage(roomId, content) {
    if (!content.trim()) return;
    
    set({ loading: true, error: null });
    
    try {
      // Get authentication token for the request
      const token = getAuthToken();
      
      // Send via REST API for persistence (this will also trigger WebSocket broadcast)
      const response = await axios.post(`${API_BASE_URL}/public/chat-rooms/${roomId}/send_message/`, {
        content: content.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const newMessage = response.data;
      
      // Don't add to local state here - let WebSocket handle it to avoid duplicates
      set({ loading: false });
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to send message',
        loading: false 
      });
      throw error;
    }
  },
  
  async getMessages(roomId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/chat-rooms/${roomId}/get_messages/`);
      set({ messages: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch messages'
      });
      throw error;
    }
  },
  
  // Admin functions (for admin panel)
  async getAdminChatRooms() {
    set({ loading: true, error: null });
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found for admin chat rooms');
        set({ 
          error: 'Authentication required. Please sign in again.',
          loading: false 
        });
        return [];
      }
      
      console.log('Fetching admin chat rooms with token:', token.substring(0, 20) + '...');
      
      const response = await adminApi.get('/api/admin/chat-rooms/');
      
      console.log('Admin chat rooms response:', response.data);
      
      const conversations = response.data.results || response.data || [];
      console.log('Processed conversations:', conversations);
      console.log('Number of conversations:', conversations.length);
      
      set({ 
        conversations: Array.isArray(conversations) ? conversations : [],
        loading: false 
      });
      
      return conversations;
    } catch (error) {
      console.error('Error fetching admin chat rooms:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Failed to fetch chat rooms';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication expired. Please sign in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin permissions required.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      throw error;
    }
  },
  
  async refreshAdminChatRooms() {
    // Refresh admin chat rooms without showing loading state
    try {
      console.log('Refreshing admin chat rooms...');
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await adminApi.get('/api/admin/chat-rooms/');
      console.log('Admin chat rooms response:', response.data);
      
      const conversations = response.data.results || response.data || [];
      set({ 
        conversations: Array.isArray(conversations) ? conversations : []
      });
      console.log('Updated conversations:', conversations);
      
      return conversations;
    } catch (error) {
      console.error('Error refreshing admin chat rooms:', error);
    }
  },

  async getAdminChatRoom(roomId) {
    set({ loading: true, error: null });
    
    try {
      const token = getAuthToken();
      console.log('Admin getAdminChatRoom - Token found:', !!token);
      console.log('Admin getAdminChatRoom - Room ID:', roomId);
      
      if (!token) {
        console.error('No authentication token found for admin chat room');
        throw new Error('No authentication token found');
      }
      
      console.log('Making request to:', `/api/admin/chat-rooms/${roomId}/`);
      const response = await adminApi.get(`/api/admin/chat-rooms/${roomId}/`);
      console.log('Admin chat room response:', response.data);
      
      const room = response.data;
      
      // Also fetch messages separately to ensure we have the latest
      try {
        const messagesResponse = await adminApi.get(`/api/admin/chat-rooms/${roomId}/get_messages/`);
        set({ 
          currentRoom: room,
          messages: messagesResponse.data || [],
          loading: false 
        });
      } catch (msgError) {
        console.warn('Could not fetch messages separately, using room messages:', msgError);
        set({ 
          currentRoom: room,
          messages: room.messages || [],
          loading: false 
        });
      }
      
      return room;
    } catch (error) {
      console.error('Error fetching admin chat room:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.error('Authentication failed - redirecting to sign in');
        // This might trigger a redirect to sign-in page
      }
      
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch chat room',
        loading: false 
      });
      throw error;
    }
  },
  
  async sendAdminMessage(roomId, content) {
    if (!content.trim()) return;
    
    set({ loading: true, error: null });
    
    try {
      // Send via REST API for persistence (this will also trigger WebSocket broadcast)
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await adminApi.post(`/api/admin/chat-rooms/${roomId}/send_message/`, {
        content: content.trim()
      });
      
      const newMessage = response.data;
      
      // Don't add to local state here - let WebSocket handle it to avoid duplicates
      set({ loading: false });
      
      return newMessage;
    } catch (error) {
      console.error('Error sending admin message:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to send message',
        loading: false 
      });
      throw error;
    }
  },
  
  async markAsRead(roomId) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await adminApi.post(`/api/admin/chat-rooms/${roomId}/mark_as_read/`, {});
      
      // Update local state to reflect read status
      set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === roomId ? { ...conv, unread_count: 0 } : conv
        )
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },
  
  // Connect admin WebSocket
  connectAdminWebSocket() {
    const token = getAuthToken();
    if (!token) {
      console.warn('No authentication token found for admin WebSocket');
      set({ 
        error: 'Authentication required for real-time chat. Please sign in again.',
        isConnected: false 
      });
      return;
    }
    
    console.log('Connecting admin WebSocket with token:', token.substring(0, 20) + '...');
    get().connectWebSocket(null, 'admin');
  },
  
  // Utility functions
  setCurrentRoom(room) {
    set({ currentRoom: room, messages: room?.messages || [] });
    
    // Connect to room-specific WebSocket if it's a customer room
    if (room && room.id) {
      get().connectWebSocket(room.id, 'customer');
    }
  },

  // Clear error and retry connection
  retryConnection() {
    const { currentRoom } = get();
    if (currentRoom && currentRoom.id) {
      get().connectWebSocket(currentRoom.id, 'customer');
    } else {
      // Retry admin connection
      get().connectAdminWebSocket();
    }
  },
  
  clearError() {
    set({ error: null });
  },
  
  // Clear all chat state (useful when user changes)
  clearChatState() {
    console.log('Clearing chat state due to user change');
    set({
      conversations: [],
      currentRoom: null,
      messages: [],
      loading: false,
      error: null,
      isConnected: false,
      isConnecting: false,
      socket: null
    });
  },
  
  // Check if user has changed and clear state if needed
  checkUserChange() {
    const currentToken = getAuthToken();
    const { lastToken } = get();
    
    if (currentToken !== lastToken) {
      console.log('User token changed, clearing chat state');
      get().clearChatState();
      set({ lastToken: currentToken });
    }
  },
  
  // Initialize chat room for customer
  async initializeCustomerChat(customerInfo = {}) {
    try {
      // Check if user has changed and clear state if needed
      get().checkUserChange();
      
      // First try to get existing chat rooms for this user
      const rooms = await get().getChatRooms();
      
      if (rooms.length > 0) {
        // Use the most recent active room for this user
        const activeRoom = rooms.find(room => room.status === 'active') || rooms[0];
        await get().getChatRoom(activeRoom.id);
        return activeRoom;
      } else {
        // Create a new room for this user
        const newRoom = await get().createChatRoom(customerInfo);
        // Connect WebSocket after room creation
        if (newRoom && newRoom.id) {
          get().connectWebSocket(newRoom.id, 'customer');
        }
        return newRoom;
      }
    } catch (error) {
      console.error('Error initializing customer chat:', error);
      throw error;
    }
  }
}));

export default useChatApiStore;
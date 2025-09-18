import { create } from 'zustand';
import axios from 'axios';
import { makeWsUrl } from '../lib/wsUrl';

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
  
  // WebSocket connections
  socket: null,
  isConnected: false,
  
  // Current user ID (for demo purposes)
  currentUserId: generateUserId(),
  
  // WebSocket connection management
  connectWebSocket(roomId, userType = 'customer') {
    const { socket } = get();
    
    // Close existing connection
    if (socket) {
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
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log(`${userType === 'admin' ? 'Admin' : 'Customer'} WS OPEN`);
      set({ isConnected: true, error: null }); // Clear any previous errors
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, message, rooms } = data;
        
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
            get().refreshAdminChatRooms();
            break;
            
          case 'admin_message_sent':
            // Admin message was sent to a room
            console.log('Admin message sent:', data);
            get().refreshAdminChatRooms();
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
      set({ isConnected: false });
      
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
    };
    
    newSocket.onerror = (e) => {
      console.error(`${userType === 'admin' ? 'Admin' : 'Customer'} WS ERROR`, e);
      set({ 
        isConnected: false, 
        error: "WebSocket connection error. Please check your network connection." 
      });
    };
    
    set({ socket: newSocket });
    return newSocket;
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
      const response = await axios.post(`${API_BASE_URL}/public/chat-rooms/`, {
        customer_name: customerInfo.name || 'Anonymous User',
        customer_email: customerInfo.email || 'user@example.com',
        customer_phone: customerInfo.phone || '',
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
      const response = await axios.get(`${API_BASE_URL}/public/chat-rooms/`);
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
      const response = await axios.get(`${API_BASE_URL}/public/chat-rooms/${roomId}/`);
      const room = response.data;
      
      // Connect WebSocket for this room
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
  
  async sendMessage(roomId, content) {
    if (!content.trim()) return;
    
    set({ loading: true, error: null });
    
    try {
      // Send via REST API for persistence (this will also trigger WebSocket broadcast)
      const response = await axios.post(`${API_BASE_URL}/public/chat-rooms/${roomId}/send_message/`, {
        content: content.trim()
      });
      
      const newMessage = response.data;
      
      // Add message to local state immediately for better UX
      set((state) => ({
        messages: [...state.messages, newMessage],
        loading: false
      }));
      
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
      
      const response = await axios.get(`${API_BASE_URL}/admin/chat-rooms/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Admin chat rooms response:', response.data);
      
      const conversations = response.data.results || response.data || [];
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
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/chat-rooms/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const conversations = response.data.results || response.data || [];
      set({ 
        conversations: Array.isArray(conversations) ? conversations : []
      });
      
      return conversations;
    } catch (error) {
      console.error('Error refreshing admin chat rooms:', error);
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
      
      const response = await axios.post(`${API_BASE_URL}/admin/chat-rooms/${roomId}/send_message/`, {
        content: content.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const newMessage = response.data;
      
      // Add message to local state immediately for better UX
      set((state) => ({
        messages: [...state.messages, newMessage],
        loading: false
      }));
      
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
      
      await axios.post(`${API_BASE_URL}/admin/chat-rooms/${roomId}/mark_as_read/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
  
  // Initialize chat room for customer
  async initializeCustomerChat(customerInfo = {}) {
    try {
      // First try to get existing chat rooms
      const rooms = await get().getChatRooms();
      
      if (rooms.length > 0) {
        // Use the most recent active room
        const activeRoom = rooms.find(room => room.status === 'active') || rooms[0];
        await get().getChatRoom(activeRoom.id);
        return activeRoom;
      } else {
        // Create a new room
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
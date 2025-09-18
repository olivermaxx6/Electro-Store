import { create } from 'zustand';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper function to get auth token
const getAuthToken = () => {
  try {
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
    
    // Determine WebSocket URL based on user type
    let wsUrl = userType === 'admin' 
      ? 'ws://127.0.0.1:8001/ws/admin/chat/'
      : `ws://127.0.0.1:8001/ws/chat/${roomId}/`;
    
    // Add token to query parameters for admin connections
    if (userType === 'admin' && token) {
      wsUrl += `?token=${encodeURIComponent(token)}`;
    }
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true });
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, message, rooms } = data;
        
        switch (type) {
          case 'chat_message':
            // Add new message to current messages
            set((state) => ({
              messages: [...state.messages, message]
            }));
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
            get().refreshAdminChatRooms();
            break;
            
          default:
            console.log('Unknown message type:', type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ isConnected: false });
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
      
      set({ 
        currentRoom: room,
        messages: room.messages || [],
        loading: false 
      });
      
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
      // Send via WebSocket for real-time delivery
      get().sendWebSocketMessage({
        type: 'chat_message',
        content: content.trim()
      });
      
      // Also send via REST API for persistence
      const response = await axios.post(`${API_BASE_URL}/public/chat-rooms/${roomId}/send_message/`, {
        content: content.trim()
      });
      
      const newMessage = response.data;
      
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
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/chat-rooms/`, {
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
      console.error('Error fetching admin chat rooms:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch chat rooms',
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
      // Send via WebSocket for real-time delivery
      get().sendWebSocketMessage({
        type: 'admin_message',
        room_id: roomId,
        content: content.trim()
      });
      
      // Also send via REST API for persistence
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
        return await get().createChatRoom(customerInfo);
      }
    } catch (error) {
      console.error('Error initializing customer chat:', error);
      throw error;
    }
  }
}));

export default useChatApiStore;
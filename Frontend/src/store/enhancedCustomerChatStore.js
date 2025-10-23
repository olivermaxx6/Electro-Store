// Enhanced Customer Chat API Store with proper user isolation
import { create } from 'zustand';

const useEnhancedCustomerChatStore = create((set, get) => ({
  // Chat state
  currentRoom: JSON.parse(localStorage.getItem('currentChatRoom') || 'null'),
  messages: [],
  loading: false,
  error: null,
  isConnected: false,
  customerName: null,
  isInitialized: false,
  wsConnection: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,

  // API base URL
  apiBaseUrl: 'http://127.0.0.1:8001/api/public',
  
  // Persist current room to localStorage
  setCurrentRoom: (room) => {
    set({ currentRoom: room });
    if (room) {
      localStorage.setItem('currentChatRoom', JSON.stringify(room));
    } else {
      localStorage.removeItem('currentChatRoom');
    }
  },
  
  // Clear chat state (useful for logout or reset)
  clearChatState: () => {
    set({ 
      currentRoom: null, 
      messages: [], 
      loading: false, 
      error: null, 
      isConnected: false,
      isInitialized: false,
      wsConnection: null,
      reconnectAttempts: 0
    });
    localStorage.removeItem('currentChatRoom');
  },
  
  // Get authentication headers
  getAuthHeaders: () => {
    const accessToken = localStorage.getItem('access_token');
    const authToken = localStorage.getItem('authToken');
    const token = accessToken || authToken;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Initialize customer chat with proper user isolation
  initializeCustomerChat: async (customerInfo) => {
    console.log('Enhanced initializeCustomerChat called with:', customerInfo);
    
    // Prevent duplicate initialization
    if (get().isInitialized && get().currentRoom) {
      console.log('Chat already initialized, using existing room:', get().currentRoom.id);
      await get().loadMessages(get().currentRoom.id);
      await get().connectWebSocket(get().currentRoom.id);
      set({ isConnected: true });
      return;
    }
    
    set({ loading: true, error: null, customerName: customerInfo.name || 'Customer' });
    
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access_token');
      const authToken = localStorage.getItem('authToken');
      const token = accessToken || authToken;
      
      if (token) {
        // Test if the token is actually valid by making a request to user-chat endpoint
        try {
          console.log('Testing token validity...');
          const testResponse = await fetch(`${get().apiBaseUrl}/user-chat/`, {
            method: 'GET',
            credentials: 'include',
            headers: get().getAuthHeaders(),
          });
          
          if (testResponse.ok) {
            console.log('Token is valid, using user-chat endpoint');
            await get().initializeUserChat();
          } else if (testResponse.status === 401) {
            console.log('Token is invalid (401), falling back to public chat');
            // Clear invalid token
            localStorage.removeItem('access_token');
            localStorage.removeItem('authToken');
            await get().initializePublicChat(customerInfo);
          } else {
            console.log('Unexpected response from user-chat endpoint, falling back to public chat');
            await get().initializePublicChat(customerInfo);
          }
        } catch (testError) {
          console.log('Token test failed, falling back to public chat:', testError.message);
          await get().initializePublicChat(customerInfo);
        }
      } else {
        console.log('No token found, using public chat endpoint');
        await get().initializePublicChat(customerInfo);
      }
      
      set({ isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize customer chat:', error);
      set({ 
        error: error.message, 
        loading: false,
        isConnected: false 
      });
    }
  },

  // Initialize chat for authenticated users
  initializeUserChat: async () => {
    try {
      console.log('Fetching user chat room from:', `${get().apiBaseUrl}/user-chat/`);
      const response = await fetch(`${get().apiBaseUrl}/user-chat/`, {
        method: 'GET',
        credentials: 'include',
        headers: get().getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication failed - fall back to public chat
          console.log('Authentication failed, falling back to public chat');
          await get().initializePublicChat({ name: 'Customer' });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User chat response data:', data);
      
      if (data.results && data.results.length > 0) {
        // Use existing room
        const room = data.results[0];
        console.log('Found existing user room:', room);
        get().setCurrentRoom(room);
        set({ loading: false });
        
        // Load messages for existing room
        await get().loadMessages(room.id);
        // Connect WebSocket
        await get().connectWebSocket(room.id);
        set({ isConnected: true });
      } else {
        console.log('No existing user room found, creating new one');
        // Create new room
        await get().createUserChatRoom();
        set({ isConnected: true });
      }
    } catch (error) {
      console.error('Failed to initialize user chat:', error);
      throw error;
    }
  },

  // Initialize chat for anonymous users
  initializePublicChat: async (customerInfo) => {
    try {
      console.log('Fetching public chat rooms from:', `${get().apiBaseUrl}/chat-rooms/`);
      const response = await fetch(`${get().apiBaseUrl}/chat-rooms/`, {
        method: 'GET',
        credentials: 'include',
        headers: get().getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Public chat response data:', data);
      
      if (data.results && data.results.length > 0) {
        // Use existing room
        const room = data.results[0];
        console.log('Found existing public room:', room);
        get().setCurrentRoom(room);
        set({ loading: false });
        
        // Load messages for existing room
        await get().loadMessages(room.id);
        // Connect WebSocket
        await get().connectWebSocket(room.id);
        set({ isConnected: true });
      } else {
        console.log('No existing public room found, creating new one');
        // Create new room
        await get().createChatRoom(customerInfo);
        set({ isConnected: true });
      }
    } catch (error) {
      console.error('Failed to initialize public chat:', error);
      throw error;
    }
  },

  // Create new chat room for authenticated users
  createUserChatRoom: async () => {
    console.log('createUserChatRoom called');
    try {
      console.log('Creating new user chat room at:', `${get().apiBaseUrl}/user-chat/`);
      const response = await fetch(`${get().apiBaseUrl}/user-chat/`, {
        method: 'POST',
        credentials: 'include',
        headers: get().getAuthHeaders(),
        body: JSON.stringify({
          status: 'active'
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('User not authenticated');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const room = await response.json();
      console.log('Created user room:', room);
      get().setCurrentRoom(room);
      
      // Load messages for new room
      await get().loadMessages(room.id);
      // Connect WebSocket
      await get().connectWebSocket(room.id);
      
      return room;
    } catch (error) {
      console.error('Failed to create user chat room:', error);
      throw error;
    }
  },

  // Create new chat room
  createChatRoom: async (customerInfo) => {
    console.log('createChatRoom called with:', customerInfo);
    try {
      console.log('Creating new chat room at:', `${get().apiBaseUrl}/chat-rooms/`);
      const response = await fetch(`${get().apiBaseUrl}/chat-rooms/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerInfo.name || 'Customer',
          customer_email: customerInfo.email || '',
          status: 'active'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const room = await response.json();
      console.log('Created room:', room);
      get().setCurrentRoom(room);
      
      // Load messages for new room
      await get().loadMessages(room.id);
      // Connect WebSocket
      await get().connectWebSocket(room.id);
      
      return room;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  },

  // Load messages for a room
  loadMessages: async (roomId) => {
    try {
      const response = await fetch(`${get().apiBaseUrl}/chat-rooms/${roomId}/get_messages/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Chat room not found (404), this is expected for new users');
          // Return empty messages array for 404 (room not found)
          set({ messages: [] });
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const messages = await response.json();
      set({ messages });
      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  },

  // Connect WebSocket with proper error handling
  connectWebSocket: async (roomId) => {
    const { wsConnection } = get();
    
    // Close existing connection if any
    if (wsConnection) {
      wsConnection.close();
    }
    
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
      const wsUrl = `ws://127.0.0.1:8001/ws/chat/${roomId}/`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ 
          wsConnection: ws,
          isConnected: true,
          error: null,
          reconnectAttempts: 0
        });
        
        // Send authentication token if available
        if (token) {
          ws.send(JSON.stringify({
            type: 'auth',
            token: token
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'chat_message') {
            set(state => ({
              messages: [...state.messages, data.message]
            }));
          } else if (data.type === 'error') {
            set({ error: data.message });
          } else if (data.type === 'pong') {
            // Handle pong response
            console.log('Received pong from server');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        set({ 
          wsConnection: null,
          isConnected: false
        });
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && get().reconnectAttempts < get().maxReconnectAttempts) {
          setTimeout(() => {
            get().attemptReconnect(roomId);
          }, get().reconnectInterval);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ 
          error: 'WebSocket connection failed',
          isConnected: false
        });
      };
      
      set({ wsConnection: ws });
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      set({ 
        error: 'Failed to connect to chat server',
        isConnected: false
      });
    }
  },

  // Attempt to reconnect WebSocket
  attemptReconnect: async (roomId) => {
    const { reconnectAttempts, maxReconnectAttempts } = get();
    
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      set({ 
        error: 'Unable to connect to chat server. Please refresh the page.',
        isConnected: false
      });
      return;
    }
    
    console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    set({ reconnectAttempts: reconnectAttempts + 1 });
    
    await get().connectWebSocket(roomId);
  },

  // Disconnect WebSocket
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

  // Send message via WebSocket
  sendMessage: async (content) => {
    const { currentRoom, wsConnection, isConnected } = get();
    if (!currentRoom) {
      throw new Error('No active chat room');
    }

    if (!isConnected || !wsConnection) {
      // Fallback to REST API if WebSocket is not connected
      console.log('WebSocket not connected, using REST API fallback');
      return await get().sendMessageViaAPI(content);
    }

    try {
      // Send via WebSocket
      wsConnection.send(JSON.stringify({
        type: 'chat_message',
        content: content
      }));
      
      // Add message to local state immediately (optimistic update)
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: content,
        sender_type: 'customer',
        sender_name: get().customerName || 'Customer',
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      set(state => ({
        messages: [...state.messages, tempMessage]
      }));
      
      return tempMessage;
    } catch (error) {
      console.error('Failed to send message via WebSocket:', error);
      // Fallback to REST API
      return await get().sendMessageViaAPI(content);
    }
  },

  // Send message via REST API (fallback)
  sendMessageViaAPI: async (content) => {
    const { currentRoom } = get();
    set({ loading: true, error: null });

    try {
      // Check if user is authenticated to determine which endpoint to use
      const accessToken = localStorage.getItem('access_token');
      const authToken = localStorage.getItem('authToken');
      const token = accessToken || authToken;
      
      let endpoint;
      if (token) {
        // Use user-specific endpoint for authenticated users
        endpoint = `${get().apiBaseUrl}/user-chat/${currentRoom.id}/send_message/`;
      } else {
        // Use public endpoint for anonymous users
        endpoint = `${get().apiBaseUrl}/chat-rooms/${currentRoom.id}/send_message/`;
      }

      console.log('Sending message to endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: get().getAuthHeaders(),
        body: JSON.stringify({ 
          content,
          customer_name: get().customerName || 'Customer'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Add the new message to the messages list
      set(state => ({
        messages: [...state.messages, result.data],
        loading: false
      }));

      return result.data;
    } catch (error) {
      console.error('Failed to send message via API:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // Get chat room by ID
  getChatRoom: async (roomId) => {
    try {
      console.log('Getting chat room:', roomId);
      
      // First, try to load messages for the room to verify it exists
      try {
        await get().loadMessages(roomId);
        console.log('Room exists and messages loaded successfully');
        
        // If we have a current room in state, use it
        const { currentRoom } = get();
        if (currentRoom && currentRoom.id === roomId) {
          return currentRoom;
        }
        
        // If no current room, create a minimal room object
        const room = {
          id: roomId,
          status: 'active',
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        };
        
        set({ currentRoom: room });
        return room;
        
      } catch (loadError) {
        console.log('Failed to load messages for room, room may not exist:', loadError.message);
        
        if (loadError.message.includes('404')) {
          console.log('Room not found (404), creating new room');
          // Clear the invalid room from localStorage
          get().setCurrentRoom(null);
          
          // Create a new room
          const newRoom = await get().createChatRoom({ name: 'Customer' });
          return newRoom;
        }
        
        throw loadError;
      }
    } catch (error) {
      console.error('Failed to get chat room:', error);
      throw error;
    }
  },

  // Update customer info
  updateCustomerInfo: async (roomId) => {
    // This would typically update the room with current user info
    // For now, we'll just refresh the room data
    return get().getChatRoom(roomId);
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Retry connection
  retryConnection: () => {
    const { currentRoom } = get();
    if (currentRoom) {
      get().connectWebSocket(currentRoom.id);
    }
  },

  // Legacy methods for compatibility
  connect: () => {
    const { currentRoom } = get();
    if (currentRoom) {
      get().connectWebSocket(currentRoom.id);
    }
  },

  connectWebSocket: (roomId) => {
    return get().connectWebSocket(roomId);
  }
}));

export default useEnhancedCustomerChatStore;

// CHAT FUNCTIONALITY COMMENTED OUT
// import { create } from 'zustand';

// Chat API Store for Admin Panel - COMMENTED OUT
// const useChatApiStore = create((set, get) => ({
//   // State
//   rooms: [],
//   currentRoom: null,
//   messages: [],
//   isConnected: false,
//   isLoading: false,
//   error: null,

//   // Actions
//   setRooms: (rooms) => set({ rooms }),
  
//   setCurrentRoom: (room) => set({ currentRoom: room }),
  
//   setMessages: (messages) => set({ messages }),
  
//   addMessage: (message) => set((state) => ({
//     messages: [...state.messages, message]
//   })),
  
//   setConnected: (isConnected) => set({ isConnected }),
  
//   setLoading: (isLoading) => set({ isLoading }),
  
//   setError: (error) => set({ error }),
  
//   clearError: () => set({ error: null }),
  
//   // Chat API methods
//   sendMessage: async (roomId, message) => {
//     // Mock implementation - in real app, this would call WebSocket or API
//     console.log('Sending message:', { roomId, message });
//     return { success: true };
//   },
  
//   joinRoom: async (roomId) => {
//     set({ isLoading: true, error: null });
//     try {
//       // Mock implementation
//       console.log('Joining room:', roomId);
//       set({ currentRoom: { id: roomId }, isLoading: false });
//       return { success: true };
//     } catch (error) {
//       set({ error: error.message, isLoading: false });
//       return { success: false, error: error.message };
//     }
//   },
  
//   leaveRoom: async (roomId) => {
//     set({ isLoading: true });
//     try {
//       // Mock implementation
//       console.log('Leaving room:', roomId);
//       set({ currentRoom: null, messages: [], isLoading: false });
//       return { success: true };
//     } catch (error) {
//       set({ error: error.message, isLoading: false });
//       return { success: false, error: error.message };
//     }
//   },
  
//   getRooms: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       // Mock implementation - in real app, this would call API
//       const mockRooms = [
//         { id: 1, name: 'General Support', unreadCount: 3 },
//         { id: 2, name: 'Technical Issues', unreadCount: 1 },
//         { id: 3, name: 'Sales Inquiries', unreadCount: 0 }
//       ];
//       set({ rooms: mockRooms, isLoading: false });
//       return { success: true, rooms: mockRooms };
//     } catch (error) {
//       set({ error: error.message, isLoading: false });
//       return { success: false, error: error.message };
//     }
//   },
  
//   getMessages: async (roomId) => {
//     set({ isLoading: true, error: null });
//     try {
//       // Mock implementation - in real app, this would call API
//       const mockMessages = [
//         {
//           id: 1,
//           user: 'John Doe',
//           message: 'Hello, I need help with my order',
//           timestamp: new Date().toISOString(),
//           isAdmin: false
//         },
//         {
//           id: 2,
//           user: 'Admin',
//           message: 'Hello! I can help you with that. What\'s your order number?',
//           timestamp: new Date().toISOString(),
//           isAdmin: true
//         }
//       ];
//       set({ messages: mockMessages, isLoading: false });
//       return { success: true, messages: mockMessages };
//     } catch (error) {
//       set({ error: error.message, isLoading: false });
//       return { success: false, error: error.message };
//     }
//   }
// }));

// Mock chat store for compatibility
const useChatApiStore = () => ({
  // Mock state
  rooms: [],
  currentRoom: null,
  messages: [],
  isConnected: false,
  isLoading: false,
  error: null,
  conversations: [],
  connectionStatus: { adminOnline: false, activeCustomers: 0 },
  
  // Mock actions
  setRooms: () => {},
  setCurrentRoom: () => {},
  setMessages: () => {},
  addMessage: () => {},
  setConnected: () => {},
  setLoading: () => {},
  setError: () => {},
  clearError: () => {},
  sendMessage: async () => ({ success: true }),
  joinRoom: async () => ({ success: true }),
  leaveRoom: async () => ({ success: true }),
  getRooms: async () => ({ success: true, rooms: [] }),
  getMessages: async () => ({ success: true, messages: [] }),
  getAdminChatRooms: async () => ({ success: true }),
  getAdminChatRoom: async () => ({ success: true }),
  sendAdminMessage: async () => ({ success: true }),
  markAsRead: async () => ({ success: true }),
  connectAdminWebSocket: () => {},
  disconnectWebSocket: () => {}
});

export default useChatApiStore;
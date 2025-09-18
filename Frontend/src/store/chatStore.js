import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate a simple user ID for demo purposes
const generateUserId = () => {
  const stored = localStorage.getItem('demo_user_id');
  if (stored) return stored;
  const newId = 'user_' + Date.now();
  localStorage.setItem('demo_user_id', newId);
  return newId;
};

const useChatStore = create(
  persist(
    (set, get) => ({
      // Chat conversations
      conversations: {},
      
      // Current user ID (for demo purposes)
      currentUserId: generateUserId(),
      
      // Add a new conversation
      addConversation: (userId, userInfo) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [userId]: {
              id: userId,
              name: userInfo.name || 'Anonymous User',
              email: userInfo.email || 'user@example.com',
              avatar: userInfo.avatar || '👤',
              messages: [],
              lastMessageTime: new Date(),
              unreadCount: 0,
              isOnline: true,
            }
          }
        }));
      },
      
      // Add a message to a conversation
      addMessage: (userId, message) => {
        set((state) => {
          const conversation = state.conversations[userId];
          if (!conversation) {
            // Create new conversation if it doesn't exist
            const newConversation = {
              id: userId,
              name: message.senderName || 'Anonymous User',
              email: 'user@example.com',
              avatar: '👤',
              messages: [message],
              lastMessageTime: message.timestamp,
              unreadCount: message.sender === 'user' ? 1 : 0,
              isOnline: true,
            };
            return {
              conversations: {
                ...state.conversations,
                [userId]: newConversation
              }
            };
          }
          
          const updatedConversation = {
            ...conversation,
            messages: [...conversation.messages, message],
            lastMessageTime: message.timestamp,
            unreadCount: message.sender === 'user' 
              ? conversation.unreadCount + 1 
              : conversation.unreadCount,
          };
          
          return {
            conversations: {
              ...state.conversations,
              [userId]: updatedConversation
            }
          };
        });
      },
      
      // Mark messages as read
      markAsRead: (userId) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [userId]: {
              ...state.conversations[userId],
              unreadCount: 0
            }
          }
        }));
      },
      
      // Get all conversations sorted by last message time
      getConversations: () => {
        const conversations = Object.values(get().conversations);
        return conversations.sort((a, b) => 
          new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );
      },
      
      // Get conversation by user ID
      getConversation: (userId) => {
        return get().conversations[userId];
      },
      
      // Get total unread count
      getTotalUnreadCount: () => {
        const conversations = Object.values(get().conversations);
        return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },
      
      // Clear all conversations (for testing)
      clearConversations: () => {
        set({ conversations: {} });
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({ 
        conversations: state.conversations,
        currentUserId: state.currentUserId 
      }),
    }
  )
);

export default useChatStore;

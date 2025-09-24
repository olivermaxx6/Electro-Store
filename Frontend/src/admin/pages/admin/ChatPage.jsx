// CHAT FUNCTIONALITY COMMENTED OUT
// import React, { useState, useRef, useEffect } from 'react';
// import { MessageCircle, Send, User, Clock, CheckCircle } from 'lucide-react';
// import { ThemeLayout, ThemeCard, SectionHeader } from '@shared/theme';
// import useChatApiStore from '../../store/chatApiStore';
// import { useAuth } from '../../store/authStore';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ThemeLayout, ThemeCard, SectionHeader } from '@shared/theme';

// User Avatar Component - COMMENTED OUT
// const UserAvatar = ({ name, size = 'w-10 h-10', className = '' }) => {
//   const displayName = name || 'Anonymous';
//   const initial = displayName.charAt(0).toUpperCase();
//   
//   return (
//     <div className={`${size} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold ${className}`}>
//       {displayName !== 'Anonymous' ? initial : <User className="w-5 h-5" />}
//     </div>
//   );
// };

export default function ChatPage() {
  return (
    <ThemeLayout>
      <SectionHeader 
        title="Customer Support Chat" 
        icon="💬" 
        color="primary"
        subtitle="Chat functionality is currently disabled"
      />
      
      <ThemeCard className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Chat Feature Disabled
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The customer support chat functionality has been temporarily disabled.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Contact the system administrator to re-enable this feature.
          </p>
        </div>
      </ThemeCard>
    </ThemeLayout>
  );
}

/* COMMENTED OUT - ORIGINAL CHAT FUNCTIONALITY
const chatStore = useChatApiStore();
console.log('Chat store functions:', Object.keys(chatStore));

const { 
  conversations, 
  currentRoom, 
  messages, 
  loading, 
  error,
  isConnected,
  connectionStatus,
  getAdminChatRooms, 
  getAdminChatRoom, 
  sendAdminMessage, 
  markAsRead,
  setCurrentRoom,
  connectAdminWebSocket,
  disconnectWebSocket,
  clearError
} = chatStore;
const { user } = useAuth();
const [selectedRoom, setSelectedRoom] = useState(null);
const [newMessage, setNewMessage] = useState('');
const messagesEndRef = useRef(null);

// Load conversations on component mount and connect WebSocket
useEffect(() => {
  const loadChatData = async () => {
    try {
      console.log('Loading admin chat data...');
      await getAdminChatRooms();
      console.log('Admin chat rooms loaded, connecting WebSocket...');
      connectAdminWebSocket();
      console.log('Admin WebSocket connected');
    } catch (error) {
      console.error('Failed to load chat data:', error);
      // Error is already handled in the store
    }
  };
  
  loadChatData();
  
  // Cleanup on unmount
  return () => {
    disconnectWebSocket();
  };
}, [getAdminChatRooms, connectAdminWebSocket, disconnectWebSocket]);

// Auto-refresh conversations when new messages arrive
useEffect(() => {
  if (conversations && conversations.length > 0) {
    console.log('Conversations updated, refreshing list...');
    console.log('Current conversations:', conversations);
    // The WebSocket handler already calls refreshAdminChatRooms()
    // This effect just logs the update for debugging
  }
}, [conversations]);

// Debug WebSocket connection status
useEffect(() => {
  console.log('Admin WebSocket connection status:', isConnected);
  if (!isConnected) {
    console.log('Admin WebSocket not connected, attempting to reconnect...');
    connectAdminWebSocket();
  }
}, [isConnected, connectAdminWebSocket]);

// Periodic refresh as fallback (every 5 seconds)
useEffect(() => {
  const interval = setInterval(() => {
    if (!isConnected) {
      console.log('WebSocket not connected, refreshing conversations...');
      getAdminChatRooms().catch(console.error);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [isConnected, getAdminChatRooms]);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
  scrollToBottom();
}, [messages]);

// Auto-select first room if available and none selected
useEffect(() => {
  if (conversations && conversations.length > 0 && !selectedRoom) {
    setSelectedRoom(conversations[0]);
  }
}, [conversations, selectedRoom]);

// Load room messages when selection changes
useEffect(() => {
  if (selectedRoom) {
    getAdminChatRoom(selectedRoom.id).catch(console.error);
  }
}, [selectedRoom, getAdminChatRoom]);

const handleSendMessage = async (e) => {
  e.preventDefault();
  console.log('handleSendMessage called', { newMessage, selectedRoom, loading });
  
  if (!newMessage.trim()) {
    console.log('No message to send');
    return;
  }
  
  if (!selectedRoom) {
    console.log('No room selected');
    return;
  }
  
  if (loading) {
    console.log('Currently loading, cannot send message');
    return;
  }

  try {
    console.log('Sending message:', newMessage, 'to room:', selectedRoom.id);
    await sendAdminMessage(selectedRoom.id, newMessage);
    setNewMessage('');
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

const handleRefresh = async () => {
  try {
    console.log('Manual refresh triggered');
    await getAdminChatRooms();
    console.log('Conversations refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh conversations:', error);
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getMessageTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const totalUnreadCount = (conversations || []).reduce((sum, room) => sum + (room.unread_count || 0), 0);

// Debug logging for component state
useEffect(() => {
  console.log('ChatPage state update:', {
    conversations: conversations?.length || 0,
    selectedRoom: selectedRoom?.id || 'none',
    newMessage: newMessage,
    loading: loading,
    error: error,
    isConnected: isConnected
  });
}, [conversations, selectedRoom, newMessage, loading, error, isConnected]);

// Handle room selection and mark as read
const handleRoomSelect = async (room) => {
  console.log('Selecting room:', room);
  setSelectedRoom(room);
  
  try {
    // Load the room details and messages using admin endpoint
    await getAdminChatRoom(room.id);
    // Mark as read
    await markAsRead(room.id);
  } catch (error) {
    console.error('Error loading room:', error);
  }
};

return (
  <ThemeLayout>
    <SectionHeader 
      title="Customer Support Chat" 
      icon="💬" 
      color="primary"
      subtitle="Communicate with customers and provide support"
    />
    
    // ... rest of the original component code ...
  </ThemeLayout>
);
*/
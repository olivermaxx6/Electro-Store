import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User, Clock, CheckCircle } from 'lucide-react';
import { ThemeLayout, ThemeCard, SectionHeader } from '@shared/theme';
import useChatApiStore from '@shared/store/chatApiStore';
import { useAuth } from '@shared/admin/store/authStore';

// User Avatar Component
const UserAvatar = ({ name, size = 'w-10 h-10', className = '' }) => {
  const displayName = name || 'Anonymous';
  const initial = displayName.charAt(0).toUpperCase();
  
  return (
    <div className={`${size} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold ${className}`}>
      {displayName !== 'Anonymous' ? initial : <User className="w-5 h-5" />}
    </div>
  );
};


export default function ChatPage() {
  const chatStore = useChatApiStore();
  console.log('Chat store functions:', Object.keys(chatStore));
  
  const { 
    conversations, 
    currentRoom, 
    messages, 
    loading, 
    error,
    isConnected,
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
    if (!newMessage.trim() || !selectedRoom || loading) return;

    try {
      await sendAdminMessage(selectedRoom.id, newMessage);
      setNewMessage('');
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
      
      {/* Admin User Info and Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Admin User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.username || 'Admin User'
                }
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex flex-col items-end space-y-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Real-time Connected' : 'Disconnected'}
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 max-w-xs text-right">
              <div className="mb-2">{error}</div>
              <button
                onClick={async () => {
                  clearError();
                  try {
                    await getAdminChatRooms();
                    connectAdminWebSocket();
                  } catch (error) {
                    console.error('Retry failed:', error);
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users List */}
        <ThemeCard className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Conversations
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 text-xs ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {totalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {totalUnreadCount}
                </span>
              )}
              <button
                onClick={async () => {
                  try {
                    await getAdminChatRooms();
                  } catch (error) {
                    console.error('Failed to refresh conversations:', error);
                  }
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh conversations"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-500 dark:text-slate-400">Loading conversations...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 dark:text-red-400">{error}</div>
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No conversations yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Users will appear here when they send messages
                </p>
              </div>
            ) : (
              conversations.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <UserAvatar name={room.customer_name} />
                    {room.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {room.customer_name || 'Anonymous'}
                      </p>
                      {room.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {room.last_message?.content || 'No messages yet'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {formatTime(room.last_message_at)}
                    </p>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </ThemeCard>

        {/* Chat Area */}
        <ThemeCard className="lg:col-span-2">
          {selectedRoom ? (
            <div className="flex flex-col h-96">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <UserAvatar name={selectedRoom.customer_name} />
                    {selectedRoom.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {selectedRoom.customer_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedRoom.status === 'active' ? 'Online' : selectedRoom.status}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500">
                  {selectedRoom.customer_email}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-slate-500 dark:text-slate-400">Loading messages...</div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-red-500 dark:text-red-400">{error}</div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender_type === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-medium ${
                            message.sender_type === 'admin' 
                              ? 'text-blue-100' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {message.sender_name || (message.sender_type === 'admin' ? 'Admin' : 'Customer')}
                          </p>
                          <p className={`text-xs ${
                            message.sender_type === 'admin' 
                              ? 'text-blue-100' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {getMessageTime(message.created_at)}
                          </p>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.sender_type === 'admin' && (
                          <div className="flex justify-end mt-1">
                            <CheckCircle className="w-3 h-3 text-blue-100" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </ThemeCard>
      </div>
    </ThemeLayout>
  );
}

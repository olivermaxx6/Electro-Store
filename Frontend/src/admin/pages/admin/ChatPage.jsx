import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { ThemeLayout, ThemeCard, SectionHeader } from '@theme';
import useChatApiStore from '../../store/chatApiStore';
import { useAuth } from '../../store/authStore';

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
    connectionStatus,
    getAdminChatRooms, 
    getAdminChatRoom, 
    sendAdminMessage, 
    markAsRead,
    setCurrentRoom,
    connectAdminWebSocket,
    disconnectWebSocket,
    clearError,
    deleteChatRoom
  } = chatStore;
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Load conversations on component mount and connect WebSocket
  useEffect(() => {
    const loadChatData = async () => {
      try {
        console.log('Loading admin chat data...');
        const result = await getAdminChatRooms();
        
        // Only proceed with WebSocket connection if chat is enabled
        if (result.success || result.error !== 'Chat functionality is currently disabled') {
          console.log('Admin chat rooms loaded, connecting WebSocket...');
          connectAdminWebSocket();
          console.log('Admin WebSocket connected');
        } else {
          console.log('Chat functionality disabled, skipping WebSocket connection');
        }
        
        // If authentication failed, show error
        if (!result.success && result.error?.includes('Authentication')) {
          console.error('Authentication failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
        // Error is already handled in the store
      }
    };
    
    loadChatData();
    
    // Cleanup on unmount - but don't disconnect for REST API
    return () => {
      console.log('ChatPage unmounting - keeping REST API connection active');
    };
  }, [getAdminChatRooms, connectAdminWebSocket]);

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

  // Periodic refresh for REST API (every 10 seconds to reduce re-renders)
  useEffect(() => {
    // Don't start periodic refresh if chat is disabled
    if (error === 'Chat functionality is currently disabled') {
      return;
    }
    
    const interval = setInterval(() => {
      console.log('Periodic refresh - checking for new messages...');
      getAdminChatRooms().catch(console.error);
    }, 10000); // Refresh every 10 seconds to reduce input focus issues

    return () => clearInterval(interval);
  }, [getAdminChatRooms, error]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Maintain focus on input field during re-renders
  useEffect(() => {
    if (isInputFocused && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  });

  // Auto-select first room if available and none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedRoom) {
      console.log('Auto-selecting first room:', conversations[0]);
      console.log('First room ID:', conversations[0].id);
      console.log('First room customer:', conversations[0].customer_name);
      handleRoomSelect(conversations[0]);
    }
  }, [conversations, selectedRoom]);

  // Load room messages when selection changes
  useEffect(() => {
    if (selectedRoom) {
      console.log('Loading messages for room:', selectedRoom.id);
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
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Just now';
    }
  };

  const getMessageTime = (dateString) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Just now';
    }
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
    console.log('Room ID:', room.id);
    console.log('Room details:', room);
    
    setSelectedRoom(room);
    setCurrentRoom(room); // Also update the store's currentRoom
    
    try {
      // Load the room details and messages using admin endpoint
      console.log('Loading messages for room ID:', room.id);
      await getAdminChatRoom(room.id);
      // Mark as read
      await markAsRead(room.id);
    } catch (error) {
      console.error('Error loading room:', error);
    }
  };

  // Handle chat room deletion
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this chat room? This action cannot be undone.')) {
      try {
        const result = await deleteChatRoom(roomId);
        if (result.success) {
          // If we deleted the currently selected room, clear the selection
          if (selectedRoom?.id === roomId) {
            setSelectedRoom(null);
          }
          // Refresh the conversations list
          await getAdminChatRooms();
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SectionHeader 
        title="Customer Support Chat" 
        icon="💬" 
        color="primary"
        subtitle="Communicate with customers and provide support"
      />
      
      {/* Show disabled chat message if chat functionality is disabled */}
      {error === 'Chat functionality is currently disabled' && (
        <div className="mx-4 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Chat functionality is currently disabled
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                The chat system has been temporarily disabled on the server. Please contact your administrator to re-enable it.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Sidebar - Conversations List */}
        <div className="w-1/3 min-w-0 flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Conversations ({conversations?.length || 0})
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <button
                onClick={handleRefresh}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Refresh conversations"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {loading && !conversations ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {conversations.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <UserAvatar name={room.customer_name || 'Anonymous'} size="w-8 h-8" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {room.customer_name === 'Customer' ? `Customer ${room.id.slice(-4)}` : (room.customer_name || 'Anonymous Customer')}
                          </p>
                          {room.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {room.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {room.last_message?.content || 'No messages yet'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {formatTime(room.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
        <div className="text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Messages */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <UserAvatar name={selectedRoom.customer_name || 'Anonymous'} />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {selectedRoom.customer_name === 'Customer' ? `Customer ${selectedRoom.id.slice(-4)}` : (selectedRoom.customer_name || 'Anonymous Customer')}
          </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedRoom.customer_email || 'No email provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  <button
                    onClick={() => handleDeleteRoom(selectedRoom.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 p-1 rounded"
                    title="Delete chat room"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && !messages ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_type === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-medium ${
                            message.sender_type === 'admin' 
                              ? 'text-blue-100' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {message.sender_name || (message.sender_type === 'admin' ? 'You' : 'Customer')}
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
                          <div className="flex items-center justify-end mt-1">
                            <CheckCircle className="w-3 h-3 text-blue-100" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Start the conversation!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                    disabled={loading}
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{error}</span>
              {error.includes('Authentication') && (
                <div className="text-xs mt-1">
                  Please refresh the page or login again.
                </div>
              )}
            </div>
            <button
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
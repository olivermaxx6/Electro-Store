import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import useCustomerChatStore from '../../store/customerChatStore';
import { selectCurrentUser } from '../../store/userSlice';

interface Message {
  id: string;
  content: string;
  sender_type: 'customer' | 'admin' | 'system';
  sender_name: string;
  is_read: boolean;
  created_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentRoom, 
    messages, 
    loading, 
    error,
    isConnected,
    isConnecting,
    initializeCustomerChat, 
    sendMessage, 
    getChatRoom,
    connectWebSocket,
    disconnectWebSocket,
    retryConnection,
    clearError,
    updateCustomerInfo
  } = useCustomerChatStore();
  const currentUser = useSelector(selectCurrentUser);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Chat modal opened. Current user:', currentUser);
      console.log('Current room:', currentRoom);
      console.log('isConnected:', isConnected);
      console.log('messages:', messages);
      console.log('loading:', loading);
      console.log('error:', error);
      
      if (!currentRoom) {
        // Create new chat room
        const customerInfo = {
          name: currentUser?.name || currentUser?.username || 'Anonymous User',
          email: currentUser?.email || 'user@example.com'
        };
        console.log('Creating new chat room with info:', customerInfo);
        console.log('Current user object:', currentUser);
        initializeCustomerChat(customerInfo).catch(console.error);
      } else {
        // Load messages for existing room
        console.log('Loading messages for existing room:', currentRoom.id);
        getChatRoom(currentRoom.id).catch(console.error);
        
        if (currentUser?.isAuthenticated && (currentRoom.customer_name === 'Anonymous User' || !currentRoom.customer_name)) {
          // Update existing chat room with current user info if it's still showing Anonymous or empty
          console.log('Updating customer info for room:', currentRoom.id, 'User:', currentUser);
          console.log('Current room customer_name:', currentRoom.customer_name);
          updateCustomerInfo(currentRoom.id).catch(console.error);
        }
      }
    }
  }, [isOpen, currentRoom, initializeCustomerChat, currentUser, updateCustomerInfo, getChatRoom]);

  // Cleanup WebSocket connection when modal closes
  useEffect(() => {
    if (!isOpen) {
      disconnectWebSocket();
    }
  }, [isOpen, disconnectWebSocket]);

  // Ensure WebSocket connection is maintained (only when room changes)
  useEffect(() => {
    if (isOpen && currentRoom && !isConnected) {
      console.log('WebSocket not connected, attempting to reconnect...');
      // Use a timeout to prevent rapid reconnection attempts
      const timeoutId = setTimeout(() => {
        getChatRoom(currentRoom.id).catch(console.error);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, currentRoom?.id]); // Only depend on room ID, not isConnected

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom || loading) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
      setIsTyping(true);

      // Simulate admin response after a delay
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const formatTime = (dateString: string) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 dark:bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Admin Support</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 
                  isConnecting ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Real-time Connected' : 
                   isConnecting ? 'Connecting...' : 
                   error ? 'Connection Failed' : 'Disconnected'}
                </p>
                {error && (
                  <button
                    onClick={() => {
                      clearError();
                      retryConnection();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500 dark:text-gray-400">Loading chat...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-red-500 dark:text-red-400 text-center">
                <p>{error}</p>
                <button 
                  onClick={() => {
                    clearError();
                    if (currentRoom) {
                      getChatRoom(currentRoom.id);
                    }
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
                <p className="text-sm mt-1">Type a message below to begin chatting with our support team.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender_type === 'customer'
                      ? 'bg-red-600 dark:bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-medium ${
                      message.sender_type === 'customer' 
                        ? 'text-red-100 dark:text-blue-100' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {message.sender_name || (message.sender_type === 'customer' ? 'You' : 'Admin')}
                    </p>
                    <p className={`text-xs ${
                      message.sender_type === 'customer' 
                        ? 'text-red-100 dark:text-blue-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || loading}
              className="px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

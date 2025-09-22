import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import ChatModal from '../components/chat/ChatModal';
import useChatConnection from '../hooks/useChatConnection';

const Chat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    activeConnection,
    isConnecting,
    isConnected,
    hasError,
    createConnection,
    connectionUrl,
    chatLink
  } = useChatConnection();

  // Auto-create connection when component mounts with roomId
  useEffect(() => {
    if (roomId && !isConnected) {
      createConnection({
        createNewRoom: false
      }).catch(console.error);
    }
  }, [roomId, isConnected, createConnection]);

  const handleCopyLink = async () => {
    if (chatLink) {
      try {
        await navigator.clipboard.writeText(chatLink);
        // You could add a toast notification here
        console.log('Chat link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy chat link:', error);
      }
    }
  };

  const handleGoBack = () => {
    navigate('/user/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-red-600 dark:text-blue-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Chat
                </span>
              </div>
              
              {isConnected && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Copy chat link"
                  >
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Connection Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chat with Admin Team
            </h1>
            
            {isConnecting ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Establishing Connection...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we connect you to our admin team.
                </p>
              </div>
            ) : hasError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Connection Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We couldn't establish a connection. Please try again.
                </p>
                <button
                  onClick={() => createConnection()}
                  className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Retry Connection
                </button>
              </div>
            ) : isConnected ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Connection Established
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You're now connected to our admin team. Click below to start chatting!
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors text-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Open Chat Window
                  </button>
                </div>
                
                {/* Connection Details */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Connection Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Room ID:</span>
                        <span className="font-mono">{activeConnection?.roomId}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Connected:</span>
                        <span>{activeConnection?.createdAt.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
                        <span>{activeConnection?.lastActivity.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click below to establish a connection with our admin team.
                </p>
                <button
                  onClick={() => createConnection()}
                  className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Connection
                </button>
              </div>
            )}
          </div>

          {/* Chat Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use This Chat
            </h3>
            <div className="space-y-2 text-blue-800 dark:text-blue-200">
              <p>• Click "Open Chat Window" to start chatting with our admin team</p>
              <p>• Your messages will be sent in real-time to our support staff</p>
              <p>• You can copy the chat link to share with others if needed</p>
              <p>• The connection will remain active as long as you're on this page</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Chat;

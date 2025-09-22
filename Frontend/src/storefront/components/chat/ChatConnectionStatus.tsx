import React from 'react';
import { MessageCircle, Wifi, WifiOff, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { ChatConnection } from '../../../services/chatConnectionService';

interface ChatConnectionStatusProps {
  connection: ChatConnection | null;
  isConnecting: boolean;
  hasError: boolean;
  onCopyLink?: () => void;
  onOpenChat?: () => void;
}

const ChatConnectionStatus: React.FC<ChatConnectionStatusProps> = ({
  connection,
  isConnecting,
  hasError,
  onCopyLink,
  onOpenChat
}) => {
  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (isConnecting) return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
    if (connection?.status === 'connected') return <Wifi className="w-4 h-4 text-green-500" />;
    return <WifiOff className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (hasError) return 'Connection Error';
    if (isConnecting) return 'Connecting...';
    if (connection?.status === 'connected') return 'Connected';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (hasError) return 'text-red-600 dark:text-red-400';
    if (isConnecting) return 'text-yellow-600 dark:text-yellow-400';
    if (connection?.status === 'connected') return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (!connection) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">No active connection</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {connection.status === 'connected' && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onCopyLink}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              title="Copy chat link"
            >
              <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={onOpenChat}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              title="Open chat"
            >
              <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Connection Details */}
      {connection.status === 'connected' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Room ID:</span>
            <span className="font-mono">{connection.roomId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Connected:</span>
            <span>{connection.createdAt.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Activity:</span>
            <span>{connection.lastActivity.toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Connection URL */}
      {connection.status === 'connected' && connection.connectionUrl && (
        <div className="text-xs">
          <div className="text-gray-500 dark:text-gray-400 mb-1">Connection URL:</div>
          <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded text-gray-700 dark:text-gray-300 font-mono text-xs break-all">
            {connection.connectionUrl}
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          Failed to establish connection. Please try again.
        </div>
      )}
    </div>
  );
};

export default ChatConnectionStatus;

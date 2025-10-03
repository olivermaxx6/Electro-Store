// WebSocket URL utilities

// Get WebSocket URL based on environment
export const makeWsUrl = (path = '') => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname === 'localhost' ? '127.0.0.1:8001' : window.location.host;
  return `${protocol}//${host}/ws${path}`;
};

// Admin chat WebSocket URL
export const getAdminChatWsUrl = () => {
  return makeWsUrl('/admin/chat/');
};

// Public chat WebSocket URL
export const getPublicChatWsUrl = () => {
  return makeWsUrl('/chat/');
};

// WebSocket connection status
export const WS_CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

export default {
  makeWsUrl,
  getAdminChatWsUrl,
  getPublicChatWsUrl,
  WS_CONNECTION_STATUS
};

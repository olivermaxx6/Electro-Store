import { makeWsUrl } from '../lib/wsUrl';

export interface ChatConnection {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  roomId: string;
  connectionUrl: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface ChatConnectionOptions {
  userId: string;
  userName: string;
  userEmail: string;
  createNewRoom?: boolean;
}

class ChatConnectionService {
  private connections: Map<string, ChatConnection> = new Map();
  private activeConnection: ChatConnection | null = null;
  private listeners: Set<(connection: ChatConnection | null) => void> = new Set();

  /**
   * Create a new virtual chat connection
   */
  async createConnection(options: ChatConnectionOptions): Promise<ChatConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomId = `room_${options.userId}_${Date.now()}`;
    
    const connection: ChatConnection = {
      id: connectionId,
      userId: options.userId,
      userName: options.userName,
      userEmail: options.userEmail,
      status: 'connecting',
      roomId: roomId,
      connectionUrl: this.generateConnectionUrl(roomId),
      createdAt: new Date(),
      lastActivity: new Date()
    };

    // Store the connection
    this.connections.set(connectionId, connection);
    this.activeConnection = connection;

    // Notify listeners
    this.notifyListeners();

    try {
      // Simulate connection establishment
      await this.establishConnection(connection);
      
      connection.status = 'connected';
      connection.lastActivity = new Date();
      
      // Update stored connection
      this.connections.set(connectionId, connection);
      this.notifyListeners();

      return connection;
    } catch (error) {
      connection.status = 'error';
      this.connections.set(connectionId, connection);
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Get the current active connection
   */
  getActiveConnection(): ChatConnection | null {
    return this.activeConnection;
  }

  /**
   * Get connection by ID
   */
  getConnection(connectionId: string): ChatConnection | null {
    return this.connections.get(connectionId) || null;
  }

  /**
   * Get all connections for a user
   */
  getUserConnections(userId: string): ChatConnection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Close a connection
   */
  closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'disconnected';
      this.connections.set(connectionId, connection);
      
      if (this.activeConnection?.id === connectionId) {
        this.activeConnection = null;
      }
      
      this.notifyListeners();
    }
  }

  /**
   * Update connection activity
   */
  updateActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
      this.connections.set(connectionId, connection);
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to connection changes
   */
  subscribe(listener: (connection: ChatConnection | null) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Generate a shareable connection URL
   */
  generateConnectionUrl(roomId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/user/dashboard?chat=${roomId}`;
  }

  /**
   * Generate a direct chat link for sharing
   */
  generateChatLink(roomId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/chat/${roomId}`;
  }

  /**
   * Establish the actual connection (simulated for now)
   */
  private async establishConnection(connection: ChatConnection): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate connection establishment delay
      setTimeout(() => {
        // In a real implementation, this would:
        // 1. Validate user authentication
        // 2. Create or join chat room
        // 3. Establish WebSocket connection
        // 4. Register with admin notification system
        
        console.log(`[ChatConnection] Establishing connection for room ${connection.roomId}`);
        console.log(`[ChatConnection] User: ${connection.userName} (${connection.userEmail})`);
        console.log(`[ChatConnection] Connection URL: ${connection.connectionUrl}`);
        
        // Simulate success
        resolve();
      }, 1000);
    });
  }

  /**
   * Notify all listeners of connection changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.activeConnection);
      } catch (error) {
        console.error('Error notifying connection listener:', error);
      }
    });
  }

  /**
   * Clear all connections (for cleanup)
   */
  clearAllConnections(): void {
    this.connections.clear();
    this.activeConnection = null;
    this.notifyListeners();
  }
}

// Export singleton instance
export const chatConnectionService = new ChatConnectionService();
export default chatConnectionService;

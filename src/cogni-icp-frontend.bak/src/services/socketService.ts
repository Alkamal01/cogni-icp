import Cookies from 'js-cookie';

// Event types for WebSocket
export type SocketEventType = 
  'new_message' | 
  'message_deleted' | 
  'message_edited' | 
  'member_joined' | 
  'member_left' | 
  'typing_started' | 
  'typing_stopped' |
  // AI Tutor specific events
  'tutor_message_start' |    // Start of AI response
  'tutor_message_chunk' |    // Chunk of AI response (streaming)
  'tutor_message_complete' | // Complete AI response received
  'tutor_thinking' |         // AI is processing
  'tutor_error';             // Error in AI processing

// Event handler signature
export type SocketEventHandler = (data: any) => void;

// Socket connection status
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

class SocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<SocketEventType, Set<SocketEventHandler>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private groupId: number | null = null;
  private statusHandlers: Set<(status: SocketStatus) => void> = new Set();
  private status: SocketStatus = 'disconnected';

  // Connect to WebSocket server
  public connect(groupId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // If already connected to this group, resolve immediately
        if (this.socket && this.groupId === groupId && this.status === 'connected') {
          resolve();
          return;
        }
        
        // Store the group ID
        this.groupId = groupId;
        
        // Update status
        this.updateStatus('connecting');
        
        // Get authentication token from cookies
        const token = Cookies.get('auth_token');
        
        if (!token) {
          this.updateStatus('error');
          reject(new Error('No authentication token found'));
          return;
        }
        
        // Close any existing connection
        if (this.socket) {
          this.socket.close();
        }
        
        // Create new WebSocket connection
        const wsUrl = process.env.REACT_APP_API_URL ? 
      process.env.REACT_APP_API_URL.replace('https://', 'wss://').replace('http://', 'ws://') : 
      'ws://localhost:5000';
    this.socket = new WebSocket(`${wsUrl}/ws?token=${token}&group_id=${groupId}`);
        
        // Set up event handlers
        this.socket.onopen = () => {
          this.updateStatus('connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onclose = () => {
          this.updateStatus('disconnected');
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.updateStatus('error');
          reject(error);
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type && typeof data.type === 'string') {
              this.handleEvent(data.type as SocketEventType, data.payload);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
      } catch (error) {
        this.updateStatus('error');
        reject(error);
      }
    });
  }
  
  // Disconnect from the WebSocket server
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Clear any reconnect attempts
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.groupId = null;
    this.updateStatus('disconnected');
  }
  
  // Send a message to the server
  public sendMessage(content: string, attachments?: any[]): boolean {
    if (!this.socket || this.status !== 'connected') {
      return false;
    }
    
    try {
      const message = {
        type: 'send_message',
        group_id: this.groupId,
        content,
        attachments
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  // Send typing indicator to the server
  public sendTypingIndicator(isTyping: boolean): boolean {
    if (!this.socket || this.status !== 'connected') {
      return false;
    }
    
    try {
      const event = {
        type: isTyping ? 'typing_started' : 'typing_stopped',
        group_id: this.groupId
      };
      
      this.socket.send(JSON.stringify(event));
      return true;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }
  
  // Register an event handler
  public on(eventType: SocketEventType, handler: SocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)?.add(handler);
  }
  
  // Unregister an event handler
  public off(eventType: SocketEventType, handler: SocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  // Register a status change handler
  public onStatusChange(handler: (status: SocketStatus) => void): void {
    this.statusHandlers.add(handler);
    
    // Call handler immediately with current status
    handler(this.status);
  }
  
  // Unregister a status change handler
  public offStatusChange(handler: (status: SocketStatus) => void): void {
    this.statusHandlers.delete(handler);
  }
  
  // Get current connection status
  public getStatus(): SocketStatus {
    return this.status;
  }
  
  // Handle incoming events
  private handleEvent(type: SocketEventType, payload: any): void {
    const handlers = this.eventHandlers.get(type);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in handler for event ${type}:`, error);
        }
      });
    }
  }
  
  // Update status and notify handlers
  private updateStatus(status: SocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      
      // Notify status handlers
      this.statusHandlers.forEach(handler => {
        try {
          handler(status);
        } catch (error) {
          console.error('Error in status handler:', error);
        }
      });
    }
  }
  
  // Attempt to reconnect to the WebSocket server
  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.groupId) {
      this.reconnectAttempts++;
      
      this.reconnectTimer = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        // Try to reconnect
        this.connect(this.groupId!).catch(error => {
          console.error('Reconnection attempt failed:', error);
        });
      }, 2000 * Math.pow(1.5, this.reconnectAttempts - 1)); // Exponential backoff
    }
  }
}

// Export as singleton
export const socketService = new SocketService();
export default socketService; 
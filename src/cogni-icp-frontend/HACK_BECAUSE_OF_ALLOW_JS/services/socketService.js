import Cookies from 'js-cookie';
class SocketService {
    constructor() {
        this.socket = null;
        this.eventHandlers = new Map();
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.groupId = null;
        this.statusHandlers = new Set();
        this.status = 'disconnected';
    }
    // Connect to WebSocket server
    connect(groupId) {
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
                            this.handleEvent(data.type, data.payload);
                        }
                    }
                    catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
            }
            catch (error) {
                this.updateStatus('error');
                reject(error);
            }
        });
    }
    // Disconnect from the WebSocket server
    disconnect() {
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
    sendMessage(content, attachments) {
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
        }
        catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
    // Send typing indicator to the server
    sendTypingIndicator(isTyping) {
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
        }
        catch (error) {
            console.error('Error sending typing indicator:', error);
            return false;
        }
    }
    // Register an event handler
    on(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, new Set());
        }
        this.eventHandlers.get(eventType)?.add(handler);
    }
    // Unregister an event handler
    off(eventType, handler) {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    // Register a status change handler
    onStatusChange(handler) {
        this.statusHandlers.add(handler);
        // Call handler immediately with current status
        handler(this.status);
    }
    // Unregister a status change handler
    offStatusChange(handler) {
        this.statusHandlers.delete(handler);
    }
    // Get current connection status
    getStatus() {
        return this.status;
    }
    // Handle incoming events
    handleEvent(type, payload) {
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(payload);
                }
                catch (error) {
                    console.error(`Error in handler for event ${type}:`, error);
                }
            });
        }
    }
    // Update status and notify handlers
    updateStatus(status) {
        if (this.status !== status) {
            this.status = status;
            // Notify status handlers
            this.statusHandlers.forEach(handler => {
                try {
                    handler(status);
                }
                catch (error) {
                    console.error('Error in status handler:', error);
                }
            });
        }
    }
    // Attempt to reconnect to the WebSocket server
    attemptReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.groupId) {
            this.reconnectAttempts++;
            this.reconnectTimer = setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                // Try to reconnect
                this.connect(this.groupId).catch(error => {
                    console.error('Reconnection attempt failed:', error);
                });
            }, 2000 * Math.pow(1.5, this.reconnectAttempts - 1)); // Exponential backoff
        }
    }
}
// Export as singleton
export const socketService = new SocketService();
export default socketService;

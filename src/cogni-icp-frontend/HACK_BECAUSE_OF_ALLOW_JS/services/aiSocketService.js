import { io } from 'socket.io-client';
import { authService } from './authService';
// Constants
const CONNECTION_TIMEOUT = 5000; // 5 seconds timeout for connection attempts
const RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_ATTEMPTS = 3;
class AISocketService {
    constructor() {
        this.socket = null;
        this.sessionId = null;
        this.messageListeners = new Map();
        this.statusListeners = [];
        this.progressListeners = [];
        this.currentStatus = 'idle';
        this.connectionPromise = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
        this.messageHandlers = [];
        this.errorHandlers = [];
        this.isConnected = false;
        this.maxReconnectAttempts = 3;
        this.reconnectDelay = 1000;
        this.errorListeners = new Set();
        this.progressUpdateListeners = new Set();
        this.tutorAudioReadyListeners = new Set();
        // Initialize any necessary setup
    }
    getAuthToken() {
        try {
            const token = authService.getToken();
            if (!token) {
                console.error('AISocketService: No authentication token available');
                return null;
            }
            return token;
        }
        catch (error) {
            console.error('AISocketService: Error getting auth token:', error);
            return null;
        }
    }
    checkAuthentication() {
        const token = this.getAuthToken();
        if (!token) {
            return { isAuthenticated: false, errorMessage: 'No authentication token found' };
        }
        try {
            // Basic token validation
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                return { isAuthenticated: false, errorMessage: 'Invalid token format' };
            }
            // Check if token is expired
            const payload = JSON.parse(atob(tokenParts[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            if (Date.now() >= expirationTime) {
                return { isAuthenticated: false, errorMessage: 'Token has expired' };
            }
            return { isAuthenticated: true };
        }
        catch (error) {
            console.error('Error validating token:', error);
            return { isAuthenticated: false, errorMessage: 'Error validating token' };
        }
    }
    onProgressUpdate(callback) {
        this.progressListeners.push(callback);
    }
    offProgressUpdate(callback) {
        this.progressListeners = this.progressListeners.filter(cb => cb !== callback);
    }
    setupSocketListeners() {
        if (!this.socket)
            return;
        this.socket.on('progress_update', (data) => {
            this.progressListeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error('Error in progress update handler:', error);
                }
            });
        });
        // ... existing socket listeners ...
    }
    async connect(sessionId) {
        if (this.connectionPromise) {
            console.log('AISocketService: Returning existing connection promise');
            return this.connectionPromise;
        }
        if (this.socket?.connected) {
            console.log('AISocketService: Already connected');
            return true;
        }
        const authCheck = this.checkAuthentication();
        if (!authCheck.isAuthenticated) {
            console.error('AISocketService: Authentication failed:', authCheck.errorMessage);
            this.disconnect();
            return false;
        }
        if (this.isConnecting) {
            console.log('AISocketService: Connection attempt already in progress');
            return false;
        }
        // Clean up any existing socket
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.close();
            this.socket = null;
        }
        this.isConnecting = true;
        this.sessionId = sessionId;
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }
            // Get the API URL from environment variables or use a default
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            // Connect to the WebSocket server with Socket.IO configuration
            const socket = io(`${apiUrl}/tutor`, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: false,
                path: '/socket.io'
            });
            this.socket = socket;
            this.setupSocketListeners();
            this.connectionPromise = new Promise((resolve) => {
                // Handle successful connection
                socket.on('connect', () => {
                    console.log('AISocketService: Connected successfully to Socket.IO server');
                    this.isConnecting = false;
                    this.isConnected = true;
                    this.currentStatus = 'idle';
                    this.reconnectAttempts = 0;
                    // Join the session room using the /tutor namespace
                    socket.emit('join', { sessionId }, (response) => {
                        if (response?.error) {
                            console.error('AISocketService: Failed to join session:', response.error);
                            this.handleError(new Error(response.error));
                            resolve(false);
                        }
                        else {
                            console.log('AISocketService: Joined session successfully');
                            resolve(true);
                        }
                    });
                });
                // Handle connection error
                socket.on('connect_error', (error) => {
                    console.error('AISocketService: Connection error:', error);
                    this.handleError(error);
                    this.handleConnectionFailure();
                    resolve(false);
                });
                // Handle reconnection attempts
                socket.on('reconnect_attempt', (attemptNumber) => {
                    console.log(`AISocketService: Reconnection attempt ${attemptNumber}`);
                    this.reconnectAttempts = attemptNumber;
                });
                // Handle reconnection failure
                socket.on('reconnect_failed', () => {
                    console.error('AISocketService: Failed to reconnect after all attempts');
                    this.handleError(new Error('Failed to reconnect'));
                });
                // Handle successful reconnection
                socket.on('reconnect', (attemptNumber) => {
                    console.log(`AISocketService: Reconnected after ${attemptNumber} attempts`);
                    this.reconnectAttempts = 0;
                    if (this.sessionId) {
                        socket.emit('join', { sessionId: this.sessionId });
                    }
                });
                // Handle messages from the tutor
                socket.on('tutor_message_chunk', (chunk) => {
                    this.handleMessage(chunk);
                });
                socket.on('tutor_message_complete', () => {
                    this.handleMessage({ content: '', isComplete: true });
                });
                socket.on('tutor_audio_ready', (data) => {
                    this.tutorAudioReadyListeners.forEach(listener => listener(data));
                });
                // Handle disconnection
                socket.on('disconnect', (reason) => {
                    console.log('AISocketService: Disconnected, reason:', reason);
                    this.isConnected = false;
                    if (reason === 'io server disconnect') {
                        // Server initiated disconnect, try to reconnect
                        socket.connect();
                    }
                });
                // Start the connection
                socket.connect();
            });
            const result = await this.connectionPromise;
            this.connectionPromise = null;
            return result;
        }
        catch (error) {
            console.error('AISocketService: Connection error:', error);
            this.handleError(error);
            this.handleConnectionFailure();
            return false;
        }
        finally {
            this.isConnecting = false;
        }
    }
    handleConnectionFailure() {
        this.isConnecting = false;
        this.currentStatus = 'error';
        this.notifyStatusChange('error');
        if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            const delay = RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
            console.log(`AISocketService: Attempting reconnection (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms`);
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
            }
            this.reconnectTimeout = setTimeout(() => {
                if (this.sessionId) {
                    this.connect(this.sessionId);
                }
            }, delay);
        }
        else {
            console.log('AISocketService: Max reconnection attempts reached');
            this.disconnect();
        }
    }
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        // Clear any pending connection promise
        this.connectionPromise = null;
        // Reset state before disconnecting socket
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.currentStatus = 'idle';
        this.isConnected = false;
        // Clean up socket
        if (this.socket) {
            // Remove all listeners before disconnecting
            this.socket.removeAllListeners();
            // Force close the socket
            this.socket.close();
            this.socket.disconnect();
            this.socket = null;
        }
        // Notify status change after cleanup
        this.notifyStatusChange('idle');
        console.log('AISocketService: Disconnected');
    }
    sendMessage(content) {
        if (this.socket && this.isConnected) {
            this.socket.emit('message', { content });
        }
        else {
            console.warn('AISocketService: Cannot send message - not connected');
        }
    }
    sendVoiceMessage(transcript) {
        if (this.socket && this.isConnected) {
            this.socket.emit('voice_message', { transcript });
        }
        else {
            console.warn('AISocketService: Cannot send voice message - not connected');
        }
    }
    addMessageListener(sessionId, listener) {
        this.messageListeners.set(sessionId, listener);
    }
    removeMessageListener(sessionId, listener) {
        this.messageListeners.delete(sessionId);
    }
    onTutorStatusChange(listener) {
        this.statusListeners.push(listener);
    }
    offTutorStatusChange(listener) {
        this.statusListeners = this.statusListeners.filter(l => l !== listener);
    }
    notifyStatusChange(status) {
        this.statusListeners.forEach(listener => listener(status));
    }
    getCurrentStatus() {
        return this.currentStatus;
    }
    handleError(error) {
        this.errorHandlers.forEach(handler => handler(error));
    }
    handleMessage(message) {
        const messageChunk = {
            id: message.id,
            content: message.content,
            isComplete: message.isComplete
        };
        this.messageHandlers.forEach(handler => handler(messageChunk));
    }
    isConnectedToServer() {
        return this.isConnected;
    }
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }
    offMessage(handler) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }
    onError(handler) {
        this.errorHandlers.push(handler);
    }
    offError(handler) {
        this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    }
    onTutorAudioReady(listener) {
        this.tutorAudioReadyListeners.add(listener);
    }
    offTutorAudioReady(listener) {
        this.tutorAudioReadyListeners.delete(listener);
    }
}
// Create a single instance of the service
const aiSocketService = new AISocketService();
export { aiSocketService };

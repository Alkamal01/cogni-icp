import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MessageSquare, ArrowRight, Users, BookOpen, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../shared';
import { chatService } from '../../services/chatService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
const DiscussionModal = ({ isOpen, onClose, groupId, groupName }) => {
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimerRef = useRef(null);
    const initializedRef = useRef(false);
    const { toast } = useToast();
    const { user } = useAuth();
    // Function to fetch messages
    const fetchMessages = useCallback(async (nextPage = 1, append = false) => {
        if (loading || !hasMore)
            return;
        try {
            setLoading(true);
            const fetchedMessages = await chatService.getMessages(groupId, nextPage, 20);
            if (append) {
                setMessages(prevMessages => [...fetchedMessages.reverse(), ...prevMessages]);
            }
            else {
                setMessages(fetchedMessages.reverse());
            }
            setHasMore(fetchedMessages.length === 20); // Assuming if we get a full page, there might be more
            setPage(nextPage);
        }
        catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load messages. Please try again.',
                variant: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    }, [loading, hasMore, groupId, toast]);
    // Handle chat events
    const handleChatEvent = useCallback((event) => {
        switch (event.type) {
            case 'connected':
                setIsConnected(true);
                break;
            case 'disconnected':
                setIsConnected(false);
                break;
            case 'error':
                toast({
                    title: 'Chat Error',
                    description: event.payload.message || 'An error occurred with the chat connection',
                    variant: 'error'
                });
                break;
            case 'new_message':
                setMessages(prevMessages => [...prevMessages, event.payload]);
                break;
            case 'typing_started':
                setTypingUsers(prev => {
                    if (!prev.includes(event.payload.username)) {
                        return [...prev, event.payload.username];
                    }
                    return prev;
                });
                break;
            case 'typing_stopped':
                setTypingUsers(prev => prev.filter(username => username !== event.payload.username));
                break;
            default:
                break;
        }
    }, [toast]);
    // Initialize the chat - load messages and connect to WebSocket
    const initializeChat = useCallback(async (groupId) => {
        if (!groupId)
            return;
        try {
            setLoading(true);
            // First load messages using HTTP
            await fetchMessages();
            // Then establish WebSocket connection if not already connected
            // This prevents multiple connection attempts
            const connected = await chatService.connect();
            if (connected) {
                chatService.joinGroup(groupId);
                console.log('Successfully connected to chat socket and joined group:', groupId);
            }
            else {
                console.warn('Connected to socket but failed to join group chat');
                toast({
                    title: 'Partial Connection',
                    description: 'Connected to chat but real-time updates may not work properly.',
                    variant: 'warning'
                });
            }
        }
        catch (error) {
            console.error('Failed to initialize chat:', error);
            toast({
                title: 'Connection Error',
                description: 'Unable to establish real-time connection. You can still view and send messages.',
                variant: 'warning'
            });
        }
        finally {
            setLoading(false);
        }
    }, [fetchMessages, toast, groupId]);
    // Connect to WebSocket when the modal is opened
    useEffect(() => {
        // Skip if modal is not open or no groupId
        if (!isOpen || !groupId)
            return;
        // Only initialize once per modal instance
        if (initializedRef.current) {
            console.log("Chat already initialized for this modal instance");
            return;
        }
        initializedRef.current = true;
        console.log("Initializing chat for group:", groupId);
        // Add event listener
        chatService.addEventListener(handleChatEvent);
        // Connect to WebSocket and join group
        initializeChat(groupId);
        // Cleanup function
        return () => {
            console.log("Cleaning up chat connection for group:", groupId);
            // Remove event listener
            chatService.removeEventListener(handleChatEvent);
            // Leave group and disconnect
            chatService.leaveGroup();
            // Clear typing timer
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
            // Reset the initialization flag
            initializedRef.current = false;
        };
    }, [isOpen, groupId]); // Only depend on these two props
    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    // Function to handle loading more messages
    const handleLoadMore = () => {
        if (hasMore && !loading) {
            fetchMessages(page + 1, true);
        }
    };
    // Function to handle scroll to load more messages
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop } = messagesContainerRef.current;
            if (scrollTop === 0 && hasMore && !loading) {
                handleLoadMore();
            }
        }
    };
    // Handle typing indicator
    const handleTyping = () => {
        // Send typing started event
        chatService.sendTypingStarted();
        // Clear existing timer
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }
        // Set timer to send typing stopped after 2 seconds of inactivity
        typingTimerRef.current = setTimeout(() => {
            chatService.sendTypingStopped();
        }, 2000);
    };
    const handleSendMessage = async () => {
        if (!messageText.trim())
            return;
        try {
            // Clear the input
            setMessageText('');
            // Stop typing indicator
            chatService.sendTypingStopped();
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
            // Send the message
            chatService.sendMessage(messageText.trim());
        }
        catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message. Please try again.',
                variant: 'error'
            });
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        else {
            handleTyping();
        }
    };
    if (!isOpen)
        return null;
    // Format timestamp from ISO string
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Group Discussion</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{groupName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected && (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <span className="h-2 w-2 mr-1 rounded-full bg-green-500"></span>
                  Live
                </span>)}
              {!isConnected && (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <span className="h-2 w-2 mr-1 rounded-full bg-red-500"></span>
                  Offline
                </span>)}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            </button>
          </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef} onScroll={handleScroll}>
            {loading && page > 1 && (<div className="text-center py-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
              </div>)}
            
            {hasMore && !loading && (<div className="text-center">
                <button onClick={handleLoadMore} className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                  Load more messages
                </button>
              </div>)}
            
            {messages.length === 0 && !loading ? (<div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No messages yet. Be the first to start the conversation!</p>
              </div>) : (messages.map((message) => (<div key={message.id} className={`flex ${message.user.id === 0 // Assuming 0 means the current user (or we can get the current user's ID)
                ? 'justify-end'
                : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${message.user.id === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                    {message.user.id !== 0 && (<div className="flex-shrink-0 mr-3">
                        {message.user.avatar ? (<img src={message.user.avatar} alt={message.user.name || message.user.username} className="h-10 w-10 rounded-full object-cover"/>) : (<div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {(message.user.name || message.user.username)?.charAt(0)}
                        </div>)}
                    </div>)}
                  <div className={`flex flex-col ${message.user.id === 0 ? 'items-end mr-3' : 'items-start'}`}>
                    <div className={`p-3 rounded-lg ${message.user.id === 0
                ? 'bg-primary-600 text-white rounded-tr-none'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'}`}>
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (<div className="mt-2 pt-2 border-t border-gray-200/20">
                          {message.attachments.map((attachment, idx) => (<a key={idx} href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-200 hover:text-blue-100">
                              <BookOpen className="h-3 w-3 mr-1"/>
                              {attachment.title || attachment.url}
                            </a>))}
                        </div>)}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.user.id !== 0 && (message.user.name || message.user.username)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(message.timestamp)}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>)))}
            <div ref={messagesEndRef}/>
          </div>

          {typingUsers.length > 0 && (<div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
              {typingUsers.length === 1 ? (<p>{typingUsers[0]} is typing...</p>) : typingUsers.length === 2 ? (<p>{typingUsers[0]} and {typingUsers[1]} are typing...</p>) : (<p>Several people are typing...</p>)}
            </div>)}

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex space-x-2">
              <div className="flex-1">
                <textarea value={messageText} onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
        }} onKeyDown={handleKeyPress} placeholder="Type your message..." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" rows={2}/>
              </div>
              <div className="flex-shrink-0 flex items-end">
                <Button variant="primary" className="flex items-center" onClick={handleSendMessage} disabled={!messageText.trim()}>
                  Send
                  <ArrowRight className="ml-1 h-4 w-4"/>
                </Button>
              </div>
            </div>
            <div className="flex justify-start space-x-2 mt-2">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Brain className="h-5 w-5"/>
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <BookOpen className="h-5 w-5"/>
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Users className="h-5 w-5"/>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);
};
export default DiscussionModal;

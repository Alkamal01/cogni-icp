import { useState, useEffect, useCallback } from 'react';
import { aiSocketService } from '../services/aiSocketService';
export const useStreamingTutor = (sessionId) => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('idle');
    const [isConnected, setIsConnected] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    // This effect now ONLY saves to localStorage. It no longer reads from it.
    useEffect(() => {
        if (!sessionId || messages.length === 0)
            return;
        try {
            // We only save if the history has been loaded, to avoid overwriting
            // a reloaded page's localStorage with an empty array before API responds.
            if (isHistoryLoaded) {
                localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
            }
        }
        catch (error) {
            console.error('Failed to save messages to localStorage', error);
        }
    }, [messages, sessionId, isHistoryLoaded]);
    useEffect(() => {
        if (!sessionId || sessionId === 'undefined') {
            setIsConnected(false);
            return;
        }
        const connect = async () => {
            try {
                const success = await aiSocketService.connect(sessionId);
                setIsConnected(success);
                setIsError(!success);
            }
            catch (error) {
                setIsConnected(false);
                setIsError(true);
            }
        };
        const handleMessage = (msg) => {
            setStatus('responding');
            setMessages(prevMessages => {
                const existingMessageIndex = prevMessages.findIndex(m => m.id === msg.id && m.sender === 'tutor');
                if (existingMessageIndex !== -1) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingMessageIndex] = {
                        ...updatedMessages[existingMessageIndex],
                        content: updatedMessages[existingMessageIndex].content + (msg.content || ''),
                    };
                    return updatedMessages;
                }
                else {
                    const newTutorMessage = {
                        id: msg.id || `tutor-${Date.now()}`,
                        sender: 'tutor',
                        content: msg.content || '',
                        timestamp: new Date().toISOString(),
                        session_id: sessionId,
                    };
                    return [...prevMessages, newTutorMessage];
                }
            });
            if (msg.isComplete) {
                setStatus('idle');
            }
        };
        const handleError = (error) => {
            console.error('Tutor WebSocket error:', error);
            setIsError(true);
            setStatus('error');
        };
        connect();
        aiSocketService.onMessage(handleMessage);
        aiSocketService.onError(handleError);
        return () => {
            aiSocketService.offMessage(handleMessage);
            aiSocketService.offError(handleError);
            aiSocketService.disconnect();
        };
    }, [sessionId]);
    const sendMessage = useCallback((content) => {
        if (!sessionId || !content.trim())
            return;
        const userMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            content,
            timestamp: new Date().toISOString(),
            session_id: sessionId,
        };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setStatus('thinking');
        aiSocketService.sendMessage(content);
    }, [sessionId]);
    const loadInitialMessages = useCallback((initialMessages) => {
        if (!isHistoryLoaded) {
            // If localStorage has messages, we should probably use them,
            // as they might be more up-to-date than the database.
            // Let's check localStorage here ONE TIME.
            const savedMessagesRaw = localStorage.getItem(`chat_messages_${sessionId || ''}`);
            if (savedMessagesRaw) {
                try {
                    const savedMessages = JSON.parse(savedMessagesRaw);
                    if (savedMessages.length >= initialMessages.length) {
                        setMessages(savedMessages);
                        setIsHistoryLoaded(true);
                        return;
                    }
                }
                catch (e) {
                    // ignore parsing error
                }
            }
            setMessages(initialMessages);
            setIsHistoryLoaded(true);
        }
    }, [isHistoryLoaded, sessionId]);
    return {
        isConnected,
        isError,
        status,
        messages,
        sendMessage,
        loadInitialMessages,
    };
};

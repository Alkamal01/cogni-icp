import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { ArrowRight } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  // Check backend connectivity
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Try to fetch a simple endpoint that doesn't require authentication
        const response = await apiService.get('/api/health', { timeout: 5000 });
        if (response.status === 200) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
          showToast('error', 'Unable to connect to the tutor service. The backend may be down.');
        }
      } catch (error) {
        console.error('Backend connectivity check failed:', error);
        setBackendStatus('offline');
        showToast('error', 'Unable to connect to the tutor service. The backend may be down.');
      }
    };

    checkBackendStatus();
  }, [showToast]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (backendStatus === 'offline') {
      showToast('error', 'Cannot send message while offline. Please wait for backend connectivity.');
      return;
    }
    
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "Chat is disabled for this session"
            : backendStatus === 'offline'
            ? "Backend service is offline..."
            : "Type your message here..."
        }
        disabled={disabled || isLoading || backendStatus === 'offline'}
        className="flex-grow resize-none overflow-hidden border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        style={{ minHeight: '50px', maxHeight: '150px' }}
      />
      <button
        type="submit"
        disabled={!message.trim() || isLoading || disabled || backendStatus === 'offline'}
        className={`ml-2 p-3 rounded-full ${
          !message.trim() || isLoading || disabled || backendStatus === 'offline'
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
        } text-white`}
      >
        <ArrowRight size={20} />
      </button>
    </form>
  );
};

export default ChatInput; 
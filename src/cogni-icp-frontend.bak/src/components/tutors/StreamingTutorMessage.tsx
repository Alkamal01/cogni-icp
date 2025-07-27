import React, { useEffect, useState } from 'react';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { useStreamingTutor } from '../../hooks/useStreamingTutor';

interface StreamingTutorMessageProps {
  sessionId: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// Typing animation speed in milliseconds (higher = slower)
const TYPING_SPEED = 50;

export const StreamingTutorMessage: React.FC<StreamingTutorMessageProps> = ({
  sessionId,
  onComplete,
  onError,
}) => {
  const {
    isConnected,
    isError,
    status,
    messages,
  } = useStreamingTutor(sessionId);
  const [displayedContent, setDisplayedContent] = useState('');

  const lastTutorMessage = messages.filter((m) => m.sender === 'tutor').pop();
  const fullMessage = lastTutorMessage?.content || '';
  const isComplete = status === 'idle' && !!lastTutorMessage;

  useEffect(() => {
    if (status === 'thinking') {
      setDisplayedContent('');
    }
  }, [status]);

  useEffect(() => {
    if (fullMessage.length > displayedContent.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(fullMessage.substring(0, displayedContent.length + 1));
      }, TYPING_SPEED);

      return () => clearTimeout(timer);
    } else if (isComplete) {
      onComplete?.();
    }
  }, [displayedContent, fullMessage, isComplete, onComplete]);

  useEffect(() => {
    if (isError) {
      onError?.(new Error('WebSocket connection error'));
    }
  }, [isError, onError]);

  const renderContent = () => {
    if (!isConnected && !isError) {
      return <div>Connecting...</div>;
  }
  if (isError) {
      return <div className="text-red-500">Connection error.</div>;
  }
    if (status === 'thinking' && !fullMessage) {
    return <div>Thinking...</div>;
  }
    if (!displayedContent && isComplete) {
    return null;
  }
    return <MarkdownRenderer content={displayedContent} />;
  };
  
  const showTypingIndicator = status === 'responding' && !isComplete;

  return (
    <>
      {renderContent()}
      {showTypingIndicator && (
        <div className="flex items-center space-x-1 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
      )}
    </>
  );
};

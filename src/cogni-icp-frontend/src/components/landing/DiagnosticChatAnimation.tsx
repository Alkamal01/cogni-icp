import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  typing?: boolean;
}

const DiagnosticChatAnimation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined conversation
  const conversation: Message[] = [
    { id: 1, text: "I need help with math", isUser: true },
    { id: 2, text: "I'd be happy to help! What topic are you studying?", isUser: false },
    { id: 3, text: "Quadratic equations", isUser: true },
    { id: 4, text: "Great! Quadratic equations are in the form ax² + bx + c = 0", isUser: false }
  ];

  // Add to debug logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 10)); // Keep only most recent 10 logs
  };

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Animation effect
  useEffect(() => {
    if (!isAnimating) {
      addLog("Animation paused");
      return;
    }

    if (currentIndex >= conversation.length) {
      addLog("Conversation complete, no more messages");
      return;
    }

    addLog(`Processing message ${currentIndex + 1} of ${conversation.length}`);
    const nextMessage = conversation[currentIndex];

    if (!nextMessage.isUser) {
      // AI message shows typing indicator first
      addLog("Adding AI message with typing indicator");
      setMessages(prev => [...prev, { ...nextMessage, text: "", typing: true }]);
      
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < nextMessage.text.length) {
          addLog(`Typing character ${charIndex + 1}/${nextMessage.text.length}`);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === nextMessage.id 
                ? { ...msg, text: nextMessage.text.substring(0, charIndex + 1) }
                : msg
            )
          );
          charIndex++;
        } else {
          // Typing complete
          addLog("Finished typing AI message");
          clearInterval(typingInterval);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === nextMessage.id 
                ? { ...msg, typing: false }
                : msg
            )
          );
          
          // Move to next message
          setTimeout(() => {
            addLog("Moving to next message");
            setCurrentIndex(prev => prev + 1);
          }, 1000);
        }
      }, 50);
      
      // Cleanup
      return () => {
        addLog("Cleaning up typing interval");
        clearInterval(typingInterval);
      };
    } else {
      // User message appears immediately
      addLog("Adding user message immediately");
      setMessages(prev => [...prev, nextMessage]);
      
      // Short delay before next message
      const timer = setTimeout(() => {
        addLog("User message processed, moving to next step");
        setCurrentIndex(prev => prev + 1);
      }, 1000);
      
      // Cleanup
      return () => {
        addLog("Cleaning up user message timer");
        clearTimeout(timer);
      };
    }
  }, [currentIndex, isAnimating, conversation]);

  const handleReset = () => {
    addLog("Reset clicked - clearing messages");
    setMessages([]);
    setCurrentIndex(0);
  };

  const handleToggleAnimation = () => {
    addLog(`${isAnimating ? "Pausing" : "Resuming"} animation`);
    setIsAnimating(!isAnimating);
  };

  return (
    <div className="w-full max-w-md mx-auto border border-gray-300 rounded-lg overflow-hidden flex flex-col h-[400px]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <h2 className="font-bold">Diagnostic Chat Demo</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleToggleAnimation}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            {isAnimating ? 'Pause' : 'Resume'}
          </button>
          <button 
            onClick={handleReset}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-grow bg-gray-100 p-3 overflow-y-auto flex flex-col space-y-3">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-blue-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none'
              }`}
            >
              {message.text}
              {message.typing && (
                <div className="flex space-x-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Debug panel */}
      <div className="bg-gray-800 text-green-400 p-2 text-xs font-mono overflow-y-auto h-24">
        <div className="font-bold mb-1">Debug logs:</div>
        {debugLogs.map((log, i) => (
          <div key={i} className="truncate">{log}</div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticChatAnimation; 
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, BookOpen } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  typing?: boolean;
}

const AnimatedConversationTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Predefined conversation
  const conversation: Message[] = [
    { id: 1, text: "I need help understanding the quadratic formula.", sender: 'user' },
    { id: 2, text: "The quadratic formula is used to solve quadratic equations of the form ax² + bx + c = 0.", sender: 'ai' },
    { id: 3, text: "Would you like me to solve a specific problem for you?", sender: 'ai' },
  ];

  // Debug logs
  useEffect(() => {
    console.log("AnimatedConversationTest rendered");
    console.log("Current step:", currentStep);
    console.log("Messages:", messages);
  }, [currentStep, messages]);

  // Typing animation effect
  useEffect(() => {
    console.log("Effect triggered, currentStep:", currentStep, "conversation length:", conversation.length);
    
    if (currentStep < conversation.length) {
      console.log("Processing message at step:", currentStep);
      // Add message with typing indicator for AI messages
      const nextMessage = conversation[currentStep];
      
      if (nextMessage.sender === 'ai') {
        console.log("Adding AI message with typing indicator");
        // First show typing indicator
        setMessages(prev => [...prev, { ...nextMessage, text: "", typing: true }]);
        
        // Delay between start of typing and first character
        const initialDelay = 300;
        
        // Then animate the text appearing character by character
        let charIndex = 0;
        setTimeout(() => {
          console.log("Starting character-by-character animation");
          const typingInterval = setInterval(() => {
            if (charIndex < nextMessage.text.length) {
              console.log("Typing character:", charIndex + 1);
              setMessages(prev => prev.map(msg => 
                msg.id === nextMessage.id 
                  ? { ...msg, text: nextMessage.text.substring(0, charIndex + 1), typing: true } 
                  : msg
              ));
              charIndex++;
            } else {
              // Done typing
              console.log("Finished typing");
              setMessages(prev => prev.map(msg => 
                msg.id === nextMessage.id 
                  ? { ...msg, typing: false } 
                  : msg
              ));
              clearInterval(typingInterval);
              
              // Move to next message after a delay
              setTimeout(() => {
                console.log("Moving to next step");
                setCurrentStep(prev => prev + 1);
              }, 800);
            }
          }, 30); // Speed of typing
        }, initialDelay);
      } else {
        console.log("Adding user message immediately");
        // User messages appear immediately
        setMessages(prev => [...prev, nextMessage]);
        
        // Short delay before AI response
        setTimeout(() => {
          console.log("Moving to next step after user message");
          setCurrentStep(prev => prev + 1);
        }, 800);
      }
    }
  }, [currentStep]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[400px] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <h2 className="text-center text-xl font-bold p-4">Animated Conversation Test</h2>
      
      {/* Chat area */}
      <div 
        ref={conversationRef}
        className="overflow-y-auto px-4 py-3 h-[300px]"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-blue-100 text-blue-700 ml-2' 
                    : 'bg-gray-100 text-gray-700 mr-2'
                }`}>
                  {message.sender === 'user' ? <User className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </div>
                
                <div className={`rounded-xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.text}
                  {message.typing && (
                    <div className="flex space-x-1 mt-1 h-5">
                      <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Debug panel */}
      <div className="bg-gray-100 p-2 text-xs">
        Current step: {currentStep} | Messages: {messages.length}
      </div>
    </div>
  );
};

export default AnimatedConversationTest; 
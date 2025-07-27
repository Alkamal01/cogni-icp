import React, { useState, useEffect, useRef } from 'react';
import { User, BookOpen } from 'lucide-react';
const AnimatedMathChat = () => {
    const [messages, setMessages] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const messagesEndRef = useRef(null);
    // Sample conversation about quadratic formula
    const conversation = [
        { id: 1, text: "I need help understanding the quadratic formula.", sender: 'user' },
        { id: 2, text: "I'd be happy to help you understand the quadratic formula! The quadratic formula is used to solve quadratic equations in the form ax² + bx + c = 0.", sender: 'ai' },
        { id: 3, text: "The formula is: x = (-b ± √(b² - 4ac)) / 2a", sender: 'ai' },
        { id: 4, text: "Can you help me solve this equation: 2x² - 5x + 2 = 0", sender: 'user' },
        { id: 5, text: "Absolutely! Let's solve 2x² - 5x + 2 = 0 using the quadratic formula.", sender: 'ai' },
        { id: 6, text: "Step 1: Identify the values of a, b, and c\na = 2, b = -5, c = 2", sender: 'ai' },
        { id: 7, text: "Step 2: Substitute into the formula\nx = (-(-5) ± √((-5)² - 4×2×2)) / (2×2)\nx = (5 ± √(25 - 16)) / 4\nx = (5 ± √9) / 4\nx = (5 ± 3) / 4", sender: 'ai' },
        { id: 8, text: "Step 3: Calculate both solutions\nx₁ = (5 + 3) / 4 = 8/4 = 2\nx₂ = (5 - 3) / 4 = 2/4 = 0.5 or 1/2", sender: 'ai' },
        { id: 9, text: "Therefore, the solutions are x = 2 and x = 0.5", sender: 'ai' }
    ];
    // Reset the conversation
    const resetConversation = () => {
        setMessages([]);
        setCurrentStep(0);
    };
    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    // Animation effect
    useEffect(() => {
        if (currentStep >= conversation.length)
            return;
        const nextMessage = conversation[currentStep];
        if (nextMessage.sender === 'ai') {
            // First show typing indicator
            setMessages(prev => [...prev, { ...nextMessage, text: "", typing: true }]);
            // Then animate text appearing
            let charIndex = 0;
            const typingInterval = setInterval(() => {
                if (charIndex < nextMessage.text.length) {
                    setMessages(prev => prev.map(msg => msg.id === nextMessage.id
                        ? { ...msg, text: nextMessage.text.substring(0, charIndex + 1) }
                        : msg));
                    charIndex++;
                }
                else {
                    // Done typing
                    clearInterval(typingInterval);
                    setMessages(prev => prev.map(msg => msg.id === nextMessage.id
                        ? { ...msg, typing: false }
                        : msg));
                    // Move to next message after a delay
                    setTimeout(() => {
                        setCurrentStep(prev => prev + 1);
                    }, 800);
                }
            }, 30);
            return () => clearInterval(typingInterval);
        }
        else {
            // User messages appear immediately
            setMessages(prev => [...prev, nextMessage]);
            // Short delay before AI response
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentStep, conversation]);
    return (<div className="w-full max-w-lg mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-md flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2"/>
          <span className="font-medium">Math Tutor</span>
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Online</span>
        </div>
        <button onClick={resetConversation} className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-700 text-white rounded">
          Reset
        </button>
      </div>
      
      {/* Conversation area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-[300px] max-h-[300px]">
        {messages.map((message) => (<div key={message.id} className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'ai' && (<div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
              </div>)}
            
            <div className={`p-3 rounded-lg max-w-[75%] ${message.sender === 'user'
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
              <div className="whitespace-pre-line">{message.text}</div>
              {message.typing && (<div className="flex items-center space-x-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>)}
            </div>
            
            {message.sender === 'user' && (<div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 flex-shrink-0">
                <User className="h-5 w-5 text-white"/>
              </div>)}
          </div>))}
        <div ref={messagesEndRef}/>
      </div>
      
      {/* Input field (non-functional, for display only) */}
      <div className="p-3 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex">
        <input type="text" placeholder="Type your message..." disabled className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none dark:bg-gray-700 dark:text-gray-200"/>
        <button disabled className="px-4 py-2 bg-blue-500 text-white rounded-r-lg">
          Send
        </button>
      </div>
    </div>);
};
export default AnimatedMathChat;

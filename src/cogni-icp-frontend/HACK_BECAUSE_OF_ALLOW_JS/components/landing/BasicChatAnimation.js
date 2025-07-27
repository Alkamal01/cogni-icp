import React, { useState, useEffect } from 'react';
const MESSAGES = [
    { id: 1, text: "Hi, I need help with algebra", isUser: true },
    { id: 2, text: "I'm happy to help with algebra! What's your question?", isUser: false },
    { id: 3, text: "How do I solve quadratic equations?", isUser: true },
    { id: 4, text: "To solve a quadratic equation (ax² + bx + c = 0), you can use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a", isUser: false }
];
const BasicChatAnimation = () => {
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [resetTrigger, setResetTrigger] = useState(0);
    // Display messages one by one with timing
    useEffect(() => {
        if (currentIndex >= MESSAGES.length)
            return;
        const timer = setTimeout(() => {
            setVisibleMessages(prev => [...prev, MESSAGES[currentIndex]]);
            setCurrentIndex(prevIndex => prevIndex + 1);
        }, 1500); // 1.5 seconds between messages
        return () => clearTimeout(timer);
    }, [currentIndex, resetTrigger]);
    const handleReset = () => {
        setVisibleMessages([]);
        setCurrentIndex(0);
        setResetTrigger(prev => prev + 1); // Trigger useEffect again
    };
    return (<div className="w-full max-w-md mx-auto border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h2 className="font-bold">Chat Animation Demo</h2>
        <button onClick={handleReset} className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
          Restart
        </button>
      </div>

      {/* Chat area */}
      <div className="h-72 bg-gray-100 p-4 overflow-y-auto flex flex-col space-y-4">
        {visibleMessages.map(message => (<div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${message.isUser
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-white text-gray-800 rounded-tl-none'}`}>
              {message.text}
            </div>
          </div>))}

        {currentIndex < MESSAGES.length && (<div className="flex justify-start">
            <div className="bg-gray-300 text-gray-800 p-2 rounded-lg">
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse ml-1" style={{ animationDelay: '0.2s' }}></span>
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse ml-1" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>)}

        {currentIndex >= MESSAGES.length && (<div className="text-center text-gray-500 text-sm mt-4">
            End of conversation. Click restart to view again.
          </div>)}
      </div>

      {/* Debug info */}
      <div className="bg-gray-200 p-2 text-xs text-gray-600">
        Progress: {visibleMessages.length} / {MESSAGES.length} messages
      </div>
    </div>);
};
export default BasicChatAnimation;

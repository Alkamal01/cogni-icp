import React, { useState, useEffect } from 'react';

const SimpleAnimation: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    console.log("SimpleAnimation useEffect called, isAnimating:", isAnimating);
    
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      console.log("Interval triggered, updating count");
      setCount(c => c + 1);
    }, 1000);
    
    return () => {
      console.log("Cleaning up interval");
      clearInterval(interval);
    };
  }, [isAnimating]);
  
  const toggleAnimation = () => {
    console.log("Toggle animation clicked");
    setIsAnimating(!isAnimating);
  };
  
  const resetCounter = () => {
    console.log("Reset counter clicked");
    setCount(0);
  };

  return (
    <div className="w-full max-w-md mx-auto border border-gray-300 rounded-lg p-8 bg-white text-center">
      <h2 className="text-2xl font-bold mb-4">Simple Animation Test</h2>
      
      <div className="text-5xl font-bold mb-8">
        {count}
      </div>
      
      <div className="flex justify-center space-x-4">
        <button 
          onClick={toggleAnimation} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAnimating ? 'Pause' : 'Resume'}
        </button>
        
        <button 
          onClick={resetCounter}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Status: {isAnimating ? 'Animating' : 'Paused'}
      </div>
    </div>
  );
};

export default SimpleAnimation; 
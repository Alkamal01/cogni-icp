import React, { useState, useEffect } from 'react';
import { Button } from '../components/shared';
import { authService } from '../services/authService';

const LoginTestPage: React.FC = () => {
  const [tokenStatus, setTokenStatus] = useState<string>('Checking...');
  const [userId, setUserId] = useState<number | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  
  // Check token status on component mount
  useEffect(() => {
    checkTokenStatus();
  }, []);
  
  // Function to check and display token status
  const checkTokenStatus = () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        setTokenStatus('No token found');
        setUserId(null);
        setTokenExpiry(null);
        return;
      }
      
      // Parse token
      const parts = token.split('.');
      if (parts.length !== 3) {
        setTokenStatus('Invalid token format');
        return;
      }
      
      try {
        const payload = JSON.parse(atob(parts[1]));
        
        // Extract user ID
        setUserId(payload.sub || null);
        
        // Check expiration
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          setTokenExpiry(expiryDate.toLocaleString());
          
          if (expiryDate < new Date()) {
            setTokenStatus('Token expired');
          } else {
            setTokenStatus('Valid token');
          }
        } else {
          setTokenStatus('Token has no expiration');
        }
      } catch (error) {
        setTokenStatus('Error parsing token');
      }
    } catch (error) {
      setTokenStatus('Error checking token');
    }
  };
  
  // Function to generate a test token
  const generateTestToken = () => {
    // Create a basic test token that expires in 1 hour
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      sub: 123, // User ID
      name: 'Test User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    };
    
    // Encode header and payload (not a real JWT, just for testing)
    const headerStr = btoa(JSON.stringify(header));
    const payloadStr = btoa(JSON.stringify(payload));
    
    // Create fake signature (in a real app, this would be properly signed)
    const signature = btoa('test-signature');
    
    // Create the token
    const token = `${headerStr}.${payloadStr}.${signature}`;
    
    // Store the token
    authService.setTokens(token, token);
    
    // Update status
    checkTokenStatus();
  };
  
  // Function to clear token
  const clearToken = () => {
    authService.clearTokens();
    checkTokenStatus();
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Authentication Debug Tool
          </h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Token Status</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</p>
              <p className={`mt-1 text-sm font-semibold ${
                tokenStatus === 'Valid token' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {tokenStatus}
              </p>
            </div>
            
            {userId !== null && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{userId}</p>
              </div>
            )}
            
            {tokenExpiry && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires:</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{tokenExpiry}</p>
              </div>
            )}
            
            <div className="pt-4 flex flex-col space-y-3">
              <Button variant="primary" onClick={generateTestToken}>
                Generate Test Token
              </Button>
              
              <Button variant="outline" onClick={clearToken}>
                Clear Token
              </Button>
              
              <Button variant="outline" onClick={checkTokenStatus}>
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTestPage;

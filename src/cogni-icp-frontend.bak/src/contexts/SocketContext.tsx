import React, { createContext, useContext } from 'react';

interface MockSocket {
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
}

interface SocketContextType {
  socket: MockSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Mock socket provider that doesn't actually connect to backend
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a mock socket implementation
  const mockSocket: MockSocket = {
    emit: (event: string, data: any) => {
      console.log('Mock socket emit:', event, data);
    },
    on: (event: string, callback: (data: any) => void) => {
      console.log('Mock socket on:', event);
    },
    off: (event: string) => {
      console.log('Mock socket off:', event);
    }
  };

  // Always return a mock socket context
  const mockSocketContext = {
    socket: mockSocket,
    isConnected: true
  };

  return (
    <SocketContext.Provider value={mockSocketContext}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
}; 
import React, { createContext, useContext } from 'react';
const SocketContext = createContext(undefined);
// Mock socket provider that doesn't actually connect to backend
export const SocketProvider = ({ children }) => {
    // Create a mock socket implementation
    const mockSocket = {
        emit: (event, data) => {
            console.log('Mock socket emit:', event, data);
        },
        on: (event, callback) => {
            console.log('Mock socket on:', event);
        },
        off: (event) => {
            console.log('Mock socket off:', event);
        }
    };
    // Always return a mock socket context
    const mockSocketContext = {
        socket: mockSocket,
        isConnected: true
    };
    return (<SocketContext.Provider value={mockSocketContext}>
      {children}
    </SocketContext.Provider>);
};
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context.socket;
};

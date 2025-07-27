import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { SocketProvider } from './SocketContext';
/**
 * AppProvider component that combines all context providers
 * The order matters! Providers that depend on other providers should be nested inside them.
 */
export const AppProvider = ({ children }) => {
    return (
    // ThemeProvider is the outermost since it doesn't depend on any other contexts
    <ThemeProvider>
      {/* AuthProvider for authentication, required by many other contexts */}
      <AuthProvider>
        {/* ToastProvider for notifications */}
        <ToastProvider>
          {/* SocketProvider for real-time communication */}
          <SocketProvider>

              {/* Router should be the innermost wrapper, as it might depend on auth state */}
              <Router>
                {children}
              </Router>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>);
};
export default AppProvider;

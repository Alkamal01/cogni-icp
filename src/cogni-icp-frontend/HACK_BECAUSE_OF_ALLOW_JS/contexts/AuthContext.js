import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
// Create a custom API instance for auth
const authApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth` : 'http://localhost:5000/api/auth'
});
// Add request interceptor to attach JWT token to all requests
authApi.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        // Set the Authorization header with the token
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        // Ensure content type is set
        config.headers['Content-Type'] = 'application/json';
    }
    // Add session ID if available
    const sessionId = Cookies.get('session_id');
    if (sessionId) {
        config.headers = config.headers || {};
        config.headers['X-Session-ID'] = sessionId;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Add response interceptor to handle authentication errors
authApi.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Let the global apiClient interceptor handle this
        return Promise.reject(error);
    }
    return Promise.reject(error);
});
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);
    // Fetch user data - extracted as a reusable function
    const fetchUserData = useCallback(async (token, sessionIdValue) => {
        try {
            // Add a delay to prevent rapid firing of requests
            const response = await authApi.get('/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-Session-ID': sessionIdValue || Cookies.get('session_id') || '',
                }
            });
            if (response.data) {
                console.log("User data retrieved successfully");
                setUser(response.data);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("Error fetching user data:", error);
            // Special handling for 422 errors which might indicate invalid token format
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                console.warn("Received 422 error - likely invalid token format. Clearing token.");
                Cookies.remove('token');
            }
            return false;
        }
    }, []);
    // Refresh token function
    const refreshAuthToken = useCallback(async () => {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken)
            return false;
        try {
            console.log("Attempting to refresh token");
            const response = await axios.post(process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth/refresh` : 'http://localhost:5000/api/auth/refresh', {}, {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }
            });
            if (response.data.access_token) {
                console.log("Token refreshed successfully");
                // Store the new access token
                Cookies.set('token', response.data.access_token, { expires: 1 }); // 1 day expiry
                // Return true to indicate success, but don't update user state directly here
                // This prevents potential infinite loops
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    }, []);
    // Check authentication status
    useEffect(() => {
        // Track whether the component is mounted to prevent state updates after unmount
        let isMounted = true;
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                console.log("Checking authentication status");
                // Check for tokens
                const token = Cookies.get('token');
                const refreshToken = Cookies.get('refresh_token');
                const storedSessionId = Cookies.get('session_id');
                // Set session ID if it exists
                if (storedSessionId && isMounted) {
                    setSessionId(parseInt(storedSessionId, 10));
                }
                // Try using access token first
                if (token) {
                    console.log("Found access token, attempting to use it");
                    const success = await fetchUserData(token);
                    if (success && isMounted) {
                        setIsLoading(false);
                        return;
                    }
                }
                // If no token or token failed, try to refresh
                if (refreshToken) {
                    console.log("Access token invalid or missing, trying to refresh");
                    const refreshed = await refreshAuthToken();
                    if (refreshed && isMounted) {
                        // Token refreshed, now try to fetch user data
                        const newToken = Cookies.get('token');
                        if (newToken) {
                            await fetchUserData(newToken);
                        }
                        if (isMounted)
                            setIsLoading(false);
                        return;
                    }
                }
                // If we reach here, user is not authenticated
                console.log("Authentication failed, user not logged in");
                if (isMounted)
                    setUser(null);
            }
            catch (error) {
                console.error("Authentication check failed:", error);
                if (isMounted)
                    setUser(null);
            }
            finally {
                if (isMounted)
                    setIsLoading(false);
            }
        };
        checkAuth();
        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [fetchUserData, refreshAuthToken]); // Remove user dependency to prevent loop
    const login = async (email, password) => {
        try {
            console.log("Attempting login for:", email);
            const response = await authApi.post('/login', { email, password });
            if (response.data.access_token) {
                const token = response.data.access_token;
                console.log("Login successful, storing tokens");
                // Store the JWT token in a cookie
                Cookies.set('token', token, { expires: 1 }); // 1 day expiry
                // Store session ID if provided
                if (response.data.session_id) {
                    setSessionId(response.data.session_id);
                    Cookies.set('session_id', response.data.session_id.toString(), { expires: 30 }); // 30 days expiry
                }
                // Store refresh token if provided
                if (response.data.refresh_token) {
                    console.log("Storing refresh token");
                    Cookies.set('refresh_token', response.data.refresh_token, { expires: 30 }); // 30 days expiry
                }
                // Set user data directly from the login response if available
                if (response.data.user) {
                    console.log("Setting user data from login response");
                    setUser(response.data.user);
                    return; // Skip the additional /me request if we already have user data
                }
                // If user data not in login response, fetch it from /me endpoint
                await fetchUserData(token, response.data.session_id?.toString());
            }
            else {
                console.error("Login response missing access token");
                throw new Error('Login failed: No token received');
            }
        }
        catch (error) {
            console.error('Login error:', error);
            // Clear any partial auth data on login failure
            Cookies.remove('token');
            throw error;
        }
    };
    const register = async (data) => {
        try {
            await authApi.post('/register', data);
            // Registration successful, but user needs to verify email before login
        }
        catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };
    // Client-side logout helper
    const performClientLogout = useCallback(() => {
        console.log("Performing client-side logout");
        // Clear all auth-related cookies
        Cookies.remove('token');
        Cookies.remove('refresh_token');
        Cookies.remove('session_id');
        // Clear Authorization header
        delete authApi.defaults.headers.common['Authorization'];
        // Reset user state
        setUser(null);
        setSessionId(null);
        // Redirect to login page
        window.location.href = '/login';
    }, []);
    const logout = useCallback(() => {
        try {
            console.log("Logging out user");
            // Call logout endpoint with session ID if available
            authApi.post('/logout', {}, {
                headers: {
                    'X-Session-ID': sessionId?.toString() || ''
                }
            }).catch(error => {
                console.error('Error calling logout endpoint:', error);
                // Continue with client-side logout even if server logout fails
            }).finally(() => {
                performClientLogout();
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            // Ensure cleanup happens even if there's an error
            performClientLogout();
        }
    }, [sessionId, performClientLogout]);
    const socialLogin = (provider) => {
        // Redirect to backend OAuth endpoint
        if (provider === 'google') {
            window.location.href = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth/oauth/google` : 'http://localhost:5000/api/auth/oauth/google';
        }
        else {
            console.error(`OAuth provider ${provider} not implemented`);
        }
    };
    const forgotPassword = async (email) => {
        try {
            const response = await authApi.post('/forgot-password', { email });
            return response.data.message;
        }
        catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    };
    const resetPassword = async (token, password, confirmPassword) => {
        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            const response = await authApi.post(`/reset-password/${token}`, {
                password,
                confirm_password: confirmPassword
            });
            return response.data.message;
        }
        catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    };
    const verifyEmail = async (token) => {
        try {
            const response = await authApi.get(`/verify-email/${token}`);
            return response.data.message;
        }
        catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    };
    const resendVerification = async (email) => {
        try {
            const response = await authApi.post('/resend-verification', { email });
            return response.data.message;
        }
        catch (error) {
            console.error('Resend verification error:', error);
            throw error;
        }
    };
    return (<AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isLoading,
            setUser,
            socialLogin,
            forgotPassword,
            resetPassword,
            verifyEmail,
            resendVerification,
            sessionId
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export default AuthContext;

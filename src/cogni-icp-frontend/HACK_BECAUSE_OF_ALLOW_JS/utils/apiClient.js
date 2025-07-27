import axios from 'axios';
import Cookies from 'js-cookie';
// Set up axios instance with base URL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});
let isRefreshing = false;
let refreshAttemptTime = 0;
const REFRESH_COOLDOWN = 5000;
let refreshSubscribers = [];
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};
const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};
const refreshToken = async () => {
    const now = Date.now();
    if (now - refreshAttemptTime < REFRESH_COOLDOWN) {
        console.log("Refresh attempted too recently, skipping");
        return null;
    }
    refreshAttemptTime = now;
    try {
        if (isRefreshing) {
            console.log("Already refreshing token, waiting...");
            return null;
        }
        isRefreshing = true;
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
            console.error("No refresh token available");
            Cookies.remove('token');
            Cookies.remove('session_id');
            Cookies.remove('refresh_token');
            window.location.href = '/login';
            return null;
        }
        console.log("Attempting to refresh token");
        const response = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {}, {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });
        if (!response.data.access_token) {
            console.error("Refresh response missing access token", response.data);
            throw new Error("Invalid refresh response");
        }
        const newToken = response.data.access_token;
        console.log("Token refreshed successfully");
        Cookies.set('token', newToken, { expires: 1 }); // 1 day expiry
        if (response.data.user) {
            console.log("User data received with token refresh");
        }
        return newToken;
    }
    catch (error) {
        console.error("Token refresh failed:", error);
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            Cookies.remove('token');
            Cookies.remove('refresh_token');
            Cookies.remove('session_id');
            window.location.href = '/login';
        }
        return null;
    }
    finally {
        isRefreshing = false;
    }
};
// Add request interceptor
api.interceptors.request.use(async (config) => {
    console.log(`🚀 REQUEST [${config.method?.toUpperCase()}] ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
    });
    const token = Cookies.get('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Include session ID if available
    const sessionId = Cookies.get('session_id');
    if (sessionId) {
        config.headers['X-Session-ID'] = sessionId;
    }
    return config;
}, (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
});
// Add response interceptor
api.interceptors.response.use((response) => {
    console.log(`✅ RESPONSE [${response.status}] ${response.config.url}`, {
        data: response.data,
        headers: response.headers
    });
    return response;
}, async (error) => {
    console.error('❌ RESPONSE ERROR:', error);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
    }
    const originalRequest = error.config;
    // Handle token refresh logic if 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
        // Set the retry flag to prevent infinite loops
        originalRequest._retry = true;
        if (isRefreshing) {
            // Token refresh already in progress, queue this request
            try {
                const newToken = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Token refresh timeout'));
                    }, 5000); // 5 second timeout
                    subscribeTokenRefresh((token) => {
                        clearTimeout(timeoutId);
                        resolve(token);
                    });
                });
                // Retry the original request with new token
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
            }
            catch (refreshError) {
                console.error('Failed to wait for token refresh:', refreshError);
                return Promise.reject(error);
            }
        }
        else {
            // Start token refresh
            const newToken = await refreshToken();
            if (newToken) {
                // Notify all subscribers that token has been refreshed
                onTokenRefreshed(newToken);
                // Retry the original request with new token
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
            }
        }
    }
    // Special handling for 422 errors which might indicate invalid token format
    if (error.response?.status === 422 && originalRequest.url?.includes('/api/auth/me')) {
        console.warn("Received 422 error from /me endpoint - likely invalid token format");
        // Invalidate the token to prevent repeated requests
        Cookies.remove('token');
    }
    return Promise.reject(error);
});
export default api;

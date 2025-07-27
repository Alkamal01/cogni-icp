import Cookies from 'js-cookie';
class AuthService {
    // Get the stored tokens
    getToken() {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.log('Auth token not found in cookies');
                return null;
            }
            // Validate token format
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('Invalid token format');
                this.clearTokens();
                return null;
            }
            // Check token expiration
            try {
                const payload = JSON.parse(atob(parts[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    console.log('Token has expired');
                    this.clearTokens();
                    return null;
                }
            }
            catch (error) {
                console.error('Error parsing token payload:', error);
                this.clearTokens();
                return null;
            }
            return token;
        }
        catch (error) {
            console.error('Error retrieving auth token:', error);
            this.clearTokens();
            return null;
        }
    }
    // Store tokens in cookies with validation
    setTokens(accessToken, refreshToken) {
        try {
            if (!accessToken) {
                console.error('Invalid access token provided');
                return false;
            }
            // Validate token format
            const parts = accessToken.split('.');
            if (parts.length !== 3) {
                console.error('Invalid access token format');
                return false;
            }
            // Validate token expiration
            try {
                const payload = JSON.parse(atob(parts[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    console.error('Cannot store expired token');
                    return false;
                }
            }
            catch (error) {
                console.error('Error validating token payload:', error);
                return false;
            }
            // Store access token in cookie
            Cookies.set('token', accessToken, {
                expires: 1, // 1 day expiry
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            // Store refresh token if provided
            if (refreshToken) {
                Cookies.set('refresh_token', refreshToken, {
                    expires: 30, // 30 days expiry
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
            }
            // Also store in localStorage for backward compatibility
            localStorage.setItem('token', accessToken);
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }
            console.log('Auth tokens stored successfully');
            return true;
        }
        catch (error) {
            console.error('Error storing auth tokens:', error);
            return false;
        }
    }
    // Clear tokens (logout)
    clearTokens() {
        try {
            Cookies.remove('token');
            Cookies.remove('refresh_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            console.log('Auth tokens cleared');
        }
        catch (error) {
            console.error('Error clearing auth tokens:', error);
        }
    }
    // Check if user is logged in with valid token
    isAuthenticated() {
        const token = this.getToken();
        if (!token)
            return false;
        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.log('Token has expired');
                this.clearTokens();
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
    // Get user ID from token
    getUserId() {
        const token = this.getToken();
        if (!token)
            return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || null;
        }
        catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }
    // Handle missing authentication
    handleAuthError() {
        console.log('Handling authentication error');
        this.clearTokens();
        // Redirect to login page with current location as redirect target
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    // Get a valid token or handle the error
    ensureAuthToken() {
        if (!this.isAuthenticated()) {
            console.error('User is not authenticated');
            return null;
        }
        return this.getToken();
    }
    async refreshToken() {
        try {
            const refreshToken = Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
            if (!refreshToken) {
                console.error('No refresh token found');
                return null;
            }
            console.log('Attempting to refresh token...');
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!response.ok) {
                console.error('Token refresh failed:', response.status);
                this.clearTokens();
                return null;
            }
            const data = await response.json();
            if (!data.access_token) {
                console.error('No access token in refresh response');
                this.clearTokens();
                return null;
            }
            // Store both the new access token and refresh token if provided
            const success = this.setTokens(data.access_token, data.refresh_token || refreshToken);
            if (!success) {
                console.error('Failed to store refreshed tokens');
                this.clearTokens();
                return null;
            }
            console.log('Token refresh successful');
            return data.access_token;
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            this.clearTokens();
            return null;
        }
    }
}
// Export as singleton
export const authService = new AuthService();

import axios from 'axios';
import Cookies from 'js-cookie';
// Set up axios instance with base URL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});
// Add request interceptor to attach JWT token to all requests
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Add response interceptor to handle authentication errors
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Clear token and redirect to login page on unauthorized response
        Cookies.remove('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export default api;

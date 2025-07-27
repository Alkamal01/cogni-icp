import api from '../utils/apiClient';
/**
 * API Service for making general API requests
 */
export const apiService = {
    /**
     * Perform a GET request
     * @param url The URL to request
     * @param config Optional axios config
     */
    get: async (url, config) => {
        return api.get(url, config);
    },
    /**
     * Perform a POST request
     * @param url The URL to request
     * @param data The data to send
     * @param config Optional axios config
     */
    post: async (url, data, config) => {
        return api.post(url, data, config);
    },
    /**
     * Perform a PUT request
     * @param url The URL to request
     * @param data The data to send
     * @param config Optional axios config
     */
    put: async (url, data, config) => {
        return api.put(url, data, config);
    },
    /**
     * Perform a DELETE request
     * @param url The URL to request
     * @param config Optional axios config
     */
    delete: async (url, config) => {
        return api.delete(url, config);
    }
};
export default apiService;

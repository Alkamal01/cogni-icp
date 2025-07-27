import api from '../utils/apiClient';
import { AxiosRequestConfig } from 'axios';

/**
 * API Service for making general API requests
 */
export const apiService = {
  /**
   * Perform a GET request
   * @param url The URL to request
   * @param config Optional axios config
   */
  get: async (url: string, config?: AxiosRequestConfig) => {
    return api.get(url, config);
  },

  /**
   * Perform a POST request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional axios config
   */
  post: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.post(url, data, config);
  },

  /**
   * Perform a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional axios config
   */
  put: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.put(url, data, config);
  },

  /**
   * Perform a DELETE request
   * @param url The URL to request
   * @param config Optional axios config
   */
  delete: async (url: string, config?: AxiosRequestConfig) => {
    return api.delete(url, config);
  }
};

export default apiService; 
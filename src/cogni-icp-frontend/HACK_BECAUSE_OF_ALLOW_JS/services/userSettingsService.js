import api from '../utils/apiClient';
import Cookies from 'js-cookie';
// Settings base URL
const SETTINGS_API_URL = '/api/settings';
// Add a helper to get the current session ID
const getCurrentSessionId = () => {
    const sessionIdStr = Cookies.get('session_id');
    return sessionIdStr ? parseInt(sessionIdStr, 10) : null;
};
// User Settings Service
export const userSettingsService = {
    // Get all settings
    getAllSettings: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/all`);
        return response.data;
    },
    // Profile Settings
    getProfileSettings: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/profile`);
        return response.data;
    },
    updateProfileSettings: async (settings) => {
        const response = await api.put(`${SETTINGS_API_URL}/profile`, settings);
        return response.data.profile;
    },
    changePassword: async (data) => {
        const response = await api.put(`${SETTINGS_API_URL}/password`, data);
        return response.data;
    },
    // Learning Preferences
    getLearningPreferences: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/learning`);
        return response.data;
    },
    updateLearningPreferences: async (prefs) => {
        const response = await api.put(`${SETTINGS_API_URL}/learning`, prefs);
        return response.data;
    },
    // Security Settings
    getSecuritySettings: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/security`);
        return response.data;
    },
    updateTwoFactor: async (enable) => {
        const response = await api.put(`${SETTINGS_API_URL}/security/two-factor`, { enable });
        return response.data;
    },
    terminateSession: async (sessionId) => {
        // Don't allow terminating the current session through this method
        const currentSessionId = getCurrentSessionId();
        if (sessionId === currentSessionId) {
            throw new Error('Cannot terminate current session through this method. Use logout instead.');
        }
        const response = await api.delete(`${SETTINGS_API_URL}/security/sessions/${sessionId}`);
        return response.data;
    },
    terminateAllSessions: async () => {
        const response = await api.delete(`${SETTINGS_API_URL}/security/sessions`);
        return response.data;
    },
    // Get the current session ID
    getCurrentSessionId,
    // Accessibility Settings
    getAccessibilitySettings: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/accessibility`);
        return response.data;
    },
    updateAccessibilitySettings: async (settings) => {
        const response = await api.put(`${SETTINGS_API_URL}/accessibility`, settings);
        return response.data;
    },
    // AI Settings
    getAISettings: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/ai`);
        return response.data;
    },
    updateAISettings: async (settings) => {
        const response = await api.put(`${SETTINGS_API_URL}/ai`, settings);
        return response.data;
    },
    // Privacy Settings
    getPrivacySettings: async () => {
        const response = await api.get(`${SETTINGS_API_URL}/privacy`);
        return response.data;
    },
    updatePrivacySettings: async (settings) => {
        const response = await api.put(`${SETTINGS_API_URL}/privacy`, settings);
        return response.data;
    }
};

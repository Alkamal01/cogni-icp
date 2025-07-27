import axios from 'axios';
// Default to localhost if REACT_APP_API_URL is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
export const collaborationService = {
    // Study Groups
    createGroup: async (data) => {
        const response = await axios.post(`${API_URL}/collaboration/groups`, data);
        return response.data;
    },
    joinGroup: async (groupId) => {
        const response = await axios.post(`${API_URL}/collaboration/groups/${groupId}/join`);
        return response.data;
    },
    // Sessions
    startSession: async (data) => {
        const response = await axios.post(`${API_URL}/collaboration/sessions`, data);
        return response.data;
    },
    // Workspace
    createWorkspace: async (data) => {
        const response = await axios.post(`${API_URL}/collaboration/workspace`, data);
        return response.data;
    },
    updateWorkspace: async (workspaceId, data) => {
        const response = await axios.put(`${API_URL}/collaboration/workspace/${workspaceId}`, data);
        return response.data;
    },
    // Analytics
    getGroupAnalytics: async (groupId) => {
        const response = await axios.get(`${API_URL}/collaboration/groups/${groupId}/analytics`);
        return response.data;
    },
    // Messages
    sendMessage: async (data) => {
        const response = await axios.post(`${API_URL}/collaboration/sessions/interact`, data);
        return response.data;
    },
    // Get session messages
    getMessages: async (sessionId) => {
        const response = await axios.get(`${API_URL}/collaboration/sessions/${sessionId}/messages`);
        return response.data;
    },
    // Workspace interactions
    getWorkspaceContent: async (workspaceId) => {
        const response = await axios.get(`${API_URL}/collaboration/workspace/${workspaceId}`);
        return response.data;
    }
};

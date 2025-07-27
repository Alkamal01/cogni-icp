import apiService from './apiService';
class ConnectionService {
    constructor() {
        this.connectionRequests = null;
    }
    /**
     * Get all connection requests (received and sent)
     */
    async getConnectionRequests() {
        try {
            const response = await apiService.get('/api/connections/requests');
            this.connectionRequests = response.data;
            return response.data;
        }
        catch (error) {
            console.error('Error fetching connection requests:', error);
            throw error;
        }
    }
    /**
     * Send a connection request to another user
     */
    async sendConnectionRequest(receiverPublicId, message) {
        try {
            const response = await apiService.post('/api/connections/requests', {
                receiverPublicId,
                message: message || ''
            });
            return response.data.request;
        }
        catch (error) {
            console.error('Error sending connection request:', error);
            throw error;
        }
    }
    /**
     * Accept a connection request
     */
    async acceptConnectionRequest(requestId) {
        try {
            const response = await apiService.post(`/api/connections/requests/${requestId}/accept`);
            // Refresh connection requests after accepting
            await this.getConnectionRequests();
            return response.data.request;
        }
        catch (error) {
            console.error('Error accepting connection request:', error);
            throw error;
        }
    }
    /**
     * Decline a connection request
     */
    async declineConnectionRequest(requestId) {
        try {
            const response = await apiService.post(`/api/connections/requests/${requestId}/decline`);
            // Refresh connection requests after declining
            await this.getConnectionRequests();
            return response.data.request;
        }
        catch (error) {
            console.error('Error declining connection request:', error);
            throw error;
        }
    }
    /**
     * Cancel a sent connection request
     */
    async cancelConnectionRequest(requestId) {
        try {
            await apiService.delete(`/api/connections/requests/${requestId}/cancel`);
            // Refresh connection requests after cancelling
            await this.getConnectionRequests();
        }
        catch (error) {
            console.error('Error cancelling connection request:', error);
            throw error;
        }
    }
    /**
     * Get all connections for the current user
     */
    async getConnections() {
        try {
            const response = await apiService.get('/api/connections');
            return response.data.connections;
        }
        catch (error) {
            console.error('Error fetching connections:', error);
            throw error;
        }
    }
    /**
     * Remove a connection
     */
    async removeConnection(connectionId) {
        try {
            await apiService.delete(`/api/connections/${connectionId}`);
        }
        catch (error) {
            console.error('Error removing connection:', error);
            throw error;
        }
    }
    /**
     * Get connection status with another user
     */
    async getConnectionStatus(userPublicId) {
        try {
            const response = await apiService.get(`/api/connections/status/${userPublicId}`);
            return response.data;
        }
        catch (error) {
            console.error('Error getting connection status:', error);
            throw error;
        }
    }
    /**
     * Get suggested connections
     */
    async getSuggestedConnections() {
        try {
            const response = await apiService.get('/api/connections/suggested');
            return response.data.suggestions;
        }
        catch (error) {
            console.error('Error fetching suggested connections:', error);
            throw error;
        }
    }
    /**
     * Discover learners with AI recommendations
     */
    async discoverLearners(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.search)
                queryParams.append('search', params.search);
            if (params.skills && params.skills.length > 0)
                queryParams.append('skills', params.skills.join(','));
            if (params.experienceLevel)
                queryParams.append('experience_level', params.experienceLevel);
            if (params.studyPreference)
                queryParams.append('study_preference', params.studyPreference);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            const response = await apiService.get(`/api/connections/discover?${queryParams.toString()}`);
            return {
                learners: response.data.learners,
                recommendations: response.data.recommendations,
                totalCount: response.data.total_count
            };
        }
        catch (error) {
            console.error('Error discovering learners:', error);
            throw error;
        }
    }
    /**
     * Format connection request for display
     */
    formatConnectionRequest(request) {
        return {
            ...request,
            timestamp: this.formatTimestamp(request.timestamp),
            responded_at: request.responded_at ? this.formatTimestamp(request.responded_at) : undefined
        };
    }
    /**
     * Format timestamp to human-readable format
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) {
            return 'Just now';
        }
        else if (diffMins < 60) {
            return `${diffMins}m ago`;
        }
        else if (diffHours < 24) {
            return `${diffHours}h ago`;
        }
        else if (diffDays < 7) {
            return `${diffDays}d ago`;
        }
        else {
            return date.toLocaleDateString();
        }
    }
    /**
     * Get the compatibility score between users (placeholder implementation)
     */
    calculateCompatibilityScore(user1Skills, user2Skills) {
        if (!user1Skills.length || !user2Skills.length)
            return 50;
        const commonSkills = user1Skills.filter(skill => user2Skills.some(otherSkill => otherSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(otherSkill.toLowerCase())));
        const compatibilityRatio = commonSkills.length / Math.max(user1Skills.length, user2Skills.length);
        return Math.min(95, Math.max(15, 50 + (compatibilityRatio * 45)));
    }
    /**
     * Check if two users are connected
     */
    async areUsersConnected(userPublicId) {
        try {
            const status = await this.getConnectionStatus(userPublicId);
            return status.status === 'connected';
        }
        catch (error) {
            console.error('Error checking connection status:', error);
            return false;
        }
    }
    /**
     * Get pending connection request count
     */
    async getPendingRequestCount() {
        try {
            const requests = await this.getConnectionRequests();
            return requests.received.filter(req => req.status === 'pending').length;
        }
        catch (error) {
            console.error('Error getting pending request count:', error);
            return 0;
        }
    }
    /**
     * Get the current connection requests state
     */
    getCurrentConnectionRequests() {
        return this.connectionRequests;
    }
}
export default new ConnectionService();

import api from '../utils/apiClient';
const studyGroupService = {
    /**
     * Get all study groups (public + user's private groups)
     */
    async getAllGroups(filters) {
        let url = '/api/study-groups/';
        // Add query parameters if filters provided
        if (filters) {
            const params = new URLSearchParams();
            if (filters.topic_id)
                params.append('topic_id', filters.topic_id.toString());
            if (filters.learning_level)
                params.append('learning_level', filters.learning_level);
            if (filters.search)
                params.append('q', filters.search);
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }
        const response = await api.get(url);
        return response.data.groups || [];
    },
    /**
     * Get details for a specific study group
     */
    async getGroupById(groupPublicId) {
        const response = await api.get(`/api/study-groups/${groupPublicId}`);
        return response.data;
    },
    /**
     * Create a new study group
     */
    async createStudyGroup(data) {
        const response = await api.post('/api/study-groups/', data);
        return response.data;
    },
    /**
     * Update an existing study group
     */
    async updateStudyGroup(groupPublicId, data) {
        const response = await api.put(`/api/study-groups/${groupPublicId}`, data);
        return response.data;
    },
    /**
     * Join a study group
     */
    async joinGroup(groupPublicId) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/join`);
        return response.data;
    },
    /**
     * Leave a study group
     */
    async leaveGroup(groupPublicId) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/leave`);
        return response.data;
    },
    /**
     * Get all available topics
     */
    async getAllTopics() {
        const response = await api.get('/api/study-groups/topics');
        return response.data.topics || [];
    },
    /**
     * Create a new topic (admin only in a real app)
     */
    async createTopic(data) {
        const response = await api.post('/api/study-groups/topics', data);
        return response.data;
    },
    /**
     * Add a resource to a study group
     */
    async addResource(groupPublicId, data) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/resources`, data);
        return response.data;
    },
    /**
     * Create a new study group (for compatibility with old code)
     * This is an alias for createStudyGroup
     */
    async createGroup(data) {
        const response = await api.post('/api/study-groups/', data);
        return response.data;
    },
    /**
     * Get analytics data for a study group
     */
    async getGroupAnalytics(groupPublicId) {
        const response = await api.get(`/api/study-groups/${groupPublicId}/analytics`);
        return response.data;
    },
    // Poll related methods
    async getGroupPolls(groupPublicId) {
        const response = await api.get(`/api/study-groups/${groupPublicId}/polls`);
        return response.data.polls;
    },
    async createPoll(groupPublicId, data) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/polls`, data);
        return response.data.poll;
    },
    async votePoll(groupPublicId, pollId, optionId) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/polls/${pollId}/vote`, { option_id: optionId });
        return response.data.poll;
    },
    async closePoll(groupPublicId, pollId) {
        const response = await api.put(`/api/study-groups/${groupPublicId}/polls/${pollId}/close`);
        return response.data.poll;
    },
    async deletePoll(groupPublicId, pollId) {
        await api.delete(`/api/study-groups/${groupPublicId}/polls/${pollId}`);
    },
    // Study session related methods
    async getGroupSessions(groupPublicId) {
        const response = await api.get(`/api/study-groups/${groupPublicId}/sessions`);
        return response.data.sessions;
    },
    async createSession(groupPublicId, data) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/sessions`, data);
        return response.data.session;
    },
    async joinSession(groupPublicId, sessionId) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/sessions/${sessionId}/join`);
        return response.data;
    },
    async leaveSession(groupPublicId, sessionId) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/sessions/${sessionId}/leave`);
        return response.data;
    },
    async deleteSession(groupPublicId, sessionId) {
        await api.delete(`/api/study-groups/${groupPublicId}/sessions/${sessionId}`);
    },
    async updateMemberRole(groupPublicId, userId, role) {
        const response = await api.put(`/api/study-groups/${groupPublicId}/members/${userId}/role`, { role });
        return response.data;
    },
    async removeMember(groupPublicId, userId) {
        const response = await api.delete(`/api/study-groups/${groupPublicId}/members/${userId}/remove`);
        return response.data;
    },
    async inviteToGroup(groupPublicId, username) {
        const response = await api.post(`/api/study-groups/${groupPublicId}/invite`, { username });
        return response.data;
    }
};
export default studyGroupService;

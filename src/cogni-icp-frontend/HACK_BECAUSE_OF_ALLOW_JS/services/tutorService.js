import api from '../utils/apiClient';
// Cache for tutors
let tutorsCache = {
    data: null,
    timestamp: 0,
    expiryTime: 5 * 60 * 1000 // 5 minutes cache
};
// API Functions
const tutorService = {
    // Tutor Management
    getAllTutors: async () => {
        // Check if we have a valid cache
        const now = Date.now();
        if (tutorsCache.data && (now - tutorsCache.timestamp < tutorsCache.expiryTime)) {
            return tutorsCache.data;
        }
        try {
            const response = await api.get('/api/tutors');
            const tutors = response.data.tutors || [];
            // Update cache
            tutorsCache = {
                data: tutors,
                timestamp: now,
                expiryTime: 5 * 60 * 1000
            };
            return tutors;
        }
        catch (error) {
            console.error('Error fetching tutors:', error);
            // If we have cached data, return it even if expired
            if (tutorsCache.data) {
                return tutorsCache.data;
            }
            // Otherwise, throw the error
            throw error;
        }
    },
    getTutor: async (tutorId) => {
        const response = await api.get(`/api/tutors/${tutorId}`);
        if (!response.data.tutor && response.data.id) {
            return response.data; // Direct response is the tutor object
        }
        return response.data.tutor;
    },
    getTutorKnowledgeBase: async (tutorId) => {
        console.log('Calling getTutorKnowledgeBase for tutorId:', tutorId);
        const response = await api.get(`/api/tutors/${tutorId}/knowledge-base`);
        console.log('getTutorKnowledgeBase response:', response.data);
        return response.data;
    },
    deleteTutorKnowledgeBaseFile: async (tutorId, fileId) => {
        await api.delete(`/api/tutors/${tutorId}/knowledge-base/files/${fileId}`);
    },
    createTutor: async (tutorData) => {
        const formData = new FormData();
        formData.append('name', tutorData.name);
        formData.append('description', tutorData.description);
        formData.append('teachingStyle', tutorData.teachingStyle);
        formData.append('personality', tutorData.personality);
        const expertise = Array.isArray(tutorData.expertise) ? tutorData.expertise : [];
        const knowledgeBase = Array.isArray(tutorData.knowledgeBase) ? tutorData.knowledgeBase : [];
        formData.append('expertise', JSON.stringify(expertise));
        // Handle knowledge base - separate text and files
        const textKnowledge = knowledgeBase.filter(item => typeof item === 'string' && item.trim() !== '');
        const fileKnowledge = knowledgeBase.filter(item => item instanceof File);
        if (textKnowledge.length > 0) {
            formData.append('knowledgeBase', JSON.stringify(textKnowledge));
        }
        // Add knowledge base files
        fileKnowledge.forEach((file, index) => {
            if (file instanceof File) {
                formData.append('knowledge_base_files', file);
            }
        });
        // Add voice settings if provided
        if (tutorData.voice_id) {
            formData.append('voice_id', tutorData.voice_id);
        }
        if (tutorData.voice_settings) {
            formData.append('voice_settings', JSON.stringify(tutorData.voice_settings));
        }
        if (tutorData.imageFile) {
            formData.append('avatar', tutorData.imageFile);
        }
        try {
            // Always use multipart/form-data when there are files or image
            const hasFiles = tutorData.imageFile || fileKnowledge.length > 0;
            const response = hasFiles ?
                await api.post('/api/tutors/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) :
                await api.post('/api/tutors/', {
                    name: tutorData.name,
                    description: tutorData.description,
                    teachingStyle: tutorData.teachingStyle,
                    personality: tutorData.personality,
                    expertise,
                    knowledgeBase: textKnowledge,
                    voice_id: tutorData.voice_id,
                    voice_settings: tutorData.voice_settings
                });
            return response.data.tutor;
        }
        catch (error) {
            throw error;
        }
    },
    updateTutor: async (tutorId, tutorData) => {
        const response = await api.put(`/api/tutors/${tutorId}`, tutorData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.tutor;
    },
    deleteTutor: async (tutorId) => {
        await api.delete(`/api/tutors/${tutorId}`);
    },
    // Session Management
    createSession: async (tutorId, sessionData) => {
        const response = await api.post(`/api/tutors/${tutorId}/sessions`, sessionData);
        return response.data;
    },
    getSession: async (sessionId) => {
        console.log('Getting session data for:', sessionId);
        try {
            const response = await api.get(`/api/tutors/sessions/${sessionId}`);
            console.log('Session data received:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    },
    getAllSessions: async () => {
        const response = await api.get('/api/tutors/sessions');
        return response.data.sessions;
    },
    getTutorSessions: async (tutorId) => {
        const response = await api.get(`/api/tutors/${tutorId}/sessions`);
        return response.data.sessions;
    },
    sendMessage: async (sessionId, message) => {
        // Use HTTP by default
        const response = await api.post(`/api/tutors/sessions/${sessionId}/message`, {
            message: message
        });
        return response.data.user_message;
    },
    // Get tutor's response to a message
    getTutorResponse: async (sessionId, messageId) => {
        const response = await api.get(`/api/tutors/sessions/${sessionId}/messages/${messageId}/response`);
        return response.data.tutor_message;
    },
    // Check message status
    checkMessageStatus: async (sessionId, messageId) => {
        const response = await api.get(`/api/tutors/sessions/${sessionId}/messages/${messageId}/status`);
        return response.data;
    },
    // Poll for tutor response
    pollForResponse: async (sessionId, messageId, maxAttempts = 30) => {
        let attempts = 0;
        while (attempts < maxAttempts) {
            const status = await tutorService.checkMessageStatus(sessionId, messageId);
            if (status.status === 'complete' && status.message) {
                return status.message;
            }
            else if (status.status === 'error') {
                throw new Error('Failed to get tutor response');
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
            attempts++;
        }
        throw new Error('Timeout waiting for tutor response');
    },
    completeModule: async (sessionId, moduleId) => {
        const response = await api.post(`/api/tutors/sessions/${sessionId}/modules/${moduleId}/complete`);
        return response.data;
    },
    completeSession: async (sessionId) => {
        const response = await api.post(`/api/tutors/sessions/${sessionId}/complete`);
        return response.data;
    },
    deleteSession: async (sessionId) => {
        await api.delete(`/api/tutors/sessions/${sessionId}`);
    },
    checkTutorHealth: async () => {
        try {
            const response = await api.get('/api/tutors/health/groq');
            return response.data;
        }
        catch (error) {
            console.error('Error checking tutor health:', error);
            if (error.response?.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message || 'Failed to check tutor health'
            };
        }
    },
    // Rating methods
    getTutorRatings: async (tutorId) => {
        const response = await api.get(`/api/tutors/${tutorId}/ratings`);
        return response.data;
    },
    rateTutor: async (tutorId, rating, comment) => {
        const response = await api.post(`/api/tutors/${tutorId}/rate`, { rating, comment });
        return response.data;
    },
    deleteRating: async (tutorId, ratingId) => {
        const response = await api.delete(`/api/tutors/${tutorId}/ratings/${ratingId}`);
        return response.data;
    },
    togglePin: async (tutorId) => {
        const response = await api.post(`/api/tutors/${tutorId}/toggle-pin`);
        return response.data.tutor;
    },
    // Get topic suggestions based on tutor expertise
    getSuggestedTopics: async (tutorId) => {
        const response = await api.get(`/api/tutors/${tutorId}/suggest-topics`);
        if (response.data.success && Array.isArray(response.data.suggestions)) {
            return response.data.suggestions;
        }
        return [];
    },
    // Validate if a topic is relevant to tutor expertise
    validateTopic: async (tutorId, topic) => {
        const response = await api.post(`/api/tutors/${tutorId}/validate-topic`, { topic });
        return response.data;
    },
    startSession: async (tutorId, topic) => {
        const response = await api.post(`/api/tutors/${tutorId}/sessions`, { topic });
        return response.data.session;
    },
    // Knowledge Base Management
    getTutorKnowledgeBaseFiles: async (tutorId) => {
        const response = await api.get(`/api/tutors/${tutorId}/knowledge-base`);
        return response.data.files || [];
    },
    uploadKnowledgeBaseFiles: async (tutorId, files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        const response = await api.post(`/api/tutors/${tutorId}/knowledge-base/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    searchKnowledgeBase: async (tutorId, query, topK = 5) => {
        const response = await api.post(`/api/tutors/${tutorId}/knowledge-base/search`, {
            query,
            top_k: topK
        });
        return response.data;
    },
    deleteKnowledgeBase: async (tutorId) => {
        const response = await api.delete(`/api/tutors/${tutorId}/knowledge-base`);
        return response.data;
    },
    deleteKnowledgeBaseFile: async (tutorId, fileId) => {
        const response = await api.delete(`/api/tutors/${tutorId}/knowledge-base/files/${fileId}`);
        return response.data;
    },
};
export default tutorService;

import apiClient from '../utils/apiClient';
class TaskService {
    /**
     * Get all available tasks for the current user
     */
    async getTasks(params) {
        const queryParams = new URLSearchParams();
        if (params?.category)
            queryParams.append('category', params.category);
        if (params?.difficulty)
            queryParams.append('difficulty', params.difficulty);
        if (params?.show_completed !== undefined) {
            queryParams.append('show_completed', params.show_completed.toString());
        }
        const response = await apiClient.get(`/api/tasks/?${queryParams.toString()}`);
        return response.data;
    }
    /**
     * Get a specific task by public ID
     */
    async getTask(taskPublicId) {
        const response = await apiClient.get(`/api/tasks/${taskPublicId}`);
        return response.data;
    }
    /**
     * Complete a task and earn rewards
     */
    async completeTask(taskPublicId, proofData) {
        const response = await apiClient.post(`/api/tasks/${taskPublicId}/complete`, {
            proof_data: proofData,
        });
        return response.data;
    }
    /**
     * Get current user's task completions
     */
    async getUserCompletions() {
        const response = await apiClient.get('/api/tasks/completions');
        return response.data;
    }
    // Admin methods
    /**
     * Get all tasks (admin only)
     */
    async getAllTasksAdmin() {
        const response = await apiClient.get('/api/tasks/admin');
        return response.data;
    }
    /**
     * Create a new task (admin only)
     */
    async createTask(taskData) {
        const response = await apiClient.post('/api/tasks/admin', taskData);
        return response.data;
    }
    /**
     * Update a task (admin only)
     */
    async updateTask(taskPublicId, taskData) {
        const response = await apiClient.put(`/api/tasks/admin/${taskPublicId}`, taskData);
        return response.data;
    }
    /**
     * Delete a task (admin only)
     */
    async deleteTask(taskPublicId) {
        const response = await apiClient.delete(`/api/tasks/admin/${taskPublicId}`);
        return response.data;
    }
}
export const taskService = new TaskService();

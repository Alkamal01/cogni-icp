const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/admin` : 'http://localhost:5000/api/admin';
class AdminApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'AdminApiError';
    }
}
const getAuthHeaders = () => {
    // Get token from cookies (same as regular auth)
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};
const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Token expired or invalid
            window.location.href = '/admin/login';
            throw new AdminApiError('Authentication required', 401);
        }
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new AdminApiError(errorData.error || `HTTP ${response.status}`, response.status);
    }
    return response.json();
};
export const adminApi = {
    // Authentication
    async verifyAccess() {
        const response = await fetch(`${API_BASE_URL}/verify`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    // Dashboard stats
    async getStats() {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    // User management
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== '')
            .map(([key, value]) => [key, String(value)])).toString();
        const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    async getUserDetails(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    async updateUserStatus(userId, status) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    },
    async updateUserRole(userId, role) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role })
        });
        return handleResponse(response);
    },
    async updateUserSubscription(userId, subscription) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/subscription`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ subscription })
        });
        return handleResponse(response);
    },
    async deleteUser(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    async bulkUserAction(userIds, action, value) {
        const response = await fetch(`${API_BASE_URL}/users/bulk-action`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_ids: userIds.map(id => parseInt(id)),
                action,
                value
            })
        });
        return handleResponse(response);
    },
    // Password management
    async resetUserPassword(userId, newPassword) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ new_password: newPassword })
        });
        return handleResponse(response);
    },
    async generateUserPassword(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/generate-password`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    getTasks: async () => {
        const response = await fetch(`http://localhost:5000/api/tasks/admin`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },
    createTask: async (taskData) => {
        const response = await fetch(`http://localhost:5000/api/tasks/admin`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        return handleResponse(response);
    },
    updateTask: async (taskId, taskData) => {
        const response = await fetch(`http://localhost:5000/api/tasks/admin/${taskId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        return handleResponse(response);
    },
    deleteTask: async (taskId) => {
        const response = await fetch(`http://localhost:5000/api/tasks/admin/${taskId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
};
export { AdminApiError };

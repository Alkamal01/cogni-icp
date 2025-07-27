import api from './apiService';
const userService = {
    async getUserAnalytics() {
        const response = await api.get('/api/users/analytics');
        return response.data;
    },
};
export default userService;

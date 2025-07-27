import api from './apiService';

export interface UserAnalytics {
  studyTime: {
    total: number;
    byDay: { date: string; minutes: number }[];
    bySubject: { subject: string; minutes: number }[];
  };
  achievements: {
    total: number;
    recent: { name: string; date: string; type: string }[];
    byType: { type: string; count: number }[];
  };
  social: {
    groupParticipation: number;
    messagesSent: number;
    activeGroups: number;
    recentInteractions: { type: string; date: string; description: string }[];
  };
  learning: {
    completedTopics: number;
    inProgressTopics: number;
    averageScore: number;
    progressBySubject: { subject: string; progress: number }[];
  };
}

const userService = {
  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await api.get('/api/users/analytics');
    return response.data;
  },
};

export default userService; 
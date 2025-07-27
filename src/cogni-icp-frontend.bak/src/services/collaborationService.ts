import axios from 'axios';

// Default to localhost if REACT_APP_API_URL is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface StudyGroup {
  id: number;
  name: string;
  topic_id: number;
  skill_level: string;
  max_members: number;
  members: any[];
}

export interface CollaborationSession {
  id: number;
  group_id: number;
  session_type: string;
  objectives: any[];
  start_time: string;
  end_time?: string;
}

export interface Message {
  content: string;
  type: string;
  session_id?: number;
}

export const collaborationService = {
  // Study Groups
  createGroup: async (data: Partial<StudyGroup>) => {
    const response = await axios.post(`${API_URL}/collaboration/groups`, data);
    return response.data;
  },

  joinGroup: async (groupId: number) => {
    const response = await axios.post(`${API_URL}/collaboration/groups/${groupId}/join`);
    return response.data;
  },

  // Sessions
  startSession: async (data: Partial<CollaborationSession>) => {
    const response = await axios.post(`${API_URL}/collaboration/sessions`, data);
    return response.data;
  },

  // Workspace
  createWorkspace: async (data: { group_id: number; name: string; type: string }) => {
    const response = await axios.post(`${API_URL}/collaboration/workspace`, data);
    return response.data;
  },

  updateWorkspace: async (workspaceId: number, data: any) => {
    const response = await axios.put(
      `${API_URL}/collaboration/workspace/${workspaceId}`, 
      data
    );
    return response.data;
  },

  // Analytics
  getGroupAnalytics: async (groupId: number) => {
    const response = await axios.get(
      `${API_URL}/collaboration/groups/${groupId}/analytics`
    );
    return response.data;
  },

  // Messages
  sendMessage: async (data: Message) => {
    const response = await axios.post(`${API_URL}/collaboration/sessions/interact`, data);
    return response.data;
  },

  // Get session messages
  getMessages: async (sessionId: number) => {
    const response = await axios.get(`${API_URL}/collaboration/sessions/${sessionId}/messages`);
    return response.data;
  },

  // Workspace interactions
  getWorkspaceContent: async (workspaceId: number) => {
    const response = await axios.get(`${API_URL}/collaboration/workspace/${workspaceId}`);
    return response.data;
  }
}; 
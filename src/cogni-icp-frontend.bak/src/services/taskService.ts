import apiClient from '../utils/apiClient';

export interface Task {
  id: number;
  public_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  token_reward: number;
  points_reward: number;
  requirements?: string;
  is_active: boolean;
  is_repeatable: boolean;
  max_completions: number;
  created_by: number;
  created_at: string;
  expires_at?: string;
  metadata?: any;
  completed?: boolean;
  completed_at?: string;
  completion_count?: number;
  tokens_earned?: number;
  can_complete_again?: boolean;
}

export interface TaskCompletion {
  id: number;
  user_id: number;
  task_id: number;
  completed_at: string;
  tokens_earned: number;
  points_earned: number;
  completion_count: number;
  proof_data?: string;
  metadata?: any;
  task?: Task;
}

export interface CreateTaskData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  token_reward: number;
  points_reward?: number;
  requirements?: string;
  is_active?: boolean;
  is_repeatable?: boolean;
  max_completions?: number;
  expires_at?: string;
  metadata?: any;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

class TaskService {
  /**
   * Get all available tasks for the current user
   */
  async getTasks(params?: {
    category?: string;
    difficulty?: string;
    show_completed?: boolean;
  }): Promise<{ success: boolean; tasks: Task[] }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.show_completed !== undefined) {
      queryParams.append('show_completed', params.show_completed.toString());
    }

    const response = await apiClient.get(`/api/tasks/?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a specific task by public ID
   */
  async getTask(taskPublicId: string): Promise<{ success: boolean; task: Task }> {
    const response = await apiClient.get(`/api/tasks/${taskPublicId}`);
    return response.data;
  }

  /**
   * Complete a task and earn rewards
   */
  async completeTask(taskPublicId: string, proofData?: any): Promise<{
    success: boolean;
    message: string;
    tokens_earned: number;
    points_earned: number;
    completion_count: number;
    achievement: any;
  }> {
    const response = await apiClient.post(`/api/tasks/${taskPublicId}/complete`, {
      proof_data: proofData,
    });
    return response.data;
  }

  /**
   * Get current user's task completions
   */
  async getUserCompletions(): Promise<{ success: boolean; completions: TaskCompletion[] }> {
    const response = await apiClient.get('/api/tasks/completions');
    return response.data;
  }

  // Admin methods
  /**
   * Get all tasks (admin only)
   */
  async getAllTasksAdmin(): Promise<{ success: boolean; tasks: Task[] }> {
    const response = await apiClient.get('/api/tasks/admin');
    return response.data;
  }

  /**
   * Create a new task (admin only)
   */
  async createTask(taskData: CreateTaskData): Promise<{ success: boolean; message: string; task: Task }> {
    const response = await apiClient.post('/api/tasks/admin', taskData);
    return response.data;
  }

  /**
   * Update a task (admin only)
   */
  async updateTask(taskPublicId: string, taskData: UpdateTaskData): Promise<{ success: boolean; message: string; task: Task }> {
    const response = await apiClient.put(`/api/tasks/admin/${taskPublicId}`, taskData);
    return response.data;
  }

  /**
   * Delete a task (admin only)
   */
  async deleteTask(taskPublicId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/tasks/admin/${taskPublicId}`);
    return response.data;
  }
}

export const taskService = new TaskService(); 
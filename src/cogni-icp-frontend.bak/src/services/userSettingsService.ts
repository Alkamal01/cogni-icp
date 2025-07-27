import axios from 'axios';
import api from '../utils/apiClient';
import Cookies from 'js-cookie';

// Settings base URL
const SETTINGS_API_URL = '/api/settings';

// Interface for Profile Settings
interface ProfileSettings {
  name: string;
  email: string;
  bio?: string;
}

// Interface for Learning Preferences
interface LearningPreferences {
  learningStyle?: string;
  preferredLanguage?: string;
  secondaryLanguages?: string[];
  contentLocalization?: boolean;
  culturalContexts?: string[];
  studyReminders?: boolean;
  dailyGoalHours?: number;
  topicsOfInterest?: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  aiInteractionLevel?: 'minimal' | 'moderate' | 'extensive';
  adaptiveLearningEnabled?: boolean;
  collaborationPreference?: 'individual' | 'pair' | 'group';
  educationalBackground?: string;
  learningGoals?: string[];
}

// Interface for Security Settings
interface SecuritySettings {
  two_factor_enabled: boolean;
  active_sessions: {
    id: number;
    device: string;
    location: string;
    last_active: string;
    is_active: boolean;
  }[];
  login_history: {
    id: number;
    timestamp: string;
    location: string;
    device: string;
    status: string;
  }[];
}

// Interface for Accessibility Settings
interface AccessibilitySettings {
  fontSize?: 'small' | 'medium' | 'large';
  contrast?: 'normal' | 'high';
  reduceMotion?: boolean;
  screenReader?: boolean;
  colorBlindMode?: boolean;
}

// Interface for AI Settings
interface AISettings {
  interactionStyle?: 'formal' | 'casual' | 'technical';
  responseLength?: 'concise' | 'detailed' | 'comprehensive';
  modelPreference?: 'balanced' | 'fast' | 'advanced';
  customInstructions?: string;
  topicEmphasis?: string[];
}

// Interface for Privacy Settings
interface PrivacySettings {
  profileVisibility?: 'public' | 'connections' | 'private';
  activitySharing?: 'everyone' | 'connections' | 'none';
  allowConnectionRequests?: boolean;
  dataUsageConsent?: {
    learningAnalytics?: boolean;
    aiTraining?: boolean;
    thirdPartySharing?: boolean;
  };
}

// Interface for Password Change
interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// All settings together
interface AllSettings {
  profile: ProfileSettings;
  learning_preferences: LearningPreferences;
  security: SecuritySettings;
  accessibility: AccessibilitySettings;
  ai_settings: AISettings;
  privacy: PrivacySettings;
}

// Add a helper to get the current session ID
const getCurrentSessionId = (): number | null => {
  const sessionIdStr = Cookies.get('session_id');
  return sessionIdStr ? parseInt(sessionIdStr, 10) : null;
};

// User Settings Service
export const userSettingsService = {
  // Get all settings
  getAllSettings: async (): Promise<AllSettings> => {
    const response = await api.get(`${SETTINGS_API_URL}/all`);
    return response.data;
  },

  // Profile Settings
  getProfileSettings: async (): Promise<ProfileSettings> => {
    const response = await api.get(`${SETTINGS_API_URL}/profile`);
    return response.data;
  },

  updateProfileSettings: async (settings: Partial<ProfileSettings> | FormData): Promise<ProfileSettings> => {
    const response = await api.put(`${SETTINGS_API_URL}/profile`, settings);
    return response.data.profile;
  },

  changePassword: async (data: PasswordChange): Promise<{ message: string }> => {
    const response = await api.put(`${SETTINGS_API_URL}/password`, data);
    return response.data;
  },

  // Learning Preferences
  getLearningPreferences: async (): Promise<LearningPreferences> => {
    const response = await api.get(`${SETTINGS_API_URL}/learning`);
    return response.data;
  },

  updateLearningPreferences: async (prefs: LearningPreferences): Promise<{ message: string, preferences: LearningPreferences }> => {
    const response = await api.put(`${SETTINGS_API_URL}/learning`, prefs);
    return response.data;
  },

  // Security Settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await api.get(`${SETTINGS_API_URL}/security`);
    return response.data;
  },

  updateTwoFactor: async (enable: boolean): Promise<{ message: string, two_factor_enabled: boolean }> => {
    const response = await api.put(`${SETTINGS_API_URL}/security/two-factor`, { enable });
    return response.data;
  },

  terminateSession: async (sessionId: number): Promise<{ message: string }> => {
    // Don't allow terminating the current session through this method
    const currentSessionId = getCurrentSessionId();
    if (sessionId === currentSessionId) {
      throw new Error('Cannot terminate current session through this method. Use logout instead.');
    }
    
    const response = await api.delete(`${SETTINGS_API_URL}/security/sessions/${sessionId}`);
    return response.data;
  },

  terminateAllSessions: async (): Promise<{ message: string }> => {
    const response = await api.delete(`${SETTINGS_API_URL}/security/sessions`);
    return response.data;
  },

  // Get the current session ID
  getCurrentSessionId,

  // Accessibility Settings
  getAccessibilitySettings: async (): Promise<AccessibilitySettings> => {
    const response = await api.get(`${SETTINGS_API_URL}/accessibility`);
    return response.data;
  },

  updateAccessibilitySettings: async (settings: AccessibilitySettings): Promise<{ message: string, settings: AccessibilitySettings }> => {
    const response = await api.put(`${SETTINGS_API_URL}/accessibility`, settings);
    return response.data;
  },

  // AI Settings
  getAISettings: async (): Promise<AISettings> => {
    const response = await api.get(`${SETTINGS_API_URL}/ai`);
    return response.data;
  },

  updateAISettings: async (settings: AISettings): Promise<{ message: string, settings: AISettings }> => {
    const response = await api.put(`${SETTINGS_API_URL}/ai`, settings);
    return response.data;
  },

  // Privacy Settings
  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const response = await api.get(`${SETTINGS_API_URL}/privacy`);
    return response.data;
  },

  updatePrivacySettings: async (settings: PrivacySettings): Promise<{ message: string, settings: PrivacySettings }> => {
    const response = await api.put(`${SETTINGS_API_URL}/privacy`, settings);
    return response.data;
  }
};

export type {
  ProfileSettings,
  LearningPreferences,
  SecuritySettings,
  AccessibilitySettings,
  AISettings,
  PrivacySettings,
  PasswordChange,
  AllSettings
}; 
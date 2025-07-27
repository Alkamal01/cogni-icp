import api from './apiClient';
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.listeners = [];
    }
    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }
    /**
     * Add a new notification through the API
     * @param params Notification parameters
     * @returns Created notification or null if failed
     */
    async addNotification(params) {
        try {
            const response = await api.post('/api/notifications/', params);
            return response.data.notification;
        }
        catch (error) {
            console.error('Failed to create notification:', error);
            return null;
        }
    }
    /**
     * Show a success notification
     * @param content Notification content
     * @param source Source of the notification
     * @param related_id Optional related entity ID
     * @returns Created notification or null if failed
     */
    async showSuccess(content, source, related_id) {
        return this.addNotification({
            content,
            type: 'success',
            source,
            related_id,
        });
    }
    /**
     * Show an info notification
     * @param content Notification content
     * @param source Source of the notification
     * @param related_id Optional related entity ID
     * @returns Created notification or null if failed
     */
    async showInfo(content, source, related_id) {
        return this.addNotification({
            content,
            type: 'info',
            source,
            related_id,
        });
    }
    /**
     * Show a warning notification
     * @param content Notification content
     * @param source Source of the notification
     * @param related_id Optional related entity ID
     * @returns Created notification or null if failed
     */
    async showWarning(content, source, related_id) {
        return this.addNotification({
            content,
            type: 'warning',
            source,
            related_id,
        });
    }
    /**
     * Show an error notification
     * @param content Notification content
     * @param source Source of the notification
     * @param related_id Optional related entity ID
     * @returns Created notification or null if failed
     */
    async showError(content, source, related_id) {
        return this.addNotification({
            content,
            type: 'error',
            source,
            related_id,
        });
    }
    /**
     * A helper function to create a notification for a completed session
     * @param tutorName The name of the tutor
     * @param sessionId The session ID
     * @returns Created notification or null if failed
     */
    async notifySessionComplete(tutorName, sessionId) {
        return this.showSuccess(`You've completed a learning session with ${tutorName}!`, 'tutor', sessionId);
    }
    /**
     * A helper function to create a notification for an achievement
     * @param achievementName The name of the achievement
     * @param achievementId The achievement ID
     * @returns Created notification or null if failed
     */
    async notifyAchievement(achievementName, achievementId) {
        return this.showSuccess(`Congratulations! You've earned the "${achievementName}" achievement.`, 'achievement', achievementId);
    }
    /**
     * A helper function to create a notification for a study group event
     * @param groupName The name of the study group
     * @param eventTime The time of the event
     * @param groupId The group ID
     * @returns Created notification or null if failed
     */
    async notifyStudyGroupEvent(groupName, eventTime, groupId) {
        return this.showInfo(`Reminder: Your study group "${groupName}" has a session scheduled for ${new Date(eventTime).toLocaleString()}.`, 'study_group', groupId);
    }
    success(title, message, duration) {
        this.show({
            type: 'success',
            title,
            message,
            duration
        });
    }
    error(title, message, duration) {
        this.show({
            type: 'error',
            title,
            message,
            duration
        });
    }
    warning(title, message, duration) {
        this.show({
            type: 'warning',
            title,
            message,
            duration
        });
    }
    info(title, message, duration) {
        this.show({
            type: 'info',
            title,
            message,
            duration
        });
    }
    show(options) {
        const notification = {
            ...options,
            duration: options.duration || 5000 // Default duration of 5 seconds
        };
        this.notifications.push(notification);
        this.notifyListeners();
        // Auto-remove notification after duration
        setTimeout(() => {
            this.notifications = this.notifications.filter(n => n !== notification);
            this.notifyListeners();
        }, notification.duration);
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener([...this.notifications]));
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    clear() {
        this.notifications = [];
        this.notifyListeners();
    }
}
export const notificationManager = NotificationManager.getInstance();
export default notificationManager;

import api from './client';

export const NOTIFICATIONS_CHANGED = 'notifications-changed';

export const getNotifications = async () => {
    const response = await api.get('/notification');
    const result = response.data?.data ?? response.data;
    if (Array.isArray(result)) return result;
    return Object.values(result ?? {}).filter((item) => item && typeof item === 'object' && 'message' in item);
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await api.patch(`/notification/${notificationId}/read`);
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    return response.data?.data ?? response.data;
};

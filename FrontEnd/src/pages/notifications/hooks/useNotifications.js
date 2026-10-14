import { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead } from '../../../api/notificationApi';

export default function useNotifications(isLoggedIn) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [readingId, setReadingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) return;
        let active = true;
        getNotifications()
            .then((result) => {
                if (active) setNotifications(result);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดการแจ้งเตือนได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [isLoggedIn]);

    const markAsRead = async (notification) => {
        if (notification.isRead) return;
        setReadingId(notification.id);
        setError('');
        try {
            await markNotificationAsRead(notification.id);
            setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้');
        } finally {
            setReadingId(null);
        }
    };

    return { notifications, loading, readingId, error, markAsRead };
}

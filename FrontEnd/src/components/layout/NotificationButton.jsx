import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, NOTIFICATIONS_CHANGED } from '../../api/notificationApi';

export default function NotificationButton() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let active = true;
        let requestId = 0;
        const refresh = async () => {
            const id = ++requestId;
            try {
                const notifications = await getNotifications();
                if (active && id === requestId) {
                    setUnreadCount(notifications.filter((notification) => !notification.isRead).length);
                }
            } catch {
                // Keep the last known count when a background request fails.
            }
        };
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };

        refresh();
        const interval = window.setInterval(refreshWhenVisible, 60_000);
        window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
        window.addEventListener('focus', refreshWhenVisible);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        return () => {
            active = false;
            window.clearInterval(interval);
            window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
            window.removeEventListener('focus', refreshWhenVisible);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, []);

    const label = unreadCount > 0 ? `การแจ้งเตือนที่ยังไม่อ่าน ${unreadCount} รายการ` : 'การแจ้งเตือน';

    return (
        <Link
            to="/notifications"
            className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e2e6e6] bg-white text-[#213f68] transition hover:bg-[#f5f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#213f68]"
            aria-label={label}
            title={label}
        >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
            </svg>
            {unreadCount > 0 && <span className="absolute right-0.5 top-0.5 size-3 rounded-full bg-red-500 ring-2 ring-white" aria-hidden="true" />}
        </Link>
    );
}

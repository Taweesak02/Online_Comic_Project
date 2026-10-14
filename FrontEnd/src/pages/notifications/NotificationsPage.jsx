import NotificationList from './components/NotificationList';
import useNotifications from './hooks/useNotifications';
import { Navigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

export default function NotificationsPage({ isLoggedIn, authReady }) {
    const { notifications, loading, readingId, error, markAsRead } = useNotifications(isLoggedIn);

    if (!authReady) return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบบัญชีผู้ใช้...</main>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return (
        <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
            <PageHeader title="การแจ้งเตือน" />

            {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

            <NotificationList
                notifications={notifications}
                loading={loading}
                readingId={readingId}
                onMarkAsRead={markAsRead}
            />
        </main>
    );
}

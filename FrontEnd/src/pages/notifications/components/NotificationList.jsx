import NotificationCard from './NotificationCard';

export default function NotificationList({ notifications, loading, readingId, onMarkAsRead }) {
    if (loading) {
        return <p className="py-16 text-center text-[#666666]">กำลังโหลดการแจ้งเตือน...</p>;
    }

    if (notifications.length === 0) {
        return (
            <section className="mt-7 rounded-4xl border border-dashed border-[#dcdacc] bg-white px-5 py-16 text-center">
                <h2 className="font-bold text-[#0d0c22]">ยังไม่มีการแจ้งเตือน</h2>
                <p className="mt-1 text-sm text-[#666666]">การแจ้งเตือนใหม่จะปรากฏที่นี่</p>
            </section>
        );
    }

    return (
        <section className="mt-7 divide-y divide-[#e7e7e9] overflow-hidden rounded-4xl border border-[#e7e7e9] bg-white shadow-[0_12px_35px_rgba(27,32,50,0.07)]" aria-label="รายการแจ้งเตือน">
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    isSaving={readingId === notification.id}
                    onMarkAsRead={onMarkAsRead}
                />
            ))}
        </section>
    );
}

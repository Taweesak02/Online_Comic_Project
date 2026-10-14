import { Link } from 'react-router-dom';

const formatDate = (value) => new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
}).format(new Date(value));

export default function NotificationCard({ notification, isSaving, onMarkAsRead }) {
    const handleMarkAsRead = () => onMarkAsRead(notification);

    return (
        <article className={`p-5 sm:p-6 ${notification.isRead ? 'bg-white' : 'bg-[#f5f8ff]'}`}>
            <div className="flex items-start gap-4">
                <span className={`mt-1 size-2.5 shrink-0 rounded-full ${notification.isRead ? 'bg-[#dcdacc]' : 'bg-[#0057ff]'}`} aria-label={notification.isRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน'} />
                <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#0d0c22]">{notification.message}</p>
                    <time className="mt-2 block text-xs text-[#666666]" dateTime={notification.createdAt}>{formatDate(notification.createdAt)}</time>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {notification.relatedComicId && (
                            <Link
                                className="text-xs font-semibold text-[#213f68] hover:underline"
                                to={`/comics/${notification.relatedComicId}`}
                                onClick={handleMarkAsRead}
                            >
                                ดูการ์ตูน →
                            </Link>
                        )}
                        {!notification.isRead && (
                            <button
                                className="text-xs font-semibold text-[#666666] hover:underline disabled:opacity-50"
                                type="button"
                                disabled={isSaving}
                                onClick={handleMarkAsRead}
                            >
                                {isSaving ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าอ่านแล้ว'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

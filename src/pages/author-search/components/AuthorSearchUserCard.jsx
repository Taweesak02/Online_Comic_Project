import { Link } from 'react-router-dom';

export default function AuthorSearchUserCard({ user }) {
    const profileUrl = `/authors/${user.id}?username=${encodeURIComponent(user.username || '')}`;
    const initial = (user.username || '?').slice(0, 1).toUpperCase();

    return (
        <Link
            to={profileUrl}
            state={{ user }}
            className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#213f68]"
        >
            <div
                className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xl font-bold text-[#213f68]"
                aria-hidden="true"
            >
                {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="size-full object-cover" />
                ) : initial}
            </div>
            <h2 className="min-w-0 flex-1 break-all font-semibold text-slate-900">
                {user.username || 'ผู้ใช้'}
            </h2>
            <span className="shrink-0 text-sm text-[#213f68]">ดูโปรไฟล์ →</span>
        </Link>
    );
}

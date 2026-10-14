import AuthorSearchUserCard from './AuthorSearchUserCard';
import AuthorSearchPagination from './AuthorSearchPagination';

export default function AuthorSearchResults({ state, page, onPageChange }) {
    const { loading, error, users, pagination } = state;

    if (loading) {
        return <output className="block py-12 text-center text-slate-600">กำลังค้นหา...</output>;
    }

    if (error) {
        return <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
    }

    return (
        <section className="mt-6" aria-label="ผลการค้นหาผู้ใช้">
            <output className="block mb-4 text-sm text-slate-600">
                พบ {pagination?.total ?? users.length} บัญชี
            </output>

            {users.length === 0 ? (
                <p className="py-12 text-center text-slate-600">ไม่พบผู้ใช้ ลองค้นหาด้วยชื่ออื่น</p>
            ) : (
                <ul className="space-y-3">
                    {users.map((user) => (
                        <li key={user.id}>
                            <AuthorSearchUserCard user={user} />
                        </li>
                    ))}
                </ul>
            )}

            <AuthorSearchPagination
                page={page}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={onPageChange}
            />
        </section>
    );
}

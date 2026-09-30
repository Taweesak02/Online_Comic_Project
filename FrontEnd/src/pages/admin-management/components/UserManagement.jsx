import useUserManagement from '../hooks/useUserManagement';

const buttonClass = 'rounded-xl bg-[#213f68] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const inputClass = 'min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2';

export default function UserManagement() {
    const { keyword, setKeyword, result, busy, error, message, isBanned, search, moderate } = useUserManagement();

    return (
        <section aria-labelledby="users-title">
            <p className="text-sm font-semibold text-[#213f68]">USERS</p>
            <h2 id="users-title" className="mt-1 text-2xl font-bold">จัดการผู้ใช้</h2>
            <p className="mt-2 text-sm text-slate-600">ค้นหาบัญชีด้วยชื่อผู้ใช้ เพื่อระงับบัญชีหรือยกเลิกการระงับจากรายการผู้ใช้</p>
            <form className="mt-5 flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); search(1, keyword); }}>
                <label className="sr-only" htmlFor="admin-user-search">ชื่อผู้ใช้</label>
                <input id="admin-user-search" className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="ชื่อผู้ใช้" disabled={busy} />
                <button type="submit" className={buttonClass} disabled={busy}>ค้นหา</button>
            </form>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <output className="block mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</output>}
            {busy && <output className="block mt-4 text-sm text-slate-600">กำลังดำเนินการ...</output>}
            {result && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4" aria-busy={busy}>
                {result.users?.length ? <ul className="divide-y divide-slate-100">
                    {result.users.map((user) => <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                            <p className="wrap-break-word font-semibold">{user.username}</p>
                            <p className="text-sm text-slate-600">ID: {user.id} · {isBanned(user) ? 'ถูกระงับ' : 'ใช้งานได้'}</p>
                        </div>
                        <button type="button" disabled={busy} onClick={() => moderate(user.id, user.username, !isBanned(user))}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${isBanned(user) ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {isBanned(user) ? 'ยกเลิกการระงับ' : 'ระงับบัญชี'}
                        </button>
                    </li>)}
                </ul> : <p className="py-5 text-center text-slate-600">ไม่พบผู้ใช้</p>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <button type="button" className={buttonClass} disabled={busy || (result.pagination?.page ?? 1) <= 1} onClick={() => search(result.pagination.page - 1)}>ก่อนหน้า</button>
                    <span className="text-sm text-slate-600">หน้า {result.pagination?.page ?? 1} · {result.pagination?.total ?? 0} บัญชี</span>
                    <button type="button" className={buttonClass} disabled={busy || result.pagination?.page == null || (result.pagination.page >= (result.pagination?.totalPages ?? result.pagination.page))} onClick={() => search(result.pagination.page + 1)}>ถัดไป</button>
                </div>
            </div>}
        </section>
    );
}

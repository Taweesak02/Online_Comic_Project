export default function AuthorSearchForm({ username, sort, navigateSearch, submit }) {
    return (
        <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="min-w-0 flex-1 text-sm font-semibold"><span>ชื่อผู้ใช้</span>
                <input name="username" value={username} onChange={(event) => navigateSearch({ username: event.target.value, sort, page: '1' }, { replace: true })} placeholder="พิมพ์ชื่อผู้ใช้" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2" />
            </label>
            <label className="text-sm font-semibold"><span>เรียงตาม</span>
                <select name="sort" value={sort} onChange={(event) => navigateSearch({ username, sort: event.target.value, page: '1' })} className="mt-2 block rounded-xl border border-slate-300 bg-white px-3 py-2">
                    <option value="latest">ใหม่ล่าสุด</option>
                    <option value="oldest">เก่าสุด</option>
                    <option value="username">ชื่อผู้ใช้ A–Z</option>
                </select>
            </label>
            <button type="submit" className="rounded-xl bg-[#213f68] px-5 py-2 font-semibold text-white">ค้นหา</button>
        </form>
    );
}

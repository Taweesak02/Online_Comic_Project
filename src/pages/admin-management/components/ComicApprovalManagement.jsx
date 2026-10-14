import useComicApprovalManagement from '../hooks/useComicApprovalManagement';

const buttonClass = 'rounded-xl bg-[#213f68] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const approvalLabels = { APPROVED: 'อนุมัติแล้ว', UNAPPROVED: 'ยังไม่อนุมัติ', RESUBMIT: 'ส่งพิจารณาใหม่' };

export default function ComicApprovalManagement() {
    const { keyword, setKeyword, status, result, busy, error, message, search, moderate, changeStatus } = useComicApprovalManagement();

    return (
        <section aria-labelledby="admin-comics-title">
            <p className="text-sm font-semibold text-[#213f68]">COMICS</p>
            <h2 id="admin-comics-title" className="mt-1 text-2xl font-bold">จัดการการ์ตูน</h2>
            <p className="mt-2 text-sm text-slate-600">ค้นหาการ์ตูนด้วยชื่อเรื่อง เพื่ออนุมัติหรือยกเลิกการอนุมัติ รวมถึงเรื่องที่ยังไม่อนุมัติและส่งพิจารณาใหม่</p>
            <fieldset className="mt-5 flex flex-wrap gap-3"  aria-label="กรองสถานะการ์ตูน">
                {[{ value: '', label: 'ทั้งหมด' }, { value: 'RESUBMIT', label: 'ส่งพิจารณาใหม่ (RESUBMIT)' }].map((option) => (
                    <button key={option.value} type="button" disabled={busy} aria-pressed={status === option.value}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${status === option.value ? 'bg-[#213f68] text-white' : 'bg-slate-100 text-slate-700'}`}
                        onClick={() => changeStatus(option.value)}>
                        {option.label}
                    </button>
                ))}
            </fieldset>
            <form className="mt-5 flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); search(1, keyword); }}>
                <label className="sr-only" htmlFor="admin-comic-search">ชื่อการ์ตูน</label>
                <input id="admin-comic-search" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="ชื่อการ์ตูน" disabled={busy} />
                <button type="submit" className={buttonClass} disabled={busy}>ค้นหา</button>
            </form>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <output className="block mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</output>}
            {busy && <output className="block mt-4 text-sm text-slate-600">กำลังดำเนินการ...</output>}
            {result && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4" aria-busy={busy}>
                {result.comics?.length ? <ul className="divide-y divide-slate-100">
                    {result.comics.map((comic) => <li key={comic.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                            <p className="wrap-break-word font-semibold">{comic.title}</p>
                            <p className="text-sm text-slate-600">ID: {comic.id} · {approvalLabels[comic.approved] ?? 'ไม่ทราบสถานะ'}</p>
                            {comic.isActive === false && <p className="mt-1 text-xs text-slate-600">ปิดใช้งานแล้ว</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {comic.approved !== 'APPROVED' && <button type="button" disabled={busy} onClick={() => moderate(comic, true)} className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50">อนุมัติ</button>}
                            {comic.approved !== 'UNAPPROVED' && <button type="button" disabled={busy} onClick={() => moderate(comic, false)} className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">ยกเลิกการอนุมัติ</button>}
                        </div>
                    </li>)}
                </ul> : <p className="py-5 text-center text-slate-600">{status === 'RESUBMIT' ? 'ไม่พบการ์ตูนที่ส่งพิจารณาใหม่' : 'ไม่พบการ์ตูน'}</p>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <button type="button" className={buttonClass} disabled={busy || (result.pagination?.page ?? 1) <= 1} onClick={() => search(result.pagination.page - 1)}>ก่อนหน้า</button>
                    <span className="text-sm text-slate-600">หน้า {result.pagination?.page ?? 1} · {result.pagination?.total ?? 0} เรื่อง</span>
                    <button type="button" className={buttonClass} disabled={busy || result.pagination?.page == null || (result.pagination.page >= (result.pagination?.totalPages ?? result.pagination.page))} onClick={() => search(result.pagination.page + 1)}>ถัดไป</button>
                </div>
            </div>}
        </section>
    );
}

export default function AuthorSearchPagination({ page, totalPages, onPageChange }) {
    return (
        <nav aria-label="หน้าผลการค้นหา" className="mt-6 flex items-center justify-between gap-3">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="rounded-xl border border-slate-300 px-4 py-2 disabled:opacity-40"
            >
                ก่อนหน้า
            </button>
            <span className="text-sm text-slate-600">
                หน้า {page} / {Math.max(1, totalPages)}
            </span>
            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded-xl border border-slate-300 px-4 py-2 disabled:opacity-40"
            >
                ถัดไป
            </button>
        </nav>
    );
}

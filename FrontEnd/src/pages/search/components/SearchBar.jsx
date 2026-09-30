export default function SearchBar({ value = '', onChange, onSearch }) {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && typeof onSearch === 'function') {
            onSearch();
        }
    };

    return (
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-[#dfe7f5] bg-white px-3 py-2 shadow-sm">
            <span className="text-base text-slate-500" aria-hidden="true">⌕</span>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ค้นหาชื่อเรื่อง / คำสำคัญ"
                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="ค้นหาการ์ตูน"
            />
            <button
                type="button"
                onClick={() => onSearch?.()}
                className="rounded-md bg-[#0057ff] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#004ae0]"
            >
                ค้นหา
            </button>
        </div>
    );
}

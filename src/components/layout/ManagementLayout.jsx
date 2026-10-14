export default function ManagementLayout({
  items,
  active,
  onChange,
  children,
  navLabel = "เมนูจัดการ",
}) {
  return (
    <div className="mt-7 grid items-start gap-6 md:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-[#e7e7e9] bg-white p-3 md:sticky md:top-24">
        <nav aria-label={navLabel}>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {items.map((item, index) => {
              const selected = active === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onChange(item.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#213f68] ${selected ? "bg-[#213f68] text-white" : "text-[#0d0c22] hover:bg-[#f8f8f8]"}`}
                  >
                    <span className="text-xs font-bold opacity-60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm">{item.label}</strong>
                      {item.detail && (
                        <small className="mt-1 hidden text-xs opacity-65 xl:block">
                          {item.detail}
                        </small>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

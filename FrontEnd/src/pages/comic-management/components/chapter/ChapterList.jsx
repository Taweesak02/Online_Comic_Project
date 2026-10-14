export default function ChapterList({ chapters, onEdit, onDelete }) {
  return (
    <section className="rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0d0c22]">ตอนทั้งหมด</h2>
        <span className="rounded-full bg-[#213f68]/10 px-3 py-1 text-sm font-semibold text-[#213f68]">
          {chapters.length} ตอน
        </span>
      </div>
      {chapters.length ? (
        <div className="divide-y divide-[#e7e7e9]">
          {chapters.map((chapter) => (
            <div
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
              key={chapter.id}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#dcdacc] text-sm font-bold text-[#213f68]">
                {chapter.chapterNumber}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-[#0d0c22]">
                  {chapter.title}
                </h3>
                <p className="mt-1 text-xs text-[#666666]">
                  {chapter.coinCost ? `${chapter.coinCost} เหรียญ` : "อ่านฟรี"}{" "}
                  · {chapter.viewCount ?? 0} ยอดอ่าน
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-full bg-[#dcdacc]/60 px-4 py-2 text-xs font-semibold text-[#0d0c22] hover:bg-[#dcdacc]"
                  type="button"
                  onClick={() => onEdit(chapter)}
                >
                  แก้ไข
                </button>
                <button
                  className="rounded-full px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  type="button"
                  onClick={() => onDelete(chapter)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-[#666666]">
          ยังไม่มีตอน เริ่มเพิ่มตอนแรกได้เลย
        </p>
      )}
    </section>
  );
}

import ManagedComicList from "./ManagedComicList";

export default function AllComics({ comics, onCreate, onEdit, onManageChapters, onResubmit, resubmittingId }) {

  return (
    <section className="rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#213f68]">YOUR LIBRARY</p>
          <h2 className="mt-1 text-xl font-bold text-[#0d0c22]">การ์ตูนทั้งหมด</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#213f68]/10 px-3 py-1 text-sm font-semibold text-[#213f68]">
            {comics.length} รายการ
          </span>
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-[#213f68] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172e4d]"
          >
            + สร้างการ์ตูน
          </button>
        </div>
      </div>
      {comics.length ? (
        <ManagedComicList comics={comics} onEdit={onEdit} onManageChapters={onManageChapters} onResubmit={onResubmit} resubmittingId={resubmittingId} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#dcdacc] bg-[#f8f8f8] px-5 py-14 text-center">
          <p className="font-semibold text-[#0d0c22]">ยังไม่มีการ์ตูนที่คุณสร้าง</p>
          <p className="mt-1 text-sm text-[#666666]">กด “สร้างการ์ตูน” เพื่อเริ่มเพิ่มผลงานแรก</p>
        </div>
      )}
    </section>
  );
}

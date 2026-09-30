import ManagedComicList from "./ManagedComicList";

export default function ReviewComics({ comics, onEdit, onManageChapters, onResubmit, resubmittingId }) {

  return (
    <section className="rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#213f68]">YOUR LIBRARY</p>
          <h2 className="mt-1 text-xl font-bold text-[#0d0c22]">สถานะการพิจารณา</h2>
        </div>
        <span className="rounded-full bg-[#213f68]/10 px-3 py-1 text-sm font-semibold text-[#213f68]">
          {comics.length} รายการ
        </span>
      </div>
      {comics.length ? (
        <ManagedComicList comics={comics} onEdit={onEdit} onManageChapters={onManageChapters} onResubmit={onResubmit} resubmittingId={resubmittingId} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#dcdacc] bg-[#f8f8f8] px-5 py-14 text-center">
          <p className="font-semibold text-[#0d0c22]">ไม่มีการ์ตูนในรายการนี้</p>
          <p className="mt-1 text-sm text-[#666666]">เลือกเมนูการ์ตูนทั้งหมดเพื่อดูผลงานของคุณ</p>
        </div>
      )}
    </section>
  );
}

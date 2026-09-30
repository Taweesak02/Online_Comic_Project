import { useState } from "react";
import { getCoverUrl, getComicStatusLabel } from "../../../../utils/comicUtils";

const approvalLabels = {
  APPROVED: "อนุมัติแล้ว",
  UNAPPROVED: "ยังไม่อนุมัติ",
  RESUBMIT: "รอพิจารณาใหม่",
};

export default function ManagedComicList({ comics, onEdit, onManageChapters, onResubmit, resubmittingId }) {
  const [openId, setOpenId] = useState(null);

  return (
        <div className="divide-y divide-[#e7e7e9]">
          {comics.map((comic, index) => {
            const id = comic.id ?? comic._id ?? `${index}`;
            const title = comic.title ?? comic.name ?? `Comic ${index + 1}`;
            const cover = getCoverUrl(
              comic.coverImage ?? comic.cover ?? comic.image ?? comic.thumbnail,
            );
            return (
              <article
                className="relative flex flex-wrap items-center gap-4 py-4"
                key={id}
              >
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-[#dcdacc]">
                  {cover ? (
                    <img
                      className="size-full object-cover"
                      src={cover}
                      alt={`ปก ${title}`}
                    />
                  ) : (
                    <span className="grid size-full place-items-center p-1 text-center text-[10px] text-[#666666]">
                      ไม่มีรูปปก
                    </span>
                  )}
                </div>
                <button
                  className="min-w-0 flex-1 text-left"
                  type="button"
                  onClick={() => onEdit(comic)}
                >
                  <h3 className="truncate text-base font-bold text-[#0d0c22]">
                    {title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#666666]">
                    {comic.description || "ไม่มีคำอธิบาย"}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#213f68]">
                    {comic.chapterCount ?? 0} ตอน ·{" "}
                    {getComicStatusLabel(comic.status)}
                  </p>
                  <p className="mt-1 text-xs text-[#666666]">
                    {comic.isActive === false ? "ปิดใช้งานแล้ว · " : ""}
                    {approvalLabels[comic.approved] ?? "ไม่ทราบสถานะการอนุมัติ"}
                  </p>
                </button>
                {onResubmit && comic.approved === "UNAPPROVED" &&
                  comic.isActive !== false && (
                    <button
                      className="rounded-xl bg-[#213f68]/10 px-3 py-2 text-sm font-semibold text-[#213f68] disabled:opacity-60"
                      type="button"
                      disabled={resubmittingId !== null}
                      onClick={() => onResubmit(comic)}
                    >
                      {resubmittingId === id ? "กำลังส่ง..." : "ส่งพิจารณาใหม่"}
                    </button>
                  )}
                <div className="relative">
                  <button
                    className="grid size-10 place-items-center rounded-full text-xl font-bold text-[#213f68] hover:bg-[#f8f8f8]"
                    type="button"
                    onClick={() => setOpenId(openId === id ? null : id)}
                    aria-label={`ตัวเลือก ${title}`}
                  >
                    ⋯
                  </button>
                  {openId === id && (
                    <div className="absolute right-0 top-11 z-10 w-40 rounded-2xl border border-[#e7e7e9] bg-white p-1.5 shadow-[0_15px_30px_rgba(27,32,50,0.15)]">
                      <button
                        className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#0d0c22] hover:bg-[#f8f8f8]"
                        type="button"
                        onClick={() => {
                          setOpenId(null);
                          onEdit(comic);
                        }}
                      >
                        แก้ไขการ์ตูน
                      </button>
                      <button
                        className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#213f68] hover:bg-[#f8f8f8]"
                        type="button"
                        onClick={() => {
                          setOpenId(null);
                          onManageChapters(comic);
                        }}
                      >
                        จัดการตอน
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
  );
}

import { useEffect, useMemo } from "react";
import { getCoverUrl } from "../../../../utils/comicUtils";
import ModalDialog from "../../../../components/ui/ModalDialog";

export default function ChapterEditorModal({
  form,
  files,
  existingPages,
  isEdit,
  saving,
  onChange,
  onFilesChange,
  onRemoveExistingPage,
  onCancel,
  onSubmit,
}) {
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const getSaveLabel = () => {
      if (saving) {
          return "กำลังบันทึก...";
      }
      if (isEdit) {
          return "บันทึกการแก้ไข";
      }
      return "อัปโหลดและเพิ่มตอน";
  };

  return (
    <ModalDialog label={isEdit ? "แก้ไขตอนการ์ตูน" : "เพิ่มตอนใหม่"} onClose={onCancel}>
      <section
        className="mx-auto w-full max-w-3xl rounded-4xl bg-white p-6 shadow-[0_20px_48px_rgba(0,0,0,0.2)] sm:p-8"
      >
        <div className="mb-6 flex justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#213f68]">
              {isEdit ? "EDIT CHAPTER" : "NEW CHAPTER"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0d0c22]">
              {isEdit ? "แก้ไขตอนการ์ตูน" : "เพิ่มตอนใหม่"}
            </h2>
          </div>
          <button
            className="grid size-9 place-items-center rounded-full text-xl hover:bg-[#f8f8f8]"
            type="button"
            onClick={onCancel}
            aria-label="ปิด"
          >
            ×
          </button>
        </div>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={onSubmit}>
          <label className="text-sm font-semibold text-[#0d0c22]">
            <span>เลขตอน</span>
            <input
              className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3"
              type="number"
              min="1"
              name="chapterNumber"
              value={form.chapterNumber}
              onChange={onChange}
              required
            />
          </label>
          <label className="text-sm font-semibold text-[#0d0c22]">
            <span>ราคา (เหรียญ)</span>
            <input
              className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3"
              type="number"
              min="0"
              name="coinCost"
              value={form.coinCost}
              onChange={onChange}
              required
            />
          </label>
          <label className="text-sm font-semibold text-[#0d0c22] sm:col-span-2">
            <span>ชื่อตอน</span>
            <input
              className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="เช่น การพบกันครั้งแรก"
              required
            />
          </label>
          <label className="block cursor-pointer text-sm font-semibold text-[#0d0c22] sm:col-span-2">
            {isEdit ? "เพิ่มหน้าการ์ตูนเพิ่มเติม" : "หน้าการ์ตูน"}
            <span className="mt-2 flex min-h-28 items-center justify-center rounded-2xl border-2 border-dashed border-[#dcdacc] bg-[#f8f8f8] text-center">
              <span>
                <b className="block text-lg text-[#213f68]">
                  + เลือกหลายรูปภาพ
                </b>
                <span className="mt-1 block text-xs font-normal text-[#666666]">
                  รูปจะเรียงต่อท้ายตามลำดับที่เลือก
                </span>
              </span>
            </span>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={({ target }) =>
                onFilesChange(Array.from(target.files ?? []))
              }
            />
          </label>
          {existingPages.length > 0 && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-semibold text-[#0d0c22]">
                หน้าปัจจุบัน — กด × เพื่อลบ
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {existingPages.map((page, index) => (
                  <div
                    className="relative aspect-[3/4] overflow-hidden rounded-xl"
                    key={page.id ?? page.imageUrl}
                  >
                    <img
                      className="size-full object-cover"
                      src={getCoverUrl(page.imageUrl)}
                      alt={`หน้าปัจจุบัน ${index + 1}`}
                    />
                    <button
                      className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-red-600 text-sm font-bold text-white"
                      type="button"
                      onClick={() => onRemoveExistingPage(page.imageUrl)}
                      aria-label={`ลบหน้าที่ ${index + 1}`}
                    >
                      ×
                    </button>
                    <span className="absolute bottom-1 left-1 rounded bg-[#0d0c22]/70 px-1.5 py-0.5 text-[10px] text-white">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {previews.length > 0 && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-semibold text-[#0d0c22]">
                รูปที่จะเพิ่ม
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {previews.map((preview, index) => (
                  <div
                    className="relative aspect-[3/4] overflow-hidden rounded-xl"
                    key={preview}
                  >
                    <img
                      className="size-full object-cover"
                      src={preview}
                      alt={`รูปใหม่ ${index + 1}`}
                    />
                    <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-[#213f68] text-[10px] font-bold text-white">
                      {existingPages.length + index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-[#e7e7e9] pt-5 sm:col-span-2">
            <button
              className="rounded-full border border-[#e2e6e6] px-5 py-2.5 text-sm font-semibold"
              type="button"
              onClick={onCancel}
            >
              ยกเลิก
            </button>
            <button
              className="rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {getSaveLabel()}
            </button>
          </div>
        </form>
      </section>
    </ModalDialog>
  );
}

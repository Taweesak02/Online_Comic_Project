import { comicStatusLabels } from "../../../../utils/comicUtils";
import { useEffect, useMemo } from "react";
import useComicEditor from "../../hooks/useComicEditor";
import ChoiceChips from "./ChoiceChips";
import ModalDialog from "../../../../components/ui/ModalDialog";

export default function ComicEditorForm({ comic, onClose, onSuccess }) {
  const {
    form, imageName, categories, tags, selectedCategoryIds, selectedTagIds,
    editMode, submitting, error, updateForm: onChange,
    changeImage: onImageChange, toggleCategory: onCategoryToggle,
    toggleTag: onTagToggle, removeComic: onDelete,
    manageChapters: onManageChapters, save: onSubmit,
  } = useComicEditor(comic, onSuccess);
  const onCancel = onClose;
  const preview = useMemo(
    () =>
      form.coverImage
        ? URL.createObjectURL(form.coverImage)
        : form.coverImageUrl || "",
    [form.coverImage, form.coverImageUrl],
  );
  useEffect(
    () => () => {
      if (form.coverImage && preview) URL.revokeObjectURL(preview);
    },
    [form.coverImage, preview],
  );
  const getSaveLabel = () => {
      if (submitting) {
          return "กำลังบันทึก...";
      }
      if (editMode) {
          return "บันทึกการแก้ไข";
      }
      return "สร้างการ์ตูน";
  };

  return (
    <ModalDialog label={editMode ? "แก้ไขการ์ตูน" : "สร้างการ์ตูน"} onClose={onCancel}>
      <section
        className="mx-auto w-full max-w-3xl rounded-4xl border border-white bg-white p-6 shadow-[0_20px_48px_rgba(0,0,0,0.2)] sm:p-8"
        aria-label={editMode ? "แก้ไขการ์ตูน" : "สร้างการ์ตูน"}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#213f68]">
              {editMode ? "EDIT COMIC" : "NEW COMIC"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0d0c22]">
              {editMode ? "แก้ไขข้อมูลการ์ตูน" : "สร้างการ์ตูนใหม่"}
            </h2>
          </div>
          <button
            className="grid size-9 place-items-center rounded-full text-xl text-[#666666] hover:bg-[#f8f8f8]"
            type="button"
            onClick={onCancel}
            aria-label="ปิด"
          >
            ×
          </button>
        </div>
        {error && (
          <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="text-sm font-semibold text-[#0d0c22] md:col-span-2">
            <span>ชื่อเรื่อง</span>
            <input
              className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 text-sm outline-none transition focus:border-[#213f68] focus:ring-2 focus:ring-[#213f68]/10"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="กรอกชื่อเรื่อง"
              required
            />
          </label>
          {editMode && (
            <label className="text-sm font-semibold text-[#0d0c22] md:col-span-2">
              <span>สถานะ</span>
              <select
                className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#213f68] focus:ring-2 focus:ring-[#213f68]/10"
                name="status"
                value={form.status}
                onChange={onChange}
              >
                {Object.entries(comicStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="text-sm font-semibold text-[#0d0c22] md:col-span-2">
            <span>คำอธิบาย</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#213f68] focus:ring-2 focus:ring-[#213f68]/10"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="ใส่คำอธิบายเพิ่มเติม"
            />
          </label>
          <label className="block cursor-pointer text-sm font-semibold text-[#0d0c22] md:col-span-2">
            <span>รูปปกการ์ตูน</span>
            <span className="mt-2 flex min-h-36 items-center justify-center rounded-2xl border-2 border-dashed border-[#dcdacc] bg-[#f8f8f8] text-center transition hover:border-[#213f68]">
              <span>
                <b className="block text-lg text-[#213f68]">+ เลือกรูปภาพ</b>
                <span className="mt-1 block text-xs font-normal text-[#666666]">
                  JPG, PNG หรือ WEBP
                </span>
              </span>
            </span>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />
          </label>
          {preview && (
            <div className="overflow-hidden rounded-2xl border border-[#e7e7e9] bg-[#f8f8f8] md:col-span-2">
              <img
                className="mx-auto h-56 w-auto max-w-full object-cover"
                src={preview}
                alt="ตัวอย่างรูปปก"
              />
            </div>
          )}
          {imageName && (
            <p className="text-xs text-[#666666] md:col-span-2">
              ไฟล์ที่เลือก: {imageName}
            </p>
          )}
          <div className="space-y-5 border-t border-[#e7e7e9] pt-5 md:col-span-2">
            <ChoiceChips
              label="หมวดหมู่"
              options={categories}
              selectedIds={selectedCategoryIds}
              onToggle={onCategoryToggle}
              emptyText="ไม่มีข้อมูลหมวดหมู่"
            />
            <ChoiceChips
              label="แท็ก"
              options={tags}
              selectedIds={selectedTagIds}
              onToggle={onTagToggle}
              emptyText="ไม่มีข้อมูลแท็ก"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#e7e7e9] pt-5 md:col-span-2">
            {editMode ? (
              <div className="flex gap-2">
                <button
                  className="rounded-full bg-[#dcdacc]/60 px-4 py-2.5 text-sm font-semibold text-[#0d0c22] hover:bg-[#dcdacc]"
                  type="button"
                  onClick={onManageChapters}
                >
                  จัดการตอน
                </button>
                <button
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  type="button"
                  onClick={onDelete}
                  disabled={submitting}
                >
                  ปิดใช้งานการ์ตูน
                </button>
              </div>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                className="rounded-full border border-[#e2e6e6] px-5 py-2.5 text-sm font-semibold text-[#0d0c22] hover:bg-[#f8f8f8]"
                type="button"
                onClick={onCancel}
              >
                ยกเลิก
              </button>
              <button
                className="rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172e4d] disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {getSaveLabel()}
              </button>
            </div>
          </div>
        </form>
      </section>
    </ModalDialog>
  );
}

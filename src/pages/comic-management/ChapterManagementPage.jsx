import { Link, useParams } from "react-router-dom";
import ChapterEditorModal from "./components/chapter/ChapterEditorModal";
import ChapterList from "./components/chapter/ChapterList";
import { getCoverUrl } from "../../utils/comicUtils";
import useChapterManagement from "./hooks/useChapterManagement";

export default function ChapterManagementPage() {
  const { comicId } = useParams();
  const {
    comic,
    chapters,
    form,
    files,
    existingPages,
    editingChapter,
    isEditorOpen,
    isSaving,
    error,
    setFiles,
    openCreateEditor,
    openEditEditor,
    closeEditor,
    updateForm,
    removeExistingPage,
    saveChapter,
    removeChapter,
  } = useChapterManagement(comicId);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">

      <Link
        className="text-sm font-semibold text-[#213f68] hover:underline"
        to="/comic-management?section=comics"
      >
        ← กลับไปการ์ตูนของฉัน
      </Link>

      {error && (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      
      {comic && (
        <section className="mt-5 flex flex-col gap-5 rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:flex-row sm:items-center sm:p-7">
          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#dcdacc]">
            {getCoverUrl(comic.coverImage) && (
              <img
                className="size-full object-cover"
                src={getCoverUrl(comic.coverImage)}
                alt=""
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#213f68]">
              CHAPTER MANAGER
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold text-[#0d0c22]">
              {comic.title}
            </h1>
            <p className="mt-1 text-sm text-[#666666]">
              เพิ่มและจัดการตอนพร้อมหน้าการ์ตูนหลายรูป
            </p>
          </div>
          <button
            className="rounded-full bg-[#213f68] px-5 py-3 text-sm font-semibold text-white"
            type="button"
            onClick={openCreateEditor}
          >
            + เพิ่มตอน
          </button>
        </section>
      )}
      <div className="mt-7">
        <ChapterList
          chapters={chapters}
          onEdit={openEditEditor}
          onDelete={removeChapter}
        />
      </div>
      {isEditorOpen && (
        <ChapterEditorModal
          form={form}
          files={files}
          existingPages={existingPages}
          isEdit={Boolean(editingChapter)}
          saving={isSaving}
          onChange={updateForm}
          onFilesChange={setFiles}
          onRemoveExistingPage={removeExistingPage}
          onCancel={closeEditor}
          onSubmit={saveChapter}
        />
      )}
    </main>
  );
}

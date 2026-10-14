import { useCallback, useEffect, useState } from "react";
import {
  createChapter,
  deleteChapter,
  getChapterPages,
  getComicChapters,
  getManagedComic,
  replaceChapterPages,
  updateChapter,
  uploadChapterImage,
} from "../../../api/comicManagementApi";
import getErrorMessage from "../../../utils/getErrorMessage";

const EMPTY_FORM = { chapterNumber: "", title: "", coinCost: "0" };

export default function useChapterManagement(comicId) {
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [existingPages, setExistingPages] = useState([]);
  const [originalPageUrls, setOriginalPageUrls] = useState([]);
  const [editingChapter, setEditingChapter] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadChapters = useCallback(async () => {
    const [comicData, chapterData] = await Promise.all([
      getManagedComic(comicId),
      getComicChapters(comicId),
    ]);
    setComic(comicData);
    setChapters(chapterData);
  }, [comicId]);

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        const [comicData, chapterData] = await Promise.all([
          getManagedComic(comicId),
          getComicChapters(comicId),
        ]);

        if (isActive) {
          setComic(comicData);
          setChapters(chapterData);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getErrorMessage(
              requestError,
              "ไม่สามารถโหลดข้อมูลตอนการ์ตูนได้",
            ),
          );
        }
      }
    };

    loadInitialData();
    return () => {
      isActive = false;
    };
  }, [comicId]);

  const resetEditor = () => {
    setEditingChapter(null);
    setFiles([]);
    setExistingPages([]);
    setOriginalPageUrls([]);
    setForm(EMPTY_FORM);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    resetEditor();
  };

  const openCreateEditor = () => {
    resetEditor();
    setForm({
      ...EMPTY_FORM,
      chapterNumber: String(
        Math.max(
          0,
          ...chapters.map((chapter) => Number(chapter.chapterNumber) || 0),
        ) + 1,
      ),
    });
    setError("");
    setIsEditorOpen(true);
  };

  const openEditEditor = async (chapter) => {
    setError("");
    setEditingChapter(chapter);
    setForm({
      chapterNumber: String(chapter.chapterNumber),
      title: chapter.title,
      coinCost: String(chapter.coinCost ?? 0),
    });
    setFiles([]);
    setExistingPages([]);
    setOriginalPageUrls([]);
    setIsEditorOpen(true);

    try {
      const pages = await getChapterPages(chapter.id);
      setExistingPages(pages);
      setOriginalPageUrls(pages.map((page) => page.imageUrl));
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "ไม่สามารถโหลดรูปภาพของตอนนี้ได้"),
      );
    }
  };

  const updateForm = ({ target }) => {
    setForm((currentForm) => ({
      ...currentForm,
      [target.name]: target.value,
    }));
  };

  const removeExistingPage = (url) => {
    setExistingPages((currentPages) =>
      currentPages.filter((page) => page.imageUrl !== url),
    );
  };

  const saveChapter = async (event) => {
    event.preventDefault();

    if (!editingChapter && !files.length) {
      setError("กรุณาเลือกรูปภาพอย่างน้อย 1 หน้า");
      return;
    }
    if (editingChapter && !existingPages.length && !files.length) {
      setError("ตอนการ์ตูนต้องมีรูปภาพอย่างน้อย 1 หน้า");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const newPageUrls = [];
      for (const file of files) {
        newPageUrls.push(await uploadChapterImage(file));
      }

      if (editingChapter) {
        await updateChapter(editingChapter.id, form);
        const currentPageUrls = existingPages.map((page) => page.imageUrl);
        const pagesChanged =
          files.length > 0 ||
          currentPageUrls.length !== originalPageUrls.length ||
          currentPageUrls.some(
            (url, index) => url !== originalPageUrls[index],
          );

        if (pagesChanged) {
          await replaceChapterPages(editingChapter.id, [
            ...currentPageUrls,
            ...newPageUrls,
          ]);
        }
      } else {
        await createChapter({ comicId, ...form, pages: newPageUrls });
      }

      closeEditor();
      await loadChapters();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "ไม่สามารถบันทึกตอนการ์ตูนได้"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeChapter = async (chapter) => {
    const shouldRemove = window.confirm(
      `ลบตอนที่ ${chapter.chapterNumber}: ${chapter.title} หรือไม่?`,
    );
    if (!shouldRemove) return;

    try {
      await deleteChapter(chapter.id);
      await loadChapters();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "ไม่สามารถลบตอนการ์ตูนได้"),
      );
    }
  };

  return {
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
  };
}

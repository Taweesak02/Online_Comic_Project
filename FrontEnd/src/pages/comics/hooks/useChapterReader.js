import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getChapterContent, getComicDetail } from '../../../api/comicReaderApi';

export default function useChapterReader() {
    const { comicId, chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [error, setError] = useState('');
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorChapterId, setErrorChapterId] = useState(null);

    useEffect(() => {
        let active = true;

        // Always request protected content from the API. Route state and chapter
        // metadata are never treated as permission to display paid pages.
        Promise.all([getChapterContent(chapterId), getComicDetail(comicId)])
            .then(([content, comic]) => {
                if (!active) return;
                setChapter(content);
                setChapters(comic.chapters ?? []);
                setError('');
                setErrorStatus(null);
                setErrorChapterId(null);
                window.scrollTo({ top: 0, behavior: 'auto' });
            })
            .catch((requestError) => {
                if (!active) return;
                setErrorStatus(requestError.response?.status ?? null);
                setErrorChapterId(chapterId);
                setError(requestError.response?.data?.message || 'ไม่สามารถเปิดตอนนี้ได้');
            });

        return () => { active = false; };
    }, [chapterId, comicId]);

    const chapterIndex = useMemo(
        () => chapters.findIndex((item) => String(item.id) === String(chapterId)),
        [chapters, chapterId],
    );
    const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
    const nextChapter = chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;
    const chapterPath = (item) => `/comics/${comicId}/chapters/${item.id}`;

    return {
        comicId, chapterId, navigate, chapter, chapters, error, errorStatus, errorChapterId,
        previousChapter, nextChapter, chapterPath,
    };
}

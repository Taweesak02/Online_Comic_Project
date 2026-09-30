import useChapterReader from './hooks/useChapterReader';
import ChapterReaderError from './components/ChapterReaderError';
import ChapterReaderHeader from './components/ChapterReaderHeader';
import ChapterReaderImages from './components/ChapterReaderImages';
import ChapterReaderNavigation from './components/ChapterReaderNavigation';
import ChapterComments from '../../components/comics/ChapterComments';

export default function ChapterReaderPage({ isLoggedIn = false, currentUser = null }) {
    const {
        comicId, chapterId, navigate, chapter, error, errorStatus, errorChapterId, previousChapter,
        nextChapter, chapterPath,
    } = useChapterReader();

    if (error && String(errorChapterId) === String(chapterId)) {
        const isLocked = errorStatus === 401 || errorStatus === 403;
        return (
            <ChapterReaderError
                comicId={comicId}
                error={error}
                isLocked={isLocked}
                isLoggedIn={isLoggedIn}
            />
        );
    }

    if (!chapter || String(chapter.id) !== String(chapterId)) {
        return <main className="py-20 text-center text-[#666666]">กำลังเปิดตอน...</main>;
    }

    return (
        <main className="min-h-screen bg-[#f8f8f8] pb-12">
            <ChapterReaderHeader comicId={comicId} chapter={chapter} />

            <div className="mx-auto max-w-4xl py-6 sm:px-5">
                <ChapterReaderNavigation
                    position="top"
                    previousChapter={previousChapter}
                    nextChapter={nextChapter}
                    navigate={navigate}
                    chapterPath={chapterPath}
                />

                <ChapterReaderImages pages={chapter.pages} />

                <ChapterReaderNavigation
                    position="bottom"
                    previousChapter={previousChapter}
                    nextChapter={nextChapter}
                    navigate={navigate}
                    chapterPath={chapterPath}
                />

                <ChapterComments chapterId={chapterId} isLoggedIn={isLoggedIn} currentUser={currentUser} />
            </div>
        </main>
    );
}

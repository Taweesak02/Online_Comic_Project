import { Link } from 'react-router-dom';

export default function ChapterReaderNavigation({ position, previousChapter, nextChapter, navigate, chapterPath }) {
    if (position === 'top') {
        return (
            <nav className="mb-5 flex justify-center gap-3" aria-label="เปลี่ยนตอนด้านบน">
                <button
                    className="rounded-full border border-[#e2e6e6] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                    type="button"
                    disabled={!previousChapter}
                    onClick={() => previousChapter && navigate(chapterPath(previousChapter))}
                >
                    ← ตอนก่อนหน้า
                </button>
                <button
                    className="rounded-full bg-[#213f68] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    type="button"
                    disabled={!nextChapter}
                    onClick={() => nextChapter && navigate(chapterPath(nextChapter))}
                >
                    ตอนถัดไป →
                </button>
            </nav>
        );
    }

    return (
        <nav className="mt-6 flex justify-center gap-3" aria-label="เปลี่ยนตอนด้านล่าง">
            {previousChapter && (
                <Link className="rounded-full border border-[#e2e6e6] bg-white px-4 py-2 text-sm font-semibold" to={chapterPath(previousChapter)}>
                    ← ตอนก่อนหน้า
                </Link>
            )}
            {nextChapter && (
                <Link className="rounded-full bg-[#213f68] px-4 py-2 text-sm font-semibold text-white" to={chapterPath(nextChapter)}>
                    ตอนถัดไป →
                </Link>
            )}
        </nav>
    );
}

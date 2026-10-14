import { Link } from 'react-router-dom';

export default function ChapterReaderHeader({ comicId, chapter }) {
    return (
        <header className="sticky top-[72px] z-20 border-b border-[#e7e7e9] bg-white/95">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
                <Link className="text-sm font-semibold text-[#213f68]" to={`/comics/${comicId}`}>← รายละเอียด</Link>
                <h1 className="truncate text-sm font-bold text-[#0d0c22]">ตอนที่ {chapter.chapterNumber}: {chapter.title}</h1>
                <span className="text-xs text-[#666666]">{chapter.pages?.length ?? 0} หน้า</span>
            </div>
        </header>
    );
}

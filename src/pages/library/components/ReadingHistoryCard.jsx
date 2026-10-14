import { Link } from 'react-router-dom';
import { getCoverUrl } from '../../../utils/comicUtils';

const formatReadDate = (value) => {
    if (!value) return 'ไม่ทราบเวลา';
    return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export default function ReadingHistoryCard({ item }) {
    const chapter = item.chapter;
    const comic = chapter?.comic;
    const cover = getCoverUrl(comic?.coverImage);

    return (
        <article className="flex gap-4 py-5">
            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-[#dcdacc]">
                {cover ? <img className="size-full object-cover" src={cover} alt={`ปก ${comic?.title}`} /> : <span className="grid size-full place-items-center px-1 text-center text-xs text-[#666666]">ไม่มีรูปปก</span>}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#213f68]">{comic?.title || 'ไม่ทราบชื่อเรื่อง'}</p>
                <h2 className="mt-1 text-lg font-bold text-[#0d0c22]">ตอนที่ {chapter?.chapterNumber}: {chapter?.title}</h2>
                <p className="mt-2 text-xs text-[#666666]">อ่านล่าสุด {formatReadDate(item.lastReadAt)}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link className="rounded-full bg-[#213f68] px-4 py-2 text-xs font-semibold text-white" to={`/comics/${comic?.id}/chapters/${chapter?.id}`}>อ่านต่อ →</Link>
                    <Link className="rounded-full border border-[#e2e6e6] px-4 py-2 text-xs font-semibold text-[#0d0c22]" to={`/comics/${comic?.id}`}>รายละเอียดเรื่อง</Link>
                </div>
            </div>
        </article>
    );
}

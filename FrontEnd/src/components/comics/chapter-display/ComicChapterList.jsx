import { useEffect, useState } from 'react';
import { getUnlockedChapters } from '../../../api/comicReaderApi';
import ChapterList from './ChapterList';

export default function ComicChapterList ({ comicId, chapters = [], isLoggedIn = false, onBalanceChange }) {
    const [purchases, setPurchases] = useState(null);

    useEffect(() => {
        let active = true;
        if (isLoggedIn) {
            getUnlockedChapters(comicId)
                .then((items) => {
                    if (active) setPurchases({ comicId, ids: new Set(items.map((item) => String(item.id))) });
                })
                .catch(() => {
                    if (active) setPurchases({ comicId, ids: new Set(), error: true });
                });
        }
        return () => { active = false; };
    }, [comicId, isLoggedIn]);

    const currentPurchases = isLoggedIn && purchases?.comicId === comicId ? purchases : null;

    return (
        <section className="mt-8 rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0d0c22]">ตอนทั้งหมด</h2>
                <span className="rounded-full bg-[#213f68]/10 px-3 py-1 text-sm font-semibold text-[#213f68]">
                    {chapters.length} ตอน
                </span>
            </div>

            {currentPurchases?.error && <p className="mt-3 text-sm text-red-700" role="alert">ไม่สามารถโหลดสถานะตอนที่ซื้อแล้วได้ กรุณาลองโหลดหน้าใหม่</p>}
            <div className="mt-3 p-2 overflow-scroll max-h-100 scrollbar-none">
                {chapters.length 
                    ? chapters.map((chapter) => (
                        <ChapterList
                            key={chapter.id}
                            comicId={comicId}
                            chapterId={chapter.id}
                            chapterNumber={chapter.chapterNumber}
                            title={chapter.title}
                            coinCost={chapter.coinCost}
                            isPurchased={currentPurchases?.ids.has(String(chapter.id)) ?? false}
                            isLoggedIn={isLoggedIn}
                            onBalanceChange={onBalanceChange}
                        />))
                    : <p className="py-10 text-center text-[#666666]">ยังไม่มีตอนให้อ่าน</p>
                }
            </div>
        </section>
    )
};

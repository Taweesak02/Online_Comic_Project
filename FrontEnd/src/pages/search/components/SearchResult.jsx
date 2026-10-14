import { toComicCard } from '../../../components/comics/comicCardUtils';
import ComicCard from '../../../components/comics/ComicCard';

export default function SearchResult({ results = [], isLoading = false }) {
    if (isLoading) {
        return <div className="py-8 text-center text-sm text-slate-500">กำลังค้นหาการ์ตูน...</div>;
    }

    const comics = results.map((comic, index) => toComicCard(comic, index));

    if (comics.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm text-slate-500">
                ไม่พบผลการค้นหา
            </div>
        );
    }

    return (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {comics.map((comic) => (
                <ComicCard key={comic.id} comic={comic} />
            ))}
        </div>
    );
}

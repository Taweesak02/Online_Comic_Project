import ComicDetailOverview from './components/ComicDetailOverview';
import { Link } from 'react-router-dom';
import useComicDetail from './hooks/useComicDetail';
import ComicChapterList from '../../components/comics/chapter-display/ComicChapterList';
import ComicRating from '../../components/comics/ComicRating';

export default function ComicDetailPage({ isLoggedIn = false, onBalanceChange }) {
    const { comicId, comic, error, refreshRating, updateFavoriteCount, updateFollowerCount } = useComicDetail();

    if (error)
        return <main className="mx-auto max-w-6xl px-5 py-12"><p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p></main>;
    if (!comic)
        return <main className="py-20 text-center text-[#666666]">กำลังโหลดรายละเอียดการ์ตูน...</main>;

    return (
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
            <Link className="text-sm font-semibold text-[#213f68] hover:underline" to="/comics">
                ← กลับไปค้นหาการ์ตูน
            </Link>
            <ComicDetailOverview
                comicId={comicId}
                comic={comic}
                isLoggedIn={isLoggedIn}
                updateFavoriteCount={updateFavoriteCount}
                updateFollowerCount={updateFollowerCount}
            />
            <ComicRating comicId={comicId} isLoggedIn={isLoggedIn} onRated={refreshRating} />
            <ComicChapterList comicId={comicId} chapters={comic.chapters} isLoggedIn={isLoggedIn} onBalanceChange={onBalanceChange} />
        </main>
    );
}

import { Link } from 'react-router-dom';
import ComicCard from '../../../components/comics/ComicCard';

export default function SavedComicResults({ state, favorites, onRetry }) {
    const { loading, error, comics } = state;

    if (loading) {
        return <output className="block py-12 text-center text-slate-600">กำลังโหลด...</output>;
    }

    if (error) {
        return (
            <div className="mt-6 rounded-xl bg-red-50 p-4">
                <p role="alert" className="text-red-700">{error}</p>
                <button type="button"
                    className="mt-3 rounded-lg bg-[#213f68] px-4 py-2 text-white"
                    onClick={onRetry}
                >
                    ลองอีกครั้ง
                </button>
            </div>
        );
    }

    if (comics.length === 0) {
        return (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <p className="text-slate-600">
                    {favorites ? 'ยังไม่มีการ์ตูนที่ชื่นชอบ' : 'ยังไม่มีการ์ตูนที่ติดตาม'}
                </p>
                <Link to="/comics" className="mt-4 inline-block font-semibold text-[#213f68] hover:underline">
                    ค้นหาการ์ตูน
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {comics.map((comic) => <ComicCard key={comic.id} comic={comic} />)}
        </div>
    );
}

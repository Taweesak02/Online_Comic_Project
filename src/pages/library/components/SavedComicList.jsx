import useSavedComics from '../hooks/useSavedComics';
import SavedComicResults from './SavedComicResults';

export default function SavedComicList({ kind }) {
    const { state, setState, setAttempt, favorites } = useSavedComics(kind);

    const handleRetry = () => {
        setState({ loading: true, comics: [], error: '' });
        setAttempt((value) => value + 1);
    };

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
            <h1 className="text-2xl font-bold text-[#213f68]">
                {favorites ? 'การ์ตูนที่ชื่นชอบ' : 'การ์ตูนที่ติดตาม'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
                {favorites ? 'รวมการ์ตูนที่คุณเพิ่มในรายการโปรด' : 'กลับมาอ่านผลงานที่คุณติดตาม'} · เรียงจากรายการที่เพิ่มล่าสุด
            </p>
            <SavedComicResults state={state} favorites={favorites} onRetry={handleRetry} />
        </main>
    );
}

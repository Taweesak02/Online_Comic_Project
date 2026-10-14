import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyComicRating, rateComic } from '../../api/comicReaderApi';

export default function ComicRating({ comicId, isLoggedIn, onRated }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) return;

        let active = true;
        getMyComicRating(comicId)
            .then((result) => active && setRating(result?.rating ?? 0))
            .catch((requestError) => {
                if (active && requestError.response?.status !== 404) {
                    setError(requestError.response?.data?.message || 'ไม่สามารถโหลดคะแนนของคุณได้');
                }
            });
        return () => { active = false; };
    }, [comicId, isLoggedIn]);

    const submitRating = async (value) => {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await rateComic(comicId, value);
            setRating(value);
            setMessage('บันทึกคะแนนของคุณแล้ว');
            await onRated?.();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถบันทึกคะแนนได้');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="mt-8 rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:p-8" aria-labelledby="comic-rating-title">
            <h2 className="text-xl font-bold text-[#0d0c22]" id="comic-rating-title">ให้คะแนนการ์ตูนเรื่องนี้</h2>
            {isLoggedIn ? (
                <>
                    <p className="mt-1 text-sm text-[#666666]">เลือกคะแนนตั้งแต่ 1 ถึง 5 ดาว</p>
                    <div className="mt-4 flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                className={`text-4xl transition hover:scale-110 disabled:cursor-wait ${value <= (hoveredRating || rating) ? 'text-amber-400' : 'text-[#dcdacc]'}`}
                                type="button"
                                key={value}
                                disabled={saving}
                                onClick={() => submitRating(value)}
                                onMouseEnter={() => setHoveredRating(value)}
                                aria-label={`ให้ ${value} คะแนน`}
                                aria-pressed={rating === value}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    {message && <output className="block mt-3 text-sm text-emerald-700">{message}</output>}
                    {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
                </>
            ) : (
                <p className="mt-3 text-sm text-[#666666]">
                    กรุณา <Link className="font-semibold text-[#213f68] hover:underline" to="/login">เข้าสู่ระบบ</Link> ก่อนให้คะแนน
                </p>
            )}
        </section>
    );
}

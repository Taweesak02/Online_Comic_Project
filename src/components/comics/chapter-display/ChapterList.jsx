import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getChapterContent, unlockChapter } from '../../../api/comicReaderApi';
import { getWallet } from '../../../api/coinPurchaseApi';

export default function ChapterList({ comicId, chapterId, chapterNumber, title, coinCost, isPurchased = false, isLoggedIn, onBalanceChange }) {
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  const path = `/comics/${comicId}/chapters/${chapterId}`;
  const isPaid = Number(coinCost) > 0;

  const openPaidChapter = async () => {
    setError('');

    if (!isLoggedIn) {
      navigate('/login', { state: { from: path } });
      return;
    }

    setOpening(true);
    try {
      // Already-unlocked chapters can be opened without charging again.
      const content = await getChapterContent(chapterId);
      navigate(path, { state: { chapter: content } });
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status !== 403) {
        setError(requestError.response?.data?.message || 'ไม่สามารถตรวจสอบตอนนี้ได้');
        return;
      }

      if (!window.confirm(`ใช้ ${coinCost} เหรียญเพื่อปลดล็อกตอนนี้หรือไม่?`)) return;

      try {
        await unlockChapter(chapterId);
        const wallet = await getWallet();
        onBalanceChange?.(wallet?.balance ?? 0);
        navigate(path);
      } catch (unlockError) {
        if (unlockError.response?.status === 402) {
          setError('เหรียญไม่เพียงพอ กรุณาซื้อเหรียญเพิ่ม');
        } else if (unlockError.response?.status === 409) {
          navigate(path);
        } else {
          setError(unlockError.response?.data?.message || 'ไม่สามารถปลดล็อกตอนนี้ได้');
        }
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <div>
        {isPaid && !isPurchased ? (
          <button className="flex w-full items-center justify-between rounded-2xl p-5 py-4 text-left transition hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60" type="button" onClick={openPaidChapter} disabled={opening}>
            <div>
                <h3 className="font-bold text-[#0d0c22]">
                    ตอนที่ {chapterNumber}: {title}
                </h3>
                <p className="mt-1 text-sm text-[#666666]">
                    {coinCost ? `${coinCost} เหรียญ` : 'อ่านฟรี'}
                </p>
            </div>
            <span className="shrink-0 text-[#213f68]">{opening ? 'กำลังตรวจสอบ...' : '🔒 ปลดล็อก'}</span>
          </button>
        ) : (
          <Link className="flex items-center justify-between rounded-2xl p-5 py-4 transition hover:bg-gray-200" to={path}>
            <div>
              <h3 className="font-bold text-[#0d0c22]">ตอนที่ {chapterNumber}: {title}</h3>
              {isPurchased ? (
                <span className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">✓ ซื้อแล้ว</span>
              ) : (
                <p className="mt-1 text-sm text-[#666666]">อ่านฟรี</p>
              )}
            </div>
            <span className="text-[#213f68]">อ่าน →</span>
          </Link>
        )}
        {error && <p className="px-5 pb-3 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  )
}

import { Link } from 'react-router-dom';
import ReadingHistoryCard from './ReadingHistoryCard';

export default function ReadingHistoryList({ history, loading }) {
    if (loading) {
        return <p className="py-16 text-center text-[#666666]">กำลังโหลดประวัติการอ่าน...</p>;
    }

    if (history.length === 0) {
        return (
            <section className="mt-7 rounded-4xl border border-dashed border-[#dcdacc] bg-white px-5 py-16 text-center">
                <h2 className="font-bold text-[#0d0c22]">ยังไม่มีประวัติการอ่าน</h2>
                <p className="mt-1 text-sm text-[#666666]">เมื่อคุณเปิดอ่านตอนการ์ตูน รายการจะปรากฏที่นี่</p>
                <Link className="mt-5 inline-block rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white" to="/comics">ค้นหาการ์ตูน</Link>
            </section>
        );
    }

    return (
        <section className="mt-7 divide-y divide-[#e7e7e9] rounded-4xl border border-[#e7e7e9] bg-white px-5 shadow-[0_12px_35px_rgba(27,32,50,0.07)] sm:px-7" aria-label="รายการประวัติการอ่าน">
            {history.map((item) => (
                <ReadingHistoryCard
                    key={item.id ?? `${item.chapter?.id}-${item.lastReadAt}`}
                    item={item}
                />
            ))}
        </section>
    );
}

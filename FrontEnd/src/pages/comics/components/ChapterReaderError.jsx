import { Link } from 'react-router-dom';

export default function ChapterReaderError({ comicId, error, isLocked, isLoggedIn }) {
    return (
        <main className="mx-auto max-w-4xl px-5 py-12">
            <Link className="text-[#213f68]" to={`/comics/${comicId}`}>← กลับหน้ารายละเอียด</Link>
            <section className="mt-5 rounded-2xl border border-[#e7e7e9] bg-white p-8 text-center shadow-sm">
                <div className="text-4xl" aria-hidden="true">🔒</div>
                <h1 className="mt-3 text-xl font-bold text-[#0d0c22]">
                    {isLocked ? 'ยังไม่สามารถอ่านตอนนี้ได้' : 'ไม่สามารถเปิดตอนนี้ได้'}
                </h1>
                <p className="mt-2 text-sm text-[#666666]">
                    {isLocked ? 'กรุณาเข้าสู่ระบบและใช้เหรียญปลดล็อกตอนก่อนอ่านเนื้อหา' : error}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {!isLoggedIn && isLocked && (
                        <Link className="rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white" to="/login">
                            เข้าสู่ระบบ
                        </Link>
                    )}
                    <Link className="rounded-full border border-[#e2e6e6] px-5 py-2.5 text-sm font-semibold text-[#213f68]" to={`/comics/${comicId}`}>
                        ไปหน้ารายละเอียดเพื่อปลดล็อก
                    </Link>
                </div>
            </section>
        </main>
    );
}

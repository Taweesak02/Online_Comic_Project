import HomeRanking from './components/HomeRanking';

export default function HomePage() {
    return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-xl bg-slate-900 shadow-sm" aria-label="แบนเนอร์แนะนำ">
            <img
                className="h-48 w-full object-cover sm:h-64"
                src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80"
                alt="ภาพแบนเนอร์แนะนำการ์ตูน"
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950/75 via-slate-950/25 to-transparent" />
            <div className="absolute inset-0 flex max-w-xl flex-col justify-center p-6 text-white sm:p-10">
                <p className="text-sm font-medium text-[#d8f0bc]">อ่านได้ทุกที่ ทุกเวลา</p>
                <h1 className="mt-1 text-2xl font-bold sm:text-4xl">พบกับการ์ตูนเรื่องใหม่ที่คุณชื่นชอบ</h1>
                <p className="mt-3 text-sm text-white/85 sm:text-base">เลือกอ่านเรื่องที่กำลังได้รับความนิยม หรือสำรวจการ์ตูนคะแนนสูงจากผู้อ่าน</p>
            </div>
        </section>

        <div className="mt-8 space-y-8">
            <HomeRanking title="การ์ตูนที่ถูกอ่านมากสุด" ranking="mostViewed" />
            <HomeRanking title="การ์ตูนที่ได้รับคะแนนสูงสุด" ranking="topRated" />
            <HomeRanking title="การ์ตูนที่ได้รับความชื่นชอบมากสุด" ranking="mostFavorite" />
            <HomeRanking title="การ์ตูนที่มีผู้ติดตามมากสุด" ranking="mostFollowed" />
        </div>
    </main>
    );
}

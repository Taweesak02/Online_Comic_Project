const formatStat = (stat) => {
    if (stat.value == null) return '—';
    if (stat.rating) return Number(stat.value).toFixed(1);
    return Number(stat.value).toLocaleString('th-TH');
};

export default function ComicDashboard({ comics, overview, overviewError, onRetry, onChange }) {
    const stats = [
        { label: 'การ์ตูนทั้งหมด', value: overview?.totalComics },
        { label: 'ตอนทั้งหมด', value: overview?.totalChapters },
        { label: 'ยอดเข้าชม', value: overview?.totalViews },
        { label: 'คะแนนเฉลี่ย', value: overview?.averageRating, rating: true },
        { label: 'จำนวนการให้คะแนน', value: overview?.totalRatings },
        { label: 'รายการโปรด', value: overview?.totalFavorites },
        { label: 'ผู้ติดตาม', value: overview?.totalFollowers },
    ];
    const statusCards = [
        { label: 'อนุมัติแล้ว', value: overview?.approval?.approved, section: 'comics' },
        { label: 'ยังไม่อนุมัติ', value: overview?.approval?.unapproved, section: 'review' },
        { label: 'ส่งตรวจใหม่', value: overview?.approval?.resubmit, section: 'review' },
        { label: 'ปิดใช้งานแล้ว', value: overview?.approval?.inactive, section: 'inactive' },
    ];
    return <section aria-labelledby="creator-dashboard-title">
        <p className="text-sm font-semibold text-[#213f68]">DASHBOARD</p>
        <h2 id="creator-dashboard-title" className="mt-1 text-2xl font-bold text-[#0d0c22]">ภาพรวมผลงาน</h2>
        <p className="mt-2 text-sm text-[#666666]">ติดตามสถานะการ์ตูนและเลือกสิ่งที่ต้องการจัดการ</p>
        {overviewError && <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{overviewError} <button type="button" className="ml-2 font-semibold underline" onClick={onRetry}>ลองอีกครั้ง</button></div>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-[#e7e7e9] bg-white p-5">
                <span className="text-sm text-[#666666]">{stat.label}</span>
                <strong className="mt-3 block text-3xl text-[#213f68]">{formatStat(stat)}</strong>
            </div>)}
        </div>
        <h3 className="mt-8 text-lg font-bold text-[#0d0c22]">สถานะการ์ตูน</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statusCards.map((card) => <button key={card.label} type="button" onClick={() => onChange(card.section)} className="rounded-2xl border border-[#e7e7e9] bg-white p-5 text-left transition hover:border-[#213f68]/40 hover:bg-[#f5f8ff]">
                <span className="text-sm text-[#666666]">{card.label}</span>
                <strong className="mt-3 block text-3xl text-[#213f68]">{card.value}</strong>
                <span className="mt-4 block text-xs font-semibold text-[#213f68]">ดูรายการ →</span>
            </button>)}
        </div>
        <h3 className="mt-8 text-lg font-bold text-[#0d0c22]">สถานะการเผยแพร่</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
                ['กำลังเผยแพร่', overview?.status?.ongoing],
                ['จบแล้ว', overview?.status?.completed],
                ['พักการเผยแพร่', overview?.status?.hiatus],
                ['ยกเลิก', overview?.status?.cancelled],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#e7e7e9] bg-white p-5">
                <span className="text-sm text-[#666666]">{label}</span>
                <strong className="mt-3 block text-3xl text-[#213f68]">{value == null ? '—' : Number(value).toLocaleString('th-TH')}</strong>
            </div>)}
        </div>
        <h3 className="mt-8 text-lg font-bold text-[#0d0c22]">สถิติช่วงเวลา</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
                ['ตอนใหม่สัปดาห์นี้', overview?.period?.newChaptersThisWeek],
                ['ยอดเข้าชมสัปดาห์นี้', overview?.period?.viewsThisWeek],
                ['ยอดเข้าชมเดือนนี้', overview?.period?.viewsThisMonth],
                ['ผู้ติดตามใหม่สัปดาห์นี้', overview?.period?.newFollowersThisWeek],
                ['รายการโปรดใหม่สัปดาห์นี้', overview?.period?.newFavoritesThisWeek],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#e7e7e9] bg-white p-5">
                <span className="text-sm text-[#666666]">{label}</span>
                <strong className="mt-3 block text-3xl text-[#213f68]">{value == null ? '—' : Number(value).toLocaleString('th-TH')}</strong>
            </div>)}
        </div>
        <h3 className="mt-8 text-lg font-bold text-[#0d0c22]">การ์ตูนยอดเข้าชมสูงสุด</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e7e7e9] bg-white">
            {(overview?.topComicsByViews ?? []).length ? <ol className="divide-y divide-[#eeeeee]">
                {overview.topComicsByViews.map((comic, index) => <li key={comic.id ?? `${comic.title}-${index}`} className="flex items-center justify-between gap-4 p-4">
                    <span className="min-w-0 truncate text-sm font-medium text-[#213f68]">{index + 1}. {comic.title ?? `การ์ตูน ${comic.id}`}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-[#555555]">{Number(comic.viewCount ?? 0).toLocaleString('th-TH')} วิว</span>
                </li>)}
            </ol> : <p className="p-4 text-sm text-[#666666]">ยังไม่มีข้อมูลการเข้าชม</p>}
        </div>

    </section>;
}

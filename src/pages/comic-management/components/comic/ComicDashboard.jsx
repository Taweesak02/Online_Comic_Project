const formatStat = (stat) => {
    if (stat.value == null) return '—';
    if (stat.rating) return Number(stat.value).toFixed(1);
    return Number(stat.value).toLocaleString('th-TH');
};

export default function ComicDashboard({ comics, overview, overviewError, onRetry, onChange }) {
    const active = comics.filter((comic) => comic.isActive !== false);
    const review = active.filter((comic) => ['UNAPPROVED', 'RESUBMIT'].includes(comic.approved));
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
        { label: 'อนุมัติและเปิดใช้งาน', value: active.filter((comic) => comic.approved === 'APPROVED').length, section: 'comics' },
        { label: 'อยู่ระหว่างการพิจารณา', value: review.length, section: 'review' },
        { label: 'ปิดใช้งานแล้ว', value: comics.length - active.length, section: 'inactive' },
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

    </section>;
}

const numberFormatter = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });

const formatValue = (value, currency = false) => {
    if (value === undefined || value === null || value === '') return '—';
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '—';
    return (currency ? currencyFormatter : numberFormatter).format(numericValue);
};

function MetricList({ title, description, items }) {
    return (
        <article className="rounded-2xl border border-[#e7e7e9] bg-white p-5 sm:p-6">
            <h3 className="text-lg font-bold text-[#213f68]">{title}</h3>
            <p className="mt-1 text-sm text-[#666666]">{description}</p>
            <dl className="mt-4 divide-y divide-[#eeeeee]">
                {items.map(({ label, value, tone = 'text-[#213f68]', currency = false }) => (
                    <div className="flex flex-wrap items-center justify-between gap-2 py-3" key={label}>
                        <dt className="text-sm text-[#666666]">{label}</dt>
                        <dd className={`text-lg font-bold tabular-nums ${tone}`}>{formatValue(value, currency)}</dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}

function BarChart({ title, description, items, currency = false }) {
    const values = items.map(({ value }) => Number(value)).filter(Number.isFinite);
    const maxValue = Math.max(...values, 0);
    const hasValues = values.length > 0;

    return (
        <article className="rounded-2xl border border-[#e7e7e9] bg-white p-5 sm:p-6">
            <h3 className="text-lg font-bold text-[#213f68]">{title}</h3>
            <p className="mt-1 text-sm text-[#666666]">{description}</p>
            <div className="mt-5 space-y-4" role="img" aria-label={`${title}: ${items.map(({ label, value }) => `${label} ${formatValue(value, currency)}`).join(', ')}`}>
                {items.map(({ label, value, color = 'bg-[#4c78a8]' }) => {
                    const numericValue = Number(value);
                    const width = Number.isFinite(numericValue) && maxValue > 0 ? Math.max((numericValue / maxValue) * 100, numericValue > 0 ? 2 : 0) : 0;
                    return (
                        <div key={label}>
                            <div className="mb-1.5 flex justify-between gap-3 text-sm">
                                <span className="text-[#555555]">{label}</span>
                                <span className="font-semibold tabular-nums text-[#213f68]">{formatValue(value, currency)}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#f0f2f5]" aria-hidden="true">
                                <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {!hasValues && <p className="mt-3 text-xs text-[#777777]">ยังไม่มีข้อมูลสถิติ</p>}
        </article>
    );
}

export default function AdminDashboard({ data }) {
    const users = data?.users ?? {};
    const content = data?.content ?? {};
    const engagement = data?.engagement ?? {};
    const commerce = data?.commerce ?? {};
    const cards = [
        { label: 'ผู้ใช้ทั้งหมด', value: users.total, detail: 'บัญชีผู้ใช้ทุกสถานะ' },
        { label: 'การ์ตูนทั้งหมด', value: content.totalAll ?? content.totalComics, detail: 'รวมทุกสถานะการอนุมัติ' },
        { label: 'การ์ตูนที่อนุมัติ', value: content.approved ?? content.totalComics, detail: 'การ์ตูนที่ผ่านการอนุมัติแล้ว' },
        { label: 'ตอนทั้งหมด', value: content.totalChapters, detail: 'จำนวนตอนในระบบ' },
        { label: 'รายได้รวม', value: commerce.totalRevenue, currency: true, detail: 'จากการชำระเงินที่สำเร็จ' },
    ];

    return (
        <section aria-labelledby="dashboard-title">
            <p className="text-sm font-semibold text-[#213f68]">OVERVIEW</p>
            <h2 id="dashboard-title" className="mt-1 text-2xl font-bold">แดชบอร์ด</h2>
            <p className="mt-1 text-sm text-[#666666]">ภาพรวมผู้ใช้ เนื้อหา การมีส่วนร่วม และการชำระเงินของระบบ</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ label, value, currency, detail }) => (
                    <article className="min-w-0 rounded-2xl border border-[#e7e7e9] bg-white p-5" key={label}>
                        <h3 className="text-sm font-semibold text-[#666666]">{label}</h3>
                        <p className="mt-3 break-words text-3xl font-bold tabular-nums text-[#213f68]">{formatValue(value, currency)}</p>
                        <p className="mt-2 text-xs text-[#666666]">{detail}</p>
                    </article>
                ))}
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <BarChart title="การมีส่วนร่วม" description="ยอดสะสมและยอดเข้าชมในช่วงเวลาล่าสุด" items={[
                    { label: 'ยอดเข้าชม', value: engagement.totalViews, color: 'bg-[#4c78a8]' },
                    { label: 'ยอดเข้าชมวันนี้', value: engagement.viewsToday, color: 'bg-[#72a0c1]' },
                    { label: 'ยอดเข้าชมสัปดาห์นี้', value: engagement.viewsThisWeek, color: 'bg-[#61a889]' },
                    { label: 'รายการให้คะแนน', value: engagement.totalRatings, color: 'bg-[#f2a541]' },
                    { label: 'ความคิดเห็น', value: engagement.totalComments, color: 'bg-[#72a0c1]' },
                    { label: 'รายการโปรด', value: engagement.totalFavorites, color: 'bg-[#df6b67]' },
                    { label: 'การติดตาม', value: engagement.totalFollows, color: 'bg-[#61a889]' },
                ]} />
                <BarChart title="ธุรกรรมการชำระเงิน" description="จำนวนธุรกรรมแยกตามสถานะ" items={[
                    { label: 'ชำระเงินสำเร็จ', value: commerce.totalCompletedPayments, color: 'bg-emerald-500' },
                    { label: 'รอชำระเงิน', value: commerce.pendingPayments, color: 'bg-amber-400' },
                    { label: 'ชำระเงินไม่สำเร็จ', value: commerce.failedPayments, color: 'bg-red-400' },
                    { label: 'คืนเงินแล้ว', value: commerce.refundedPayments, color: 'bg-violet-400' },
                ]} />
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <MetricList title="สถานะผู้ใช้" description="จำนวนบัญชีตามสถานะ และผู้สมัครใหม่วันนี้" items={[
                    { label: 'บัญชีที่ใช้งานได้', value: users.active, tone: 'text-emerald-700' },
                    { label: 'บัญชีที่ถูกระงับ', value: users.banned, tone: 'text-red-700' },
                    { label: 'ผู้สมัครใหม่วันนี้', value: users.newToday },
                    { label: 'ผู้สมัครใหม่สัปดาห์นี้', value: users.newThisWeek },
                    { label: 'ผู้สมัครใหม่เดือนนี้', value: users.newThisMonth },
                ]} />
                <MetricList title="สถานะการ์ตูน" description="จำนวนการ์ตูนแยกตามสถานะการเผยแพร่" items={[
                    { label: 'กำลังเผยแพร่', value: content.byStatus?.ongoing },
                    { label: 'จบแล้ว', value: content.byStatus?.completed },
                    { label: 'พักการเผยแพร่', value: content.byStatus?.hiatus },
                    { label: 'ยกเลิก', value: content.byStatus?.cancelled },
                ]} />
                <MetricList title="สถานะการอนุมัติ" description="จำนวนการ์ตูนตามขั้นตอนการตรวจสอบ" items={[
                    { label: 'อนุมัติแล้ว', value: content.approved ?? content.totalComics, tone: 'text-emerald-700' },
                    { label: 'ยังไม่อนุมัติ', value: content.unapproved, tone: 'text-amber-700' },
                    { label: 'ส่งตรวจใหม่', value: content.resubmit, tone: 'text-blue-700' },
                    { label: 'ปิดใช้งาน', value: content.inactive, tone: 'text-red-700' },
                ]} />
                <MetricList title="การมีส่วนร่วม" description="ยอดรวมการอ่านและปฏิสัมพันธ์กับเนื้อหา" items={[
                    { label: 'ยอดเข้าชมทั้งหมด', value: engagement.totalViews },
                    { label: 'รายการให้คะแนน', value: engagement.totalRatings },
                    { label: 'ความคิดเห็น', value: engagement.totalComments },
                    { label: 'รายการโปรด', value: engagement.totalFavorites },
                    { label: 'การติดตาม', value: engagement.totalFollows },
                ]} />
                <MetricList title="สถานะการชำระเงิน" description="จำนวนธุรกรรมแยกตามสถานะการชำระเงิน" items={[
                    { label: 'ชำระเงินสำเร็จ', value: commerce.totalCompletedPayments, tone: 'text-emerald-700' },
                    { label: 'รอชำระเงิน', value: commerce.pendingPayments, tone: 'text-amber-700' },
                    { label: 'ชำระเงินไม่สำเร็จ', value: commerce.failedPayments, tone: 'text-red-700' },
                    { label: 'คืนเงินแล้ว', value: commerce.refundedPayments, tone: 'text-violet-700' },
                    { label: 'รายได้วันนี้', value: commerce.revenueToday, currency: true },
                    { label: 'รายได้เดือนนี้', value: commerce.revenueThisMonth, currency: true },
                    { label: 'ยอดคืนเงิน', value: commerce.refundedRevenue, currency: true, tone: 'text-red-700' },
                ]} />
                <MetricList title="รายได้และเหรียญ" description="รายได้จากธุรกรรมสำเร็จ และยอดเหรียญที่ใช้สะสม" items={[
                    { label: 'รายได้รวม (บาท)', value: commerce.totalRevenue, currency: true },
                    { label: 'เหรียญที่ใช้ทั้งหมด', value: commerce.totalCoinsSpent },
                ]} />
            </div>
            <div className="mt-6">
                <MetricList title="การ์ตูนยอดเข้าชมสูงสุด" description="จัดอันดับตามยอดเข้าชมสะสม" items={(engagement.topComicsByViews ?? []).map((comic, index) => ({
                    label: `${index + 1}. ${comic.title ?? `การ์ตูน ${comic.id}`}`,
                    value: comic.viewCount,
                }))} />
            </div>
            <p className="mt-4 text-xs text-[#666666]">ข้อมูลเป็นยอดสะสม ยกเว้นผู้สมัครใหม่วันนี้ซึ่งอ้างอิงวันของระบบ • — หมายถึงไม่มีข้อมูล</p>
        </section>
    );
}

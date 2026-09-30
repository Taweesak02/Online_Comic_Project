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

export default function AdminDashboard({ data }) {
    const users = data?.users ?? {};
    const content = data?.content ?? {};
    const engagement = data?.engagement ?? {};
    const commerce = data?.commerce ?? {};
    const cards = [
        { label: 'ผู้ใช้ทั้งหมด', value: users.total, detail: 'บัญชีผู้ใช้ทุกสถานะ' },
        { label: 'การ์ตูนที่อนุมัติ', value: content.totalComics, detail: 'การ์ตูนที่ผ่านการอนุมัติแล้ว' },
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
                <MetricList title="สถานะผู้ใช้" description="จำนวนบัญชีตามสถานะ และผู้สมัครใหม่วันนี้" items={[
                    { label: 'บัญชีที่ใช้งานได้', value: users.active, tone: 'text-emerald-700' },
                    { label: 'บัญชีที่ถูกระงับ', value: users.banned, tone: 'text-red-700' },
                    { label: 'ผู้สมัครใหม่วันนี้', value: users.newToday },
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
                ]} />
                <MetricList title="รายได้และเหรียญ" description="รายได้จากธุรกรรมสำเร็จ และยอดเหรียญที่ใช้สะสม" items={[
                    { label: 'รายได้รวม (บาท)', value: commerce.totalRevenue, currency: true },
                    { label: 'เหรียญที่ใช้ทั้งหมด', value: commerce.totalCoinsSpent },
                ]} />
            </div>
            <p className="mt-4 text-xs text-[#666666]">ข้อมูลเป็นยอดสะสม ยกเว้นผู้สมัครใหม่วันนี้ซึ่งอ้างอิงวันของระบบ • — หมายถึงไม่มีข้อมูล</p>
        </section>
    );
}

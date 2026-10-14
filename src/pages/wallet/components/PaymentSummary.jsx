import { formatPrice } from '../utils/formatters';

export default function PaymentSummary({ coinPackage, payment, paying, paymentMethodId }) {
    const getPaymentLabel = () => {
        if (paying) {
            return 'กำลังสร้าง QR Code...';
        }
        if (payment) {
            return 'สร้างรายการชำระเงินแล้ว';
        }
        return 'สร้าง QR Code เพื่อชำระเงิน';
    };

    return (
        <aside className="h-fit rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_12px_35px_rgba(27,32,50,0.07)] sm:p-6">
            <h2 className="font-bold text-[#0d0c22]">สรุปคำสั่งซื้อ</h2>
            <div className="mt-5 rounded-2xl bg-[#f5f8ff] p-4">
                <p className="text-sm text-[#666666]">{coinPackage.name}</p>
                <strong className="mt-2 block text-2xl text-[#213f68]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                        <path d="M0 0h16v16H0z" fill="none" />
                        <g fill="currentColor">
                            <path d="M8 3a5 5 0 1 1 0 10A5 5 0 0 1 8 3M7 5v6h2V5z" />
                            <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1m0 1a6 6 0 1 0 0 12A6 6 0 0 0 8 2" />
                        </g>
                    </svg>
                    {coinPackage.coinAmount} เหรียญ
                </strong>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#e7e7e9] pt-5">
                <span className="font-semibold text-[#666666]">ยอดชำระ</span>
                <strong className="text-xl text-[#0d0c22]">{formatPrice(payment?.amount ?? coinPackage.price)}</strong>
            </div>
            <button className="mt-5 w-full rounded-full bg-[#59923E] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={paying || !paymentMethodId || !!payment}>
                {getPaymentLabel()}
            </button>
        </aside>
    );
}

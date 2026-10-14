import { formatPrice } from '../utils/formatters';

export default function PaymentVerification({ payment, slip, checking, cancelling, statusMessage, onSlipChange, onCheckPayment, onCancelPayment }) {
    const pending = !payment.paymentStatus || payment.paymentStatus === 'PENDING';
    const busy = checking || cancelling;
    return (
        <div className="mt-6 border-t border-[#e7e7e9] pt-6">
            <h3 className="text-lg font-bold">สแกน QR Code เพื่อชำระเงิน</h3>
            {payment.qrImage ? (
                <img className="mx-auto mt-4 w-64 max-w-full" src={payment.qrImage} alt="QR Code สำหรับชำระเงินแพ็กเกจที่เลือก" />
            ) : <p className="mt-4 text-red-700" role="alert">ไม่ได้รับ QR Code กรุณาตรวจสอบสถานะรายการก่อนทำรายการใหม่</p>}
            <p className="mt-3 text-center font-semibold">ยอดชำระ {formatPrice(payment.amount)}</p>
            <p className="mt-2 text-sm text-[#666666]">เลขที่รายการ: {payment.paymentTransactionId}</p>
            <output className="block mt-2 text-sm text-[#213f68]">{statusMessage}</output>
            <div className="mt-5 block text-sm font-semibold">
                <span>แนบสลิปหลังชำระเงิน</span>
                <input className="mt-2 block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#213f68] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#172f50] disabled:opacity-50" type="file" accept="image/*" disabled={busy || !pending} onChange={(event) => onSlipChange(event.target.files?.[0] ?? null)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-full bg-[#213f68] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" type="button" disabled={busy || !pending || !slip} onClick={() => onCheckPayment(true)}>ส่งสลิปยืนยันการชำระเงิน</button>
                <button className="rounded-full border border-[#213f68] px-5 py-3 text-sm font-semibold text-[#213f68] disabled:opacity-50" type="button" disabled={busy} onClick={() => onCheckPayment()}>{checking ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}</button>
                {pending && <button className="rounded-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-50" type="button" disabled={busy} onClick={onCancelPayment}>{cancelling ? 'กำลังยกเลิก...' : 'ยกเลิกการชำระเงิน'}</button>}
            </div>
        </div>
    );
}

import PaymentForm from './components/PaymentForm';
import { Link, Navigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import usePayment from './hooks/usePayment';

export default function PaymentPage({ isLoggedIn, authReady, onBalanceChange }) {
    const {
        packageId, coinPackage, paymentMethods, paymentMethodId, setPaymentMethodId,
        loading, paying, error, payment, slip, setSlip, checking, statusMessage,
        submitPayment, checkPayment, cancelling, cancelCurrentPayment,
    } = usePayment({ isLoggedIn, onBalanceChange });

    if (!authReady) return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบบัญชีผู้ใช้...</main>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    const renderPayment = () => {
        if (loading && packageId) {
            return <p className="py-16 text-center text-[#666666]">กำลังโหลดข้อมูลการชำระเงิน...</p>;
        }
        if (!packageId || !coinPackage) {
            return (
                <section className="mt-7 rounded-4xl border border-dashed border-[#dcdacc] bg-white px-5 py-14 text-center">
                    <h2 className="font-bold text-[#0d0c22]">ไม่พบแพ็กเกจที่เลือก</h2>
                    <Link className="mt-5 inline-block rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white" to="/coin-purchase">เลือกแพ็กเกจ</Link>
                </section>
            );
        }
        return (
            <PaymentForm
                coinPackage={coinPackage}
                paymentMethods={paymentMethods}
                paymentMethodId={paymentMethodId}
                setPaymentMethodId={setPaymentMethodId}
                paying={paying}
                payment={payment}
                slip={slip}
                setSlip={setSlip}
                checking={checking}
                statusMessage={statusMessage}
                submitPayment={submitPayment}
                checkPayment={checkPayment}
                cancelling={cancelling}
                cancelCurrentPayment={cancelCurrentPayment}
            />
        );
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
            <Link className="text-sm font-semibold text-[#213f68] hover:underline" to="/coin-purchase">← กลับไปเลือกแพ็กเกจ</Link>

            <PageHeader className="mt-5" title="ชำระเงิน" />

            {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
            {!payment && statusMessage && <output className="block mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</output>}

            {renderPayment()}
        </main>
    );
}

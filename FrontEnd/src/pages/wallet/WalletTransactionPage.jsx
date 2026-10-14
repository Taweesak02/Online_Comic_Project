import { Link, Navigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import WalletTransactionList from './components/WalletTransactionList';
import useWalletTransactions from './hooks/useWalletTransactions';

export default function WalletTransactionPage({ isLoggedIn, authReady }) {
    const location = useLocation();
    const { transactions, loading, error } = useWalletTransactions(isLoggedIn);

    if (!authReady) {
        return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบบัญชีผู้ใช้...</main>;
    }
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    const renderTransactions = () => {
        if (loading) {
            return <p className="py-16 text-center text-[#666666]">กำลังโหลดประวัติ Wallet...</p>;
        }
        if (transactions.length) {
            return <WalletTransactionList transactions={transactions} />;
        }
        return (
            <section className="mt-7 rounded-4xl border border-dashed border-[#dcdacc] bg-white px-5 py-16 text-center">
                <h2 className="font-bold text-[#0d0c22]">ยังไม่มีประวัติ Wallet</h2>
                <p className="mt-1 text-sm text-[#666666]">รายการซื้อหรือใช้เหรียญจะแสดงที่นี่</p>
                <Link className="mt-5 inline-block rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white" to="/coin-purchase">
                    ซื้อเหรียญ
                </Link>
            </section>
        );
    };

    return (
        <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
            <PageHeader className="mt-5" title="ประวัติ Wallet" />

            {error && (
                <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}
            {location.state?.paymentSuccess && (
                <output className="block mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {location.state.paymentSuccess}
                </output>
            )}

            {renderTransactions()}
        </main>
    );
}

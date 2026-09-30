import CoinPurchaseForm from './components/CoinPurchaseForm';
import { Link, Navigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import useCoinPurchase from './hooks/useCoinPurchase';

export default function CoinPurchasePage({ isLoggedIn, authReady }) {
    const { packages, selectedPackageId, setSelectedPackageId, selectedPackage, loading, error, submitPurchase } = useCoinPurchase(isLoggedIn);

    if (!authReady) {
        return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบบัญชีผู้ใช้...</main>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
            <Link className="text-sm font-semibold text-[#213f68] hover:underline" to="/">← กลับหน้าหลัก</Link>

            <PageHeader className="mt-5" title="ซื้อเหรียญ" />

            {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

            {loading ? (
                <p className="py-16 text-center text-[#666666]">กำลังโหลดแพ็กเกจ...</p>
            ) : (
                <CoinPurchaseForm
                    packages={packages}
                    selectedPackageId={selectedPackageId}
                    setSelectedPackageId={setSelectedPackageId}
                    selectedPackage={selectedPackage}
                    submitPurchase={submitPurchase}
                />
            )}
        </main>
    );
}

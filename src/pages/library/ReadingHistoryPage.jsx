import useReadingHistory from './hooks/useReadingHistory';
import { Navigate } from 'react-router-dom';
import ReadingHistoryList from './components/ReadingHistoryList';
import PageHeader from '../../components/ui/PageHeader';

export default function ReadingHistoryPage({ isLoggedIn, authReady }) {
    const { history, loading, error } = useReadingHistory(isLoggedIn);

    if (!authReady) return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบบัญชีผู้ใช้...</main>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return (
        <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
            <PageHeader title="ประวัติการอ่าน" />

            {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

            <ReadingHistoryList history={history} loading={loading} />
        </main>
    );
}

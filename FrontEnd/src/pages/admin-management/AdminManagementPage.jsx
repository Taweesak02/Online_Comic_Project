import items from './data/adminManagementItems';
import UserManagement from './components/UserManagement';
import ComicApprovalManagement from './components/ComicApprovalManagement';
import { Navigate } from 'react-router-dom';
import useAdminManagement from './hooks/useAdminManagement';
import AdminDashboard from './components/AdminDashboard';
import ManagementLayout from '../../components/layout/ManagementLayout';
import PackageManagement from './components/PackageManagement';
import TaxonomyManagement from './components/TaxonomyManagement';
import PaymentMethodManagement from './components/PaymentMethodManagement';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminManagementPage({ isAdmin, authReady }) {
    const {
        activeSection, changeSection, data, dashboardData, loading,
        submitting, error, message, actions, savePackage, deletePackage,
        savePaymentMethod, removePaymentMethod,
    } = useAdminManagement(isAdmin);

    if (!authReady) return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบสิทธิ์...</main>;
    if (!isAdmin) return <Navigate to="/" replace />;

    return (
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
            <PageHeader title="จัดการข้อมูลระบบ" />
            {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
            {message && <output className="block mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</output>}
            {loading ? <p className="py-16 text-center text-[#666666]">กำลังโหลดข้อมูล...</p> : (
                <ManagementLayout
                    items={items}
                    active={activeSection}
                    onChange={changeSection}
                    navLabel="เมนูจัดการระบบ"
                >
                        {activeSection === 'users' && <UserManagement />}
                        {activeSection === 'comics' && <ComicApprovalManagement />}
                        {activeSection === 'dashboard' && <AdminDashboard data={dashboardData} />}
                        {activeSection === 'taxonomy' && <TaxonomyManagement data={data} submitting={submitting} actions={actions} />}
                        {activeSection === 'packages' && <PackageManagement packages={data.packages} submitting={submitting === 'แพ็กเกจ'} onSave={savePackage} onDelete={deletePackage} />}
                        {activeSection === 'payment-methods' && <PaymentMethodManagement paymentMethods={data.paymentMethods} submitting={submitting === 'ช่องทางชำระเงิน'} onSave={savePaymentMethod} onDelete={removePaymentMethod} />}
                </ManagementLayout>
            )}
        </main>
    );
}

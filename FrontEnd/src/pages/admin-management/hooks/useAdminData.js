import { useEffect, useState } from 'react';
import { getAdminDashboardData, getAdminManagementData } from '../../../api/adminManagementApi';

export default function useAdminData(isAdmin, setError) {
    const [data, setData] = useState({ categories: [], tags: [], packages: [], paymentMethods: [] });
    const [dashboardData, setDashboardData] = useState({});
    const [loading, setLoading] = useState(true);
    const loadData = async () => {
        const [managementResult, dashboardResult] = await Promise.all([getAdminManagementData(), getAdminDashboardData()]);
        setData(managementResult);
        setDashboardData(dashboardResult);
    };

    useEffect(() => {
        if (!isAdmin) return;
        let active = true;
        Promise.all([getAdminManagementData(), getAdminDashboardData()])
            .then(([managementResult, dashboardResult]) => {
                if (!active) return;
                setData(managementResult);
                setDashboardData(dashboardResult);
            })
            .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลจัดการระบบได้'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [isAdmin, setError]);

    return { data, dashboardData, loading, loadData };
}

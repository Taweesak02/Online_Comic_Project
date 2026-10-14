import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoinPackages } from '../../../api/coinPurchaseApi';

export default function useCoinPurchase(isLoggedIn) {
    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) return;

        let active = true;
        getCoinPackages()
            .then((packageList) => {
                if (!active) return;
                setPackages(packageList);
                setSelectedPackageId(String(packageList[0]?.id ?? ''));
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลการซื้อเหรียญได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [isLoggedIn]);

    const selectedPackage = packages.find((item) => String(item.id) === selectedPackageId);

    const submitPurchase = (event) => {
        event.preventDefault();
        if (!selectedPackageId || !selectedPackage) return;
        navigate(`/payment?packageId=${encodeURIComponent(selectedPackageId)}`);
    };

    return { packages, selectedPackageId, setSelectedPackageId, selectedPackage, loading, error, submitPurchase };
}

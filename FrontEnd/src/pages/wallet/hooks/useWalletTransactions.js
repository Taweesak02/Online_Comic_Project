import { useEffect, useState } from 'react';
import { getWalletTransactions } from '../../../api/coinPurchaseApi';

export default function useWalletTransactions(isLoggedIn) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) return;

        let active = true;
        getWalletTransactions()
            .then((result) => {
                if (!active) return;
                setTransactions(result);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดประวัติ Wallet ได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [isLoggedIn]);

    return { transactions, loading, error };
}

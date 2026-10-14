import { useEffect, useState } from 'react';
import { getReadingHistory } from '../../../api/historyApi';

export default function useReadingHistory(isLoggedIn) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) return;
        let active = true;
        getReadingHistory()
            .then((result) => {
                if (active) setHistory(result);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดประวัติการอ่านได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [isLoggedIn]);

    return { history, loading, error };
}

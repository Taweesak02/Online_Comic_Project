import { useEffect, useState } from 'react';
import { getComicOverview, getMyComics } from '../../../api/comicManagementApi';

export default function useComicData() {
    const [comics, setComics] = useState([]);
    const [overview, setOverview] = useState(null);
    const [overviewError, setOverviewError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadOverview = async () => {
        try {
            setOverview(await getComicOverview());
            setOverviewError('');
        } catch (requestError) {
            setOverviewError(requestError.response?.data?.message || 'ไม่สามารถโหลดภาพรวมผลงานได้');
        }
    };
    const loadComics = async () => {
        setLoading(true);
        try {
            setComics(await getMyComics());
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถโหลดรายการการ์ตูนของคุณได้');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        let active = true;
        getMyComics()
            .then((items) => { if (active) setComics(items); })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดรายการการ์ตูนของคุณได้');
            })
            .finally(() => { if (active) setLoading(false); });
        getComicOverview()
            .then((result) => {
                if (active) {
                    setOverview(result);
                    setOverviewError('');
                }
            })
            .catch((requestError) => {
                if (active) setOverviewError(requestError.response?.data?.message || 'ไม่สามารถโหลดภาพรวมผลงานได้');
            });
        return () => { active = false; };
    }, []);

    const updateComic = (id, updated) => {
        setComics((current) => current.map((comic) => comic.id === id ? { ...comic, ...updated } : comic));
    };
    const refreshData = () => Promise.all([loadComics(), loadOverview()]);

    return {
        comics,
        overview,
        overviewError,
        loading,
        error,
        setError,
        loadOverview,
        refreshData,
        updateComic,
    };
}

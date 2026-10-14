import { useState } from 'react';
import { resubmitComic } from '../../../api/comicManagementApi';

export default function useComicReview({ updateComic, loadOverview, setError, setMessage }) {
    const [resubmittingId, setResubmittingId] = useState(null);

    const submitForReview = async (comic) => {
        if (resubmittingId !== null) return;
        setResubmittingId(comic.id);
        setError('');
        setMessage('');
        try {
            const updated = await resubmitComic(comic.id);
            updateComic(comic.id, updated);
            await loadOverview();
            setMessage('ส่งการ์ตูนให้ผู้ดูแลพิจารณาใหม่แล้ว');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถส่งการ์ตูนให้พิจารณาใหม่ได้');
        } finally {
            setResubmittingId(null);
        }
    };

    return { resubmittingId, submitForReview };
}

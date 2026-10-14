import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getComicDetail, getComicRating } from '../../../api/comicReaderApi';

export default function useComicDetail() {
    const { comicId } = useParams(); const [comic, setComic] = useState(null); const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        getComicDetail(comicId)
            .then((data) => active && setComic(data))
            .catch((requestError) => active && setError(requestError.response?.data?.message || 'ไม่สามารถโหลดรายละเอียดการ์ตูนได้'));
        return () => { active = false; };
    }, [comicId]
    );

    const refreshRating = async () => {
        const result = await getComicRating(comicId);
        setComic((current) => ({
            ...current,
            avgRating: result?.avgRating ?? current.avgRating,
            ratingCount: result?.ratingCount ?? current.ratingCount,})
        );
    };

    const updateFavoriteCount = (change) => {
        setComic((current) => ({
            ...current,
            _count: {
                ...current._count,
                favorites: Math.max(0, (current._count?.favorites ?? 0) + change),
            },
        }));
    };

    const updateFollowerCount = (change) => {
        setComic((current) => ({
            ...current,
            _count: {
                ...current._count,
                follows: Math.max(0, (current._count?.follows ?? 0) + change),
            },
        }));
    };

    return { comicId, comic, error, refreshRating, updateFavoriteCount, updateFollowerCount };
}

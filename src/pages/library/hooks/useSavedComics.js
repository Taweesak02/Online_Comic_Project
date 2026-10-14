import { useEffect, useState } from 'react';
import { getComicDetail, getMyFavorites, getMyFollowedComics } from '../../../api/comicReaderApi';
import { toComicCard } from '../../../components/comics/comicCardUtils';

export default function useSavedComics(kind) {
    const [state, setState] = useState({ loading: true, comics: [], error: '' });
    const [attempt, setAttempt] = useState(0);
    const favorites = kind === 'favorites';
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const entries = await (favorites ? getMyFavorites() : getMyFollowedComics());
                const comics = await Promise.all(entries.filter((entry) => entry.comic?.id).map(async (entry, index) => {
                    try {
                        const detail = await getComicDetail(entry.comic.id);
                        return toComicCard({ ...entry.comic, ...detail }, index);
                    } catch {
                        return toComicCard(entry.comic, index);
                    }
                }));
                if (active) setState({ loading: false, comics, error: '' });
            } catch (error) {
                if (active) setState({ loading: false, comics: [], error: error.response?.data?.message || 'ไม่สามารถโหลดรายการการ์ตูนได้' });
            }
        };
        load();
        return () => { active = false; };
    }, [favorites, attempt]);

    return { state, setState, setAttempt, favorites };
}

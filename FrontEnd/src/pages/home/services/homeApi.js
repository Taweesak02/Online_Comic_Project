import api from '../../../api/client';
import { toComicCard } from '../../../components/comics/comicCardUtils';

const rankingEndpoints = {
    mostViewed: '/public/most-view',
    topRated: '/public/top-rated',
    mostFavorite: '/public/most-favorite',
    mostFollowed: '/public/most-followed',
};

export async function getHomeRanking(ranking, { signal } = {}) {
    const endpoint = rankingEndpoints[ranking];
    if (!endpoint) throw new Error(`Unknown home ranking: ${ranking}`);

    const response = await api.get(endpoint, { params: { limit: 5 }, signal });
    const results = response.data?.data ?? response.data;
    if (!Array.isArray(results)) throw new Error('Invalid ranking response');

    return Promise.all(results.filter((comic) => comic?.id != null).map(async (comic, index) => {
        // Ranking responses omit some statistics; details include score, views and favorites.
        const detailResponse = await api.get(`/public/${comic.id}`, { signal });
        const detail = detailResponse.data?.data ?? detailResponse.data;
        return toComicCard({ ...comic, ...detail }, index);
    }));
}

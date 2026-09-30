import api from './client';

const unwrap = (payload) => payload?.data ?? payload;
const contentRequests = new Map();
const CONTENT_CACHE_DURATION = 2_000;

export const getComicDetail = async (comicId) => unwrap((await api.get(`/public/${comicId}`)).data);
export const getUnlockedChapters = async (comicId) => unwrap((await api.get('/chapter/unlocked', { params: { comicId } })).data);
export const getComicRating = async (comicId) => unwrap((await api.get(`/rating/${comicId}`)).data);
export const getMyComicRating = async (comicId) => unwrap((await api.get(`/rating/${comicId}/me`)).data);
export const rateComic = async (comicId, rating) => unwrap((await api.post(`/rating/${comicId}`, { rating })).data);
export const getMyFavorites = async () => {
    const result = unwrap((await api.get('/favorite')).data);
    if (Array.isArray(result)) return result;
    return Object.values(result ?? {}).filter((item) => item && typeof item === 'object' && ('comicId' in item || 'comic' in item));
};
export const addFavorite = async (comicId) => unwrap((await api.post(`/favorite/${comicId}`)).data);
export const removeFavorite = async (comicId) => unwrap((await api.delete(`/favorite/${comicId}`)).data);
export const getMyFollowedComics = async () => {
    const result = unwrap((await api.get('/follow')).data);
    if (Array.isArray(result)) return result;
    return Object.values(result ?? {}).filter((item) => item && typeof item === 'object' && ('comicId' in item || 'comic' in item));
};
export const followComic = async (comicId) => unwrap((await api.post(`/follow/${comicId}`)).data);
export const unfollowComic = async (comicId) => unwrap((await api.delete(`/follow/${comicId}`)).data);
export const getChapterComments = async (chapterId) => {
    const result = unwrap((await api.get(`/comment/${chapterId}`)).data);
    if (Array.isArray(result)) return result;
    return Object.values(result ?? {}).filter((item) => item && typeof item === 'object' && 'content' in item);
};
export const addChapterComment = async (chapterId, content) => unwrap((await api.post(`/comment/${chapterId}`, { content })).data);
export const editChapterComment = async (commentId, content) => unwrap((await api.patch(`/comment/${commentId}`, { content })).data);
export const deleteChapterComment = async (commentId) => unwrap((await api.delete(`/comment/${commentId}`)).data);
export const getChapterContent = (chapterId) => {
    const key = String(chapterId);
    if (!contentRequests.has(key)) {
        const request = api.get(`/chapter/${chapterId}/content`)
            .then(({ data }) => {
                setTimeout(() => contentRequests.delete(key), CONTENT_CACHE_DURATION);
                return unwrap(data);
            })
            .catch((error) => {
                // A denied request must not be cached because the chapter may be
                // unlocked immediately before the reader requests it again.
                contentRequests.delete(key);
                throw error;
            });
        contentRequests.set(key, request);
    }
    return contentRequests.get(key);
};
export const unlockChapter = async (chapterId) => unwrap((await api.post(`/chapter/${chapterId}/unlock`)).data);

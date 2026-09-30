import api from './client';

const getResponseData = (payload) => {
    if (!payload) return payload;
    if (payload.data !== undefined) return payload.data;
    return payload;
};

const normalizeList = (payload) => {
    const source = getResponseData(payload);

    if (Array.isArray(source)) return source.filter(Boolean);
    if (!source || typeof source !== 'object') return [];

    const keysToCheck = ['comics', 'items', 'results', 'myComics', 'ownComics', 'data', 'comicList', 'userComics'];

    for (const key of keysToCheck) {
        const value = source[key];
        if (Array.isArray(value)) return value.filter(Boolean);
    }

    const objectValues = Object.values(source).filter((value) => value !== undefined && value !== null && value !== true && value !== false);
    const recordList = objectValues.filter((value) => value && typeof value === 'object' && !Array.isArray(value) && (value.id !== undefined || value._id !== undefined || value.title !== undefined));
    if (recordList.length > 0) return recordList;

    for (const value of objectValues) {
        if (Array.isArray(value)) return value.filter(Boolean);
        if (value && typeof value === 'object') {
            const nestedList = normalizeList(value);
            if (nestedList.length > 0) return nestedList;
        }
    }

    return [];
};

export const uploadCoverImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/cover', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const result = getResponseData(response.data);
    return result?.url ?? result?.data?.url ?? result;
};

export const getMyComics = async () => {
    const response = await api.get('/comic-manage');
    return normalizeList(response.data);
};

export const createComic = async (payload) => {
    const response = await api.post('/comic-manage', payload);
    return getResponseData(response.data);
};

export const getComicOverview = async () => getResponseData((await api.get('/comic-manage/overview')).data);

export const editComic = async (comicId, payload) => {
    const response = await api.patch(`/comic-manage/${comicId}`, payload);
    return getResponseData(response.data);
};

export const resubmitComic = async (comicId) => getResponseData((await api.patch(`/comic-manage/${comicId}/resubmit`)).data);

export const deleteComic = async (comicId) => {
    const response = await api.delete(`/comic-manage/${comicId}`);
    return getResponseData(response.data);
};

export const getManagedComic = async (comicId) => getResponseData((await api.get(`/comic-manage/${comicId}`)).data);
export const getComicChapters = async (comicId) => normalizeList((await api.get('/chapter', { params: { comicId } })).data);

export const uploadChapterImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const result = getResponseData((await api.post('/upload/chapter', formData)).data);
    return Array.isArray(result) ? result[0]?.url : result?.url;
};

export const createChapter = async ({ comicId, chapterNumber, title, coinCost, pages }) => getResponseData((await api.post('/chapter', { comicId: Number(comicId), chapterNumber: Number(chapterNumber), title, coinCost: Number(coinCost || 0), pages })).data);
export const updateChapter = async (chapterId, { chapterNumber, title, coinCost }) => getResponseData((await api.patch(`/chapter/${chapterId}`, { chapterNumber: Number(chapterNumber), title, coinCost: Number(coinCost || 0) })).data);
export const deleteChapter = async (chapterId) => getResponseData((await api.delete(`/chapter/${chapterId}`)).data);
export const getChapterPages = async (chapterId) => {
    // The current API exposes page images through the content endpoint.
    const result = getResponseData((await api.get(`/chapter/${chapterId}/content`)).data);
    return Array.isArray(result?.pages) ? result.pages : [];
};
export const replaceChapterPages = async (chapterId, pages) => getResponseData((await api.put(`/chapter/${chapterId}/pages`, { pages })).data);

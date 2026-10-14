import api from './client';

export const searchPublicUsers = async ({ username = '', sort = 'latest', page = 1, signal } = {}) => {
    const response = await api.get('/public/user', {
        params: { username: username.trim(), sort, page, limit: 20 },
        signal,
    });
    return response.data?.data ?? response.data;
};

export const getPublicUserComics = async (userId, signal) => {
    const response = await api.get(`/public/user/${encodeURIComponent(userId)}`, { signal });
    return response.data?.data ?? response.data;
};

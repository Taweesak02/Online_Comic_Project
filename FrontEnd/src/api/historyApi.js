import api from './client';

export const getReadingHistory = async () => {
    const response = await api.get('/history');
    const result = response.data?.data ?? response.data;
    if (Array.isArray(result)) return result;
    return Object.values(result ?? {}).filter((item) => item && typeof item === 'object' && 'chapter' in item);
};

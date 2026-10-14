import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });
let refreshPromise = null;

const sessionFrom = (payload) => {
    const data = payload?.data ?? payload;
    return { accessToken: data?.accessToken ?? data?.token?.accessToken, refreshToken: data?.refreshToken ?? data?.token?.refreshToken };
};

const saveSession = (session) => {
    if (!session.accessToken || !session.refreshToken) throw new Error('Invalid session response');
    localStorage.setItem('accessToken', session.accessToken);
    localStorage.setItem('refreshToken', session.refreshToken);
    return session;
};

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    if (!refreshPromise) refreshPromise = api.post('/auth/refresh', { refreshToken }, { skipTokenRefresh: true }).then(({ data }) => saveSession(sessionFrom(data))).finally(() => { refreshPromise = null; });
    return refreshPromise;
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.skipTokenRefresh) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use((response) => response, async (error) => {
    const request = error.config;
    const status = error.response?.status;
    const isRefreshRequest = request?.url?.includes('/auth/refresh');
    if (!request || request.skipTokenRefresh || request.retryAfterRefresh || isRefreshRequest || (status !== 401 && status !== 403) || !localStorage.getItem('refreshToken')) throw error;
    try {
        const { accessToken } = await refreshAccessToken();
        request.retryAfterRefresh = true;
        request.headers.Authorization = `Bearer ${accessToken}`;
        return api(request);
    } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw refreshError;
    }
});

export { sessionFrom, saveSession };
export default api;

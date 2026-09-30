import api from '../../../api/client';

async function authenticate(path, credentials) {
    const response = await api.post(path, credentials);
    const result = response.data?.data || response.data;
    const accessToken = result?.accessToken ?? result?.token?.accessToken;
    const refreshToken = result?.refreshToken ?? result?.token?.refreshToken;

    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    return result?.user;
}

export const login = (credentials) => authenticate('/auth/login', credentials);
export const register = (credentials) => authenticate('/auth/register', credentials);

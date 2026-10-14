// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AxiosError } from 'axios';
import api, { refreshAccessToken, sessionFrom, saveSession } from '../src/api/client';

let adapter;
const originalAdapter = api.defaults.adapter;
const response = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
const denied = (config, status = 401) => new AxiosError('Denied', 'ERR_BAD_REQUEST', config, null, { config, status, data: {} });
beforeEach(() => {
    localStorage.clear();
    adapter = vi.fn(async config => response(config, { ok: true }));
    api.defaults.adapter = adapter;
});
afterEach(() => { api.defaults.adapter = originalAdapter; localStorage.clear(); });

test('sessions accept flat and nested tokens and reject incomplete token pairs', () => {
    expect(sessionFrom({ data: { token: { accessToken: 'a', refreshToken: 'r' } } })).toEqual({ accessToken: 'a', refreshToken: 'r' });
    expect(sessionFrom({ accessToken: 'a', refreshToken: 'r' })).toEqual({ accessToken: 'a', refreshToken: 'r' });
    expect(sessionFrom(null)).toEqual({ accessToken: undefined, refreshToken: undefined });
    expect(() => saveSession({ accessToken: 'a' })).toThrow('Invalid session');
    expect(() => saveSession({ refreshToken: 'r' })).toThrow('Invalid session');
    expect(localStorage.length).toBe(0);
    expect(saveSession({ accessToken: 'a', refreshToken: 'r' })).toEqual({ accessToken: 'a', refreshToken: 'r' });
    expect(localStorage.getItem('refreshToken')).toBe('r');
});

test('requests attach access tokens except when explicitly skipping token refresh', async () => {
    await api.get('/public');
    expect(adapter.mock.lastCall[0].headers.Authorization).toBeUndefined();
    localStorage.setItem('accessToken', 'a');
    await api.get('/private');
    expect(adapter.mock.lastCall[0].headers.Authorization).toBe('Bearer a');
    await api.get('/public', { skipTokenRefresh: true });
    expect(adapter.mock.lastCall[0].headers.Authorization).toBeUndefined();
});

test('concurrent refreshes share one request and persist the rotated token pair', async () => {
    localStorage.setItem('refreshToken', 'old');
    adapter.mockImplementation(async config => response(config, { data: { accessToken: 'new-a', refreshToken: 'new-r' } }));
    const results = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()]);
    expect(adapter).toHaveBeenCalledOnce();
    expect(adapter.mock.calls[0][0].url).toBe('/auth/refresh');
    expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual({ refreshToken: 'old' });
    expect(results.every(result => result.accessToken === 'new-a')).toBe(true);
    expect(localStorage.getItem('refreshToken')).toBe('new-r');
    await refreshAccessToken();
    expect(adapter).toHaveBeenCalledTimes(2);
});

test('refresh fails without a refresh token and does not make a network request', async () => {
    await expect(refreshAccessToken()).rejects.toThrow('No refresh token');
    expect(adapter).not.toHaveBeenCalled();
});

test.each([401, 403])('HTTP %s refreshes credentials and retries the original request once', async status => {
    saveSession({ accessToken: 'old-a', refreshToken: 'old-r' });
    adapter.mockImplementation(async config => {
        if (config.url === '/auth/refresh') return response(config, { accessToken: 'new-a', refreshToken: 'new-r' });
        if (!config.retryAfterRefresh) throw denied(config, status);
        expect(config.headers.Authorization).toBe('Bearer new-a');
        return response(config, { user: 'Alice' });
    });
    expect((await api.get('/private')).data).toEqual({ user: 'Alice' });
    expect(adapter).toHaveBeenCalledTimes(3);
});

test.each([{ status: 500 }, { status: 401, skipTokenRefresh: true }, { status: 401, retryAfterRefresh: true }, { status: 401, url: '/auth/refresh' }])('non-retryable failures do not trigger refresh (%s)', async ({ status, ...config }) => {
    localStorage.setItem('refreshToken', 'r');
    adapter.mockImplementation(async request => { throw denied(request, status); });
    await expect(api.get(config.url ?? '/private', config)).rejects.toThrow('Denied');
    expect(adapter).toHaveBeenCalledOnce();
});

test('failed refresh clears stored credentials and preserves the error', async () => {
    saveSession({ accessToken: 'a', refreshToken: 'r' });
    adapter.mockImplementation(async config => { throw denied(config); });
    await expect(api.get('/private')).rejects.toThrow('Denied');
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(localStorage.length).toBe(0);
});

test('errors without request metadata pass through unchanged', async () => {
    adapter.mockRejectedValue(new Error('offline'));
    await expect(api.get('/private')).rejects.toThrow('offline');
    expect(adapter).toHaveBeenCalledOnce();
});

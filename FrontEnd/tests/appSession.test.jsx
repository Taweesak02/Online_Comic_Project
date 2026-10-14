// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from '../src/App';
import api, { refreshAccessToken } from '../src/api/client';
import { getWallet } from '../src/api/coinPurchaseApi';
import { getNotifications } from '../src/api/notificationApi';
import { setupTestDom, click, change, submit, deferred } from './helpers/dom';

vi.mock('../src/api/client', () => ({ default: { get: vi.fn(), post: vi.fn(), defaults: { baseURL: 'http://localhost:3000/api' } }, refreshAccessToken: vi.fn() }));
vi.mock('../src/api/coinPurchaseApi', () => ({ getWallet: vi.fn(), getCoinPackages: vi.fn().mockResolvedValue([]) }));
vi.mock('../src/api/notificationApi', () => ({ getNotifications: vi.fn(), NOTIFICATIONS_CHANGED: 'notifications-changed' }));
vi.mock('../src/pages/home/services/homeApi', () => ({ getHomeRanking: vi.fn().mockResolvedValue([]) }));
const dom = setupTestDom();
const user = { id: 1, username: 'Alice' };
const render = () => act(async () => dom.root.render(<App />));
beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockReset().mockResolvedValue({ data: { data: { user } } });
    api.post.mockReset().mockResolvedValue({ data: {} });
    refreshAccessToken.mockReset().mockResolvedValue({ accessToken: 'new' });
    getWallet.mockReset().mockResolvedValue({ balance: 42 });
    getNotifications.mockReset().mockResolvedValue([]);
    localStorage.clear();
    window.history.replaceState({}, '', '/');
});
afterEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/'); });

test('guests do not validate a nonexistent session and can open and dismiss the account menu', async () => {
    await render();
    expect(api.get).not.toHaveBeenCalled();
    await click(dom.find('[aria-label="เปิดเมนูบัญชี"]'));
    expect(dom.find('a[href="/register"]')).not.toBeNull();
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })));
    expect(dom.find('a[href="/register"]')).not.toBeNull();
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(dom.find('a[href="/register"]')).toBeNull();
    await click(dom.find('[aria-label="เปิดเมนูบัญชี"]'));
    await act(async () => dom.find('[aria-label="เปิดเมนูบัญชี"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    expect(dom.find('a[href="/register"]')).not.toBeNull();
    await act(async () => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    expect(dom.find('a[href="/register"]')).toBeNull();
});

test('access tokens without refresh tokens are removed', async () => {
    localStorage.setItem('accessToken', 'old');
    await render();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
});

test.each([false, true])('sessions validate existing access tokens or refresh missing ones (%s)', async hasAccess => {
    localStorage.setItem('refreshToken', 'refresh');
    if (hasAccess) localStorage.setItem('accessToken', 'access');
    await render();
    expect(refreshAccessToken).toHaveBeenCalledTimes(hasAccess ? 0 : 1);
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(dom.find('[aria-label="เปิดเมนูบัญชีผู้ใช้"]')).not.toBeNull();
    expect(dom.find('[aria-label="เหรียญ 42"]')).not.toBeNull();
});

test.each([401, 403, 500])('access validation handles HTTP %s without discarding valid refresh credentials on network failure', async status => {
    localStorage.setItem('accessToken', 'access');
    localStorage.setItem('refreshToken', 'refresh');
    api.get.mockRejectedValueOnce({ response: { status } });
    await render();
    expect(refreshAccessToken).toHaveBeenCalledTimes(status === 500 ? 0 : 1);
    expect(localStorage.getItem('refreshToken')).toBe('refresh');
});

test.each([401, 403, 500])('refresh failure handles HTTP %s', async status => {
    localStorage.setItem('refreshToken', 'refresh');
    refreshAccessToken.mockRejectedValue({ response: { status } });
    await render();
    expect(localStorage.getItem('refreshToken')).toBe(status === 500 ? 'refresh' : null);
    expect(dom.find('[aria-label="เปิดเมนูบัญชี"]')).not.toBeNull();
});

test('login establishes session, displays wallet and clears credentials even when logout fails', async () => {
    window.history.replaceState({}, '', '/login');
    api.post.mockResolvedValueOnce({ data: { user, accessToken: 'access', refreshToken: 'refresh' } }).mockRejectedValueOnce(new Error('offline'));
    await render();
    await change(dom.find('[name="email"]'), 'alice@example.com');
    await change(dom.find('[name="password"]'), 'secret12');
    await submit(dom.find('form'));
    expect(window.location.pathname).toBe('/');
    expect(dom.find('[aria-label="เหรียญ 42"]')).not.toBeNull();
    await click(dom.find('[aria-label="เปิดเมนูบัญชีผู้ใช้"]'));
    await click(dom.button('ออกจากระบบ'));
    expect(api.post).toHaveBeenLastCalledWith('/auth/logout', { refreshToken: 'refresh' });
    expect(localStorage.length).toBe(0);
    expect(dom.find('[aria-label="เปิดเมนูบัญชี"]')).not.toBeNull();
});

test('admin sessions hide wallet actions and expose management navigation', async () => {
    localStorage.setItem('refreshToken', 'refresh');
    api.get.mockResolvedValue({ data: { user: { ...user, roleName: 'ADMIN' } } });
    getWallet.mockRejectedValue(new Error('offline'));
    await render();
    expect(dom.find('[aria-label^="เหรียญ"]')).toBeNull();
    await click(dom.find('[aria-label="เปิดเมนูบัญชีผู้ใช้"]'));
    expect(dom.button('Admin Management')).toBeDefined();
    expect(dom.button('ประวัติ Wallet')).toBeUndefined();
});

test('unknown routes render a not-found page and unmounted sessions do not update UI', async () => {
    window.history.replaceState({}, '', '/unknown');
    localStorage.setItem('accessToken', 'access');
    localStorage.setItem('refreshToken', 'refresh');
    const request = deferred();
    api.get.mockReturnValue(request.promise);
    await render();
    expect(dom.container.textContent).toContain('ไม่พบหน้าที่ต้องการ');
    await act(async () => dom.root.render(<p>Unmounted</p>));
    await act(async () => request.resolve({ data: user }));
    expect(dom.container.textContent).toBe('Unmounted');
    expect(getWallet).not.toHaveBeenCalled();
});

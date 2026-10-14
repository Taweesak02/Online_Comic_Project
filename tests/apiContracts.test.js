// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import api from '../src/api/client';
import * as management from '../src/api/comicManagementApi';
import * as reader from '../src/api/comicReaderApi';
import * as wallet from '../src/api/coinPurchaseApi';
import * as admin from '../src/api/adminManagementApi';
import * as profile from '../src/api/profileApi';
import * as users from '../src/api/publicUserApi';
import * as notifications from '../src/api/notificationApi';
import { getReadingHistory } from '../src/api/historyApi';
import { getHomeRanking } from '../src/pages/home/services/homeApi';
import { login, register } from '../src/pages/auth/services/authApi';

vi.mock('../src/api/client', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn(), defaults: { baseURL: 'http://localhost:3000/api/' } } }));
beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    for (const method of ['get', 'post', 'patch', 'put', 'delete']) api[method].mockResolvedValue({ data: { data: { id: 1 } } });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

test.each([
    [{ data: [{ id: 1 }, null] }, [{ id: 1 }]],
    [{ comics: [{ id: 1 }] }, [{ id: 1 }]],
    [{ items: [{ id: 1 }] }, [{ id: 1 }]],
    [{ results: [{ id: 1 }] }, [{ id: 1 }]],
    [{ a: { _id: 1 }, b: true, c: null, d: false }, [{ _id: 1 }]],
    [{ wrapper: { list: [{ title: 'Comic' }] } }, [{ title: 'Comic' }]],
    [{ wrapper: { invalid: 'text' }, list: [{ id: 1 }] }, [{ id: 1 }]],
    [null, []], [3, []], [{ metadata: 'empty' }, []],
])('managed comics normalize supported list payloads', async (payload, expected) => {
    api.get.mockResolvedValue({ data: payload });
    expect(await management.getMyComics()).toEqual(expected);
    expect(await management.getComicChapters(7)).toEqual(expected);
    expect(api.get).toHaveBeenLastCalledWith('/chapter', { params: { comicId: 7 } });
});

test.each([
    [reader.getMyFavorites, 'comicId', '/favorite'], [reader.getMyFollowedComics, 'comic', '/follow'],
    [reader.getChapterComments, 'content', '/comment/1'], [wallet.getCoinPackages, 'coinAmount', '/package'],
    [wallet.getPaymentMethods, 'code', '/payment-method'], [notifications.getNotifications, 'message', '/notification'],
    [getReadingHistory, 'chapter', '/history'],
])('list APIs accept arrays and indexed objects while rejecting metadata (%s)', async (load, key, url) => {
    const record = { id: 1, [key]: 'value' };
    for (const data of [[record], { data: [record] }, { data: { 0: record, count: 1, extra: null, metadata: {} } }]) {
        api.get.mockResolvedValue({ data });
        expect(await load(1)).toEqual([record]);
    }
    api.get.mockResolvedValue({ data: null });
    expect(await load(1)).toEqual([]);
    expect(api.get).toHaveBeenLastCalledWith(url);
});

test.each([
    [{ amount: 1 }], { transactions: [{ amount: 1 }] }, { walletTransactions: [{ amount: 1 }] },
    { wallet_transactions: [{ amount: 1 }] }, { items: [{ amount: 1 }] }, { results: [{ amount: 1 }] },
    { history: { data: { transactions: [{ amount: 1 }] } } }, { 0: { amount: 1 }, metadata: 'ignored' },
])('wallet history accepts aliases and nested response wrappers', async data => {
    api.get.mockResolvedValue({ data });
    expect(await wallet.getWalletTransactions()).toEqual([{ amount: 1 }]);
});

test('wallet history orders numeric records and safely handles malformed responses', async () => {
    api.get.mockResolvedValue({ data: { 10: { id: 10 }, 2: { id: 2 }, 1: null } });
    expect(await wallet.getWalletTransactions()).toEqual([{ id: 2 }, { id: 10 }]);
    for (const data of [null, 42, {}, { history: 'invalid' }]) {
        api.get.mockResolvedValue({ data });
        expect(await wallet.getWalletTransactions()).toEqual([]);
    }
});

test('chapter writes convert numeric fields and preserve ordered page URLs', async () => {
    const input = { comicId: '7', chapterNumber: '2', title: 'Chapter', coinCost: '', pages: ['a.png', 'b.png'] };
    expect(await management.createChapter(input)).toEqual({ id: 1 });
    expect(api.post).toHaveBeenCalledWith('/chapter', { ...input, comicId: 7, chapterNumber: 2, coinCost: 0 });
    await management.updateChapter(1, { ...input, coinCost: '5' });
    expect(api.patch).toHaveBeenCalledWith('/chapter/1', { chapterNumber: 2, title: 'Chapter', coinCost: 5 });
    await management.replaceChapterPages(1, input.pages);
    expect(api.put).toHaveBeenCalledWith('/chapter/1/pages', { pages: input.pages });
    api.get.mockResolvedValueOnce({ data: { data: { pages: [{ imageUrl: 'a.png' }] } } }).mockResolvedValueOnce({ data: {} });
    expect(await management.getChapterPages(1)).toEqual([{ imageUrl: 'a.png' }]);
    expect(await management.getChapterPages(1)).toEqual([]);
});

test.each([
    [management.getComicOverview, 'get', '/comic-manage/overview'],
    [management.getManagedComic, 'get', '/comic-manage/1'],
    [management.deleteComic, 'delete', '/comic-manage/1'],
    [management.resubmitComic, 'patch', '/comic-manage/1/resubmit'],
    [management.deleteChapter, 'delete', '/chapter/1'],
    [reader.getComicDetail, 'get', '/public/1'],
    [reader.getComicRating, 'get', '/rating/1'],
    [reader.getMyComicRating, 'get', '/rating/1/me'],
    [reader.addFavorite, 'post', '/favorite/1'], [reader.removeFavorite, 'delete', '/favorite/1'],
    [reader.followComic, 'post', '/follow/1'], [reader.unfollowComic, 'delete', '/follow/1'],
    [reader.deleteChapterComment, 'delete', '/comment/1'], [reader.unlockChapter, 'post', '/chapter/1/unlock'],
    [wallet.getWallet, 'get', '/wallet'], [admin.getAdminDashboardData, 'get', '/admin/statistic'],
])('resource requests unwrap response data (%s)', async (request, method, endpoint) => {
    expect(await request(1)).toEqual({ id: 1 });
    expect(api[method]).toHaveBeenCalledWith(endpoint);
});

test('comic content deduplicates concurrent requests, expires success and retries denied requests', async () => {
    vi.useFakeTimers();
    api.get.mockResolvedValue({ data: { data: { pages: ['page'] } } });
    const first = reader.getChapterContent('cache-success');
    expect(reader.getChapterContent('cache-success')).toBe(first);
    expect(await first).toEqual({ pages: ['page'] });
    expect(api.get).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2000);
    await reader.getChapterContent('cache-success');
    expect(api.get).toHaveBeenCalledTimes(2);
    api.get.mockRejectedValueOnce(new Error('locked'));
    await expect(reader.getChapterContent('cache-error')).rejects.toThrow('locked');
    await expect(reader.getChapterContent('cache-error')).resolves.toEqual({ pages: ['page'] });
    await vi.advanceTimersByTimeAsync(2000);
});

test('comic writes keep title, rating and comment payloads intact', async () => {
    await management.createComic({ title: 'Story' });
    expect(api.post).toHaveBeenCalledWith('/comic-manage', { title: 'Story' });
    await management.editComic(1, { title: 'Edited' });
    expect(api.patch).toHaveBeenCalledWith('/comic-manage/1', { title: 'Edited' });
    await reader.rateComic(1, 4);
    expect(api.post).toHaveBeenCalledWith('/rating/1', { rating: 4 });
    await reader.addChapterComment(1, 'Comment');
    expect(api.post).toHaveBeenCalledWith('/comment/1', { content: 'Comment' });
    await reader.editChapterComment(2, 'Edited');
    expect(api.patch).toHaveBeenCalledWith('/comment/2', { content: 'Edited' });
    await reader.getUnlockedChapters(1);
    expect(api.get).toHaveBeenCalledWith('/chapter/unlocked', { params: { comicId: 1 } });
});

test.each([[management.uploadCoverImage, '/upload/cover'], [management.uploadChapterImage, '/upload/chapter'], [profile.uploadProfileImage, '/upload/avatar']])('image upload sends the file and reads its URL (%s)', async (uploadImage, endpoint) => {
    const file = new File(['image'], 'cover.png', { type: 'image/png' });
    api.post.mockResolvedValue({ data: { data: { url: '/uploads/image.png' } } });
    expect(await uploadImage(file)).toBe('/uploads/image.png');
    const [url, body] = api.post.mock.calls[0];
    expect(url).toBe(endpoint);
    expect(body.get('image')).toBe(file);
});

test('upload APIs accept nested URL and array response variations', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { data: { url: 'nested.png' } } } });
    expect(await management.uploadCoverImage(new File([], 'x.png'))).toBe('nested.png');
    api.post.mockResolvedValueOnce({ data: 'plain.png' });
    expect(await management.uploadCoverImage(new File([], 'x.png'))).toBe('plain.png');
    api.post.mockResolvedValueOnce({ data: [{ url: 'array.png' }] });
    expect(await management.uploadChapterImage(new File([], 'x.png'))).toBe('array.png');
});

test('payment requests coerce IDs, encode transaction IDs and send receipt files', async () => {
    await wallet.purchaseCoins('1', '2');
    expect(api.post).toHaveBeenCalledWith('/payment/purchase', { packageId: 1, paymentMethodId: 2 });
    await wallet.getPaymentStatus('a/b');
    expect(api.get).toHaveBeenCalledWith('/payment/status/a%2Fb');
    await wallet.cancelPayment('a/b');
    expect(api.patch).toHaveBeenCalledWith('/payment/a%2Fb/cancel');
    const slip = new File(['receipt'], 'receipt.png');
    await wallet.verifyPaymentSlip('a/b', slip);
    const [url, body] = api.post.mock.lastCall;
    expect(url).toBe('/payment/a%2Fb/verify-slip');
    expect(body.get('slip')).toBe(slip);
});

test('page-exit cancellation uses keepalive, optional credentials and rejects unsuccessful responses', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    await wallet.cancelPaymentOnPageExit('a/b');
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3000/api/payment/a%2Fb/cancel', { method: 'PATCH', headers: {}, keepalive: true });
    localStorage.setItem('accessToken', 'test-token');
    await wallet.cancelPaymentOnPageExit('1');
    expect(fetch.mock.lastCall[1].headers).toEqual({ Authorization: 'Bearer test-token' });
    fetch.mockResolvedValue({ ok: false });
    await expect(wallet.cancelPaymentOnPageExit('1')).rejects.toThrow('Unable to cancel');
});

test('admin configuration normalizes monetary values and payment method strings', async () => {
    const data = { name: 'Starter', coinAmount: '100', price: '50.5' };
    await admin.createCoinPackage(data);
    expect(api.post).toHaveBeenCalledWith('/package', { name: 'Starter', coinAmount: 100, price: 50.5 });
    await admin.editCoinPackage(1, data);
    expect(api.patch).toHaveBeenCalledWith('/package/1', { name: 'Starter', coinAmount: 100, price: 50.5 });
    await admin.createPaymentMethod({ name: ' Bank ', code: ' bank ' });
    expect(api.post).toHaveBeenCalledWith('/payment-method', { name: 'Bank', code: 'BANK', promptPayId: null });
    await admin.editPaymentMethod(1, { name: ' Bank ', code: ' bank ', promptPayId: ' 01234 ' });
    expect(api.patch).toHaveBeenCalledWith('/payment-method/1', { name: 'Bank', code: 'BANK', promptPayId: '01234' });
});

test('admin and public searches trim names, encode identifiers and forward pagination', async () => {
    await admin.searchAdminUsers(' Alice ');
    expect(api.get).toHaveBeenCalledWith('/public/user', { params: { username: 'Alice', sort: 'username', page: 1, limit: 20 } });
    await admin.searchAdminComics(' Comic ', 2, 'RESUBMIT');
    expect(api.get).toHaveBeenCalledWith('/admin/comics', { params: { title: 'Comic', page: 2, limit: 20, approved: 'RESUBMIT' } });
    await admin.searchAdminComics('');
    expect(api.get.mock.lastCall[1].params).not.toHaveProperty('approved');
    const signal = new AbortController().signal;
    await users.searchPublicUsers({ username: ' Alice ', signal });
    expect(api.get.mock.lastCall[1]).toEqual({ params: { username: 'Alice', sort: 'latest', page: 1, limit: 20 }, signal });
    await users.searchPublicUsers();
    await users.getPublicUserComics('a/b', signal);
    expect(api.get).toHaveBeenCalledWith('/public/user/a%2Fb', { signal });
    for (const [fn, endpoint] of [[admin.banUser, 'users/a%2Fb/ban'], [admin.unbanUser, 'users/a%2Fb/unban'], [admin.approveComic, 'comics/a%2Fb/approve'], [admin.unapproveComic, 'comics/a%2Fb/unapprove']]) {
        await fn('a/b');
        expect(api.patch).toHaveBeenLastCalledWith(`/admin/${endpoint}`);
    }
});

test('profile changes omit unspecified images and never send password confirmation', async () => {
    api.get.mockResolvedValueOnce({ data: { user: { id: 1 } } }).mockResolvedValueOnce({ data: { id: 2 } });
    expect(await profile.getProfile()).toEqual({ id: 1 });
    expect(await profile.getProfile()).toEqual({ id: 2 });
    await profile.updateProfile({ username: 'Alice' });
    expect(api.patch).toHaveBeenLastCalledWith('/auth/update-profile', { username: 'Alice' });
    await profile.updateProfile({ username: 'Alice', profileImage: 'avatar.png' });
    expect(api.patch.mock.lastCall[1].profileImage).toBe('avatar.png');
    await profile.updateEmail({ currentPassword: 'old', newEmail: 'new@example.com' });
    expect(api.patch).toHaveBeenLastCalledWith('/auth/update-email', { currentPassword: 'old', newEmail: 'new@example.com' });
    await profile.changePassword({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' });
    expect(api.patch).toHaveBeenLastCalledWith('/auth/change-password', { currentPassword: 'old', newPassword: 'new' });
});

test.each([login, register])('authentication stores both flat and nested token responses (%s)', async authenticate => {
    for (const payload of [{ user: { id: 1 }, accessToken: 'a', refreshToken: 'r' }, { data: { user: { id: 1 }, token: { accessToken: 'a', refreshToken: 'r' } } }]) {
        api.post.mockResolvedValue({ data: payload });
        expect(await authenticate({ email: 'user@example.com' })).toEqual({ id: 1 });
        expect(localStorage.getItem('accessToken')).toBe('a');
        expect(localStorage.getItem('refreshToken')).toBe('r');
    }
    localStorage.clear();
    api.post.mockResolvedValue({ data: {} });
    expect(await authenticate({})).toBeUndefined();
    expect(localStorage.length).toBe(0);
});

test('notification read events fire only after a successful update', async () => {
    const listener = vi.fn();
    window.addEventListener(notifications.NOTIFICATIONS_CHANGED, listener);
    try {
        await notifications.markNotificationAsRead(1);
        expect(listener).toHaveBeenCalledOnce();
        api.patch.mockRejectedValue(new Error('offline'));
        await expect(notifications.markNotificationAsRead(1)).rejects.toThrow('offline');
        expect(listener).toHaveBeenCalledOnce();
    } finally { window.removeEventListener(notifications.NOTIFICATIONS_CHANGED, listener); }
});

test('home rankings fetch details, filter malformed entries and reject invalid rankings', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, title: 'Story' }, null, {}] }).mockResolvedValueOnce({ data: { data: { avgRating: 4.25 } } });
    const signal = new AbortController().signal;
    const result = await getHomeRanking('mostViewed', { signal });
    expect(api.get).toHaveBeenCalledWith('/public/most-view', { params: { limit: 5 }, signal });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ title: 'Story', rating: '4.3' });
    await expect(getHomeRanking('invalid')).rejects.toThrow('Unknown');
    api.get.mockResolvedValue({ data: {} });
    await expect(getHomeRanking('topRated')).rejects.toThrow('Invalid ranking');
});

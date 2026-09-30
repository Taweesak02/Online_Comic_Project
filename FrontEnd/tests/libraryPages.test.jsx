// @vitest-environment jsdom
import { act } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import NotificationsPage from '../src/pages/notifications/NotificationsPage';
import ReadingHistoryPage from '../src/pages/library/ReadingHistoryPage';
import CoinPurchasePage from '../src/pages/wallet/CoinPurchasePage';
import HomePage from '../src/pages/home/HomePage';
import * as notifications from '../src/api/notificationApi';
import { getReadingHistory } from '../src/api/historyApi';
import { getCoinPackages } from '../src/api/coinPurchaseApi';
import { getHomeRanking } from '../src/pages/home/services/homeApi';
import { setupTestDom, click, submit, deferred } from './helpers/dom';

vi.mock('../src/api/notificationApi', () => ({ getNotifications: vi.fn(), markNotificationAsRead: vi.fn() }));
vi.mock('../src/api/historyApi', () => ({ getReadingHistory: vi.fn() }));
vi.mock('../src/api/coinPurchaseApi', () => ({ getCoinPackages: vi.fn() }));
vi.mock('../src/pages/home/services/homeApi', () => ({ getHomeRanking: vi.fn() }));
const dom = setupTestDom();
beforeEach(() => {
    vi.resetAllMocks();
    notifications.getNotifications.mockResolvedValue([]);
    getReadingHistory.mockResolvedValue([]);
    getCoinPackages.mockResolvedValue([]);
    getHomeRanking.mockResolvedValue([]);
});
function Destination() {
    const location = useLocation();
    return <output>{location.pathname}{location.search}</output>;
}

test.each([NotificationsPage, ReadingHistoryPage, CoinPurchasePage])('private pages await auth and redirect guests (%s)', async Component => {
    const page = props => <Routes><Route path="/private" element={<Component {...props} />} /><Route path="*" element={<Destination />} /></Routes>;
    await dom.render(page({ authReady: false, isLoggedIn: false }), ['/private']);
    expect(dom.container.textContent).toContain('กำลังตรวจสอบบัญชี');
    await dom.render(page({ authReady: true, isLoggedIn: false }));
    expect(dom.find('output').textContent).toBe('/login');
});

test.each([[NotificationsPage, notifications.getNotifications], [ReadingHistoryPage, getReadingHistory], [CoinPurchasePage, getCoinPackages]])('private pages show request errors and loading (%s)', async (Component, load) => {
    const request = deferred();
    load.mockReturnValue(request.promise);
    await dom.render(<Component authReady isLoggedIn />);
    expect(dom.container.textContent).toContain('กำลังโหลด');
    await act(async () => request.reject(new Error('offline')));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลด');
});

test('notifications can be marked read, with pending and error feedback', async () => {
    notifications.getNotifications.mockResolvedValue([
        { id: 1, message: 'New chapter', relatedComicId: 7, createdAt: '2026-01-01', isRead: false },
        { id: 2, message: 'Already read', createdAt: '2026-01-01', isRead: true },
    ]);
    notifications.markNotificationAsRead.mockRejectedValueOnce(new Error('offline'));
    await dom.render(<NotificationsPage authReady isLoggedIn />);
    await click(dom.button('ทำเครื่องหมายว่าอ่านแล้ว'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถทำเครื่องหมาย');
    const request = deferred();
    notifications.markNotificationAsRead.mockReturnValue(request.promise);
    await click(dom.button('ทำเครื่องหมายว่าอ่านแล้ว'));
    expect(dom.button('กำลังบันทึก...').disabled).toBe(true);
    await act(async () => request.resolve());
    expect(dom.all('[aria-label="อ่านแล้ว"]')).toHaveLength(2);
    expect(dom.find('button')).toBeNull();
    await click(dom.find('a'));
    expect(notifications.markNotificationAsRead).toHaveBeenCalledTimes(2);
});

test('reading history links to the last chapter and tolerates incomplete metadata', async () => {
    getReadingHistory.mockResolvedValue([{ id: 1, lastReadAt: '2026-01-01', chapter: { id: 3, title: 'Chapter', chapterNumber: 2, comic: { id: 7, title: 'Story', coverImage: 'https://example.com/cover.png' } } }, { id: 2 }]);
    await dom.render(<ReadingHistoryPage authReady isLoggedIn />);
    expect(dom.find('a').getAttribute('href')).toBe('/comics/7/chapters/3');
    expect(dom.container.textContent).toContain('ไม่ทราบชื่อเรื่อง');
    expect(dom.container.textContent).toContain('ไม่ทราบเวลา');
    expect(dom.find('img').alt).toBe('ปก Story');
});

test('coin purchase selects a package and routes to payment', async () => {
    getCoinPackages.mockResolvedValue([{ id: 1, name: 'Small', coinAmount: 10, price: 5 }, { id: 2, name: 'Large', coinAmount: 100, price: 50 }]);
    await dom.render(<Routes><Route path="/store" element={<CoinPurchasePage authReady isLoggedIn />} /><Route path="*" element={<Destination />} /></Routes>, ['/store']);
    await click(dom.all('input[type="radio"]')[1]);
    await submit(dom.find('form'));
    expect(dom.find('output').textContent).toBe('/payment?packageId=2');
});

test('empty coin store does not navigate on submit', async () => {
    await dom.render(<CoinPurchasePage authReady isLoggedIn />);
    await submit(dom.find('form'));
    expect(dom.find('[type="submit"]').disabled).toBe(true);
});

test('home rankings retry failures and render returned cards', async () => {
    getHomeRanking.mockRejectedValueOnce(new Error('offline'));
    await dom.render(<HomePage />);
    expect(getHomeRanking).toHaveBeenCalledTimes(4);
    expect(dom.find('[role="alert"]')).not.toBeNull();
    getHomeRanking.mockResolvedValue([{ id: 1, title: 'Ranked story' }]);
    await click(dom.button('ลองอีกครั้ง'));
    expect(dom.find('[role="alert"]')).toBeNull();
    expect(dom.container.textContent).toContain('Ranked story');
});

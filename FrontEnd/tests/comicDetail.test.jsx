// @vitest-environment jsdom
import { act } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import ComicDetailPage from '../src/pages/comics/ComicDetailPage';
import ChapterList from '../src/components/comics/chapter-display/ChapterList';
import * as api from '../src/api/comicReaderApi';
import { getWallet } from '../src/api/coinPurchaseApi';
import { setupTestDom, click, deferred } from './helpers/dom';

vi.mock('../src/api/comicReaderApi', () => ({
    getComicDetail: vi.fn(), getComicRating: vi.fn(), getMyComicRating: vi.fn(), rateComic: vi.fn(),
    getMyFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn(),
    getMyFollowedComics: vi.fn(), followComic: vi.fn(), unfollowComic: vi.fn(),
    getUnlockedChapters: vi.fn(), getChapterContent: vi.fn(), unlockChapter: vi.fn(),
}));
vi.mock('../src/api/coinPurchaseApi', () => ({ getWallet: vi.fn() }));
const dom = setupTestDom();
const comic = { id: 7, title: 'Story', coverImage: 'https://example.com/cover.png', description: 'Description', status: 'ONGOING', avgRating: 3.5, ratingCount: 2, categories: [{ category: { id: 1, name: 'Action' } }], tags: [{ tag: { id: 2, name: 'Popular' } }], creator: { id: 2, username: 'Author' }, chapters: [{ id: 1, chapterNumber: 1, title: 'Free', coinCost: 0 }, { id: 2, chapterNumber: 2, title: 'Paid', coinCost: 5 }] };
beforeEach(() => {
    vi.resetAllMocks();
    api.getComicDetail.mockResolvedValue(comic);
    api.getMyComicRating.mockResolvedValue(null);
    api.getComicRating.mockResolvedValue({ avgRating: 4.5, ratingCount: 3 });
    api.getMyFavorites.mockResolvedValue([]);
    api.getMyFollowedComics.mockResolvedValue([]);
    api.getUnlockedChapters.mockResolvedValue([]);
    api.getChapterContent.mockResolvedValue({ id: 2 });
    getWallet.mockResolvedValue({ balance: 20 });
});
function Destination() {
    const location = useLocation();
    return <output>{location.pathname}</output>;
}
const renderDetail = (isLoggedIn = true) => dom.render(<Routes><Route path="/comics/:comicId" element={<ComicDetailPage isLoggedIn={isLoggedIn} />} /></Routes>, ['/comics/7']);
const renderChapter = (props = {}) => dom.render(<Routes><Route path="/chapter" element={<ChapterList comicId={7} chapterId={2} chapterNumber={2} title="Paid" coinCost={5} isLoggedIn {...props} />} /><Route path="*" element={<Destination />} /></Routes>, ['/chapter']);

test('comic details load metadata and update rating and collection counts', async () => {
    await renderDetail();
    expect(dom.container.textContent).toContain('Story');
    expect(dom.container.textContent).toContain('Action');
    expect(dom.container.textContent).toContain('Popular');
    await click(dom.all('button').find(button => button.textContent.includes('เพิ่มในรายการโปรด')));
    expect(api.addFavorite).toHaveBeenCalledWith('7');
    await click(dom.all('button').find(button => button.textContent.includes('อยู่ในรายการโปรด')));
    expect(api.removeFavorite).toHaveBeenCalledWith('7');
    await click(dom.all('button').find(button => button.getAttribute('aria-pressed') === 'false' && button.textContent.includes('ติดตาม')));
    expect(api.followComic).toHaveBeenCalledWith('7');
    await click(dom.all('button').find(button => button.textContent.includes('กำลังติดตาม')));
    expect(api.unfollowComic).toHaveBeenCalledWith('7');
    await click(dom.find('[aria-label="ให้ 5 คะแนน"]'));
    expect(api.getComicRating).toHaveBeenCalledWith('7');
    expect(dom.container.textContent).toContain('4.5');
    api.getComicRating.mockResolvedValue({});
    await click(dom.find('[aria-label="ให้ 4 คะแนน"]'));
    expect(dom.container.textContent).toContain('4.5');
});

test('details display loading and errors and render incomplete public metadata', async () => {
    const request = deferred();
    api.getComicDetail.mockReturnValueOnce(request.promise);
    await renderDetail(false);
    expect(dom.container.textContent).toContain('กำลังโหลดรายละเอียด');
    await act(async () => request.resolve({ id: 7 }));
    expect(dom.container.textContent).toContain('ยังไม่มีตอนให้อ่าน');
    await dom.render(<p>Reset</p>);
    api.getComicDetail.mockRejectedValue(new Error('offline'));
    await renderDetail(false);
    expect(dom.container.textContent).toContain('ไม่สามารถโหลดรายละเอียด');
});

test('purchased chapters are links; purchase-history failure is visible', async () => {
    api.getUnlockedChapters.mockResolvedValue([{ id: 2 }]);
    await renderDetail();
    expect(dom.container.textContent).toContain('ซื้อแล้ว');
    await dom.render(<p>Reset</p>);
    api.getUnlockedChapters.mockRejectedValue(new Error('offline'));
    await renderDetail();
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลดสถานะตอน');
});

test('guests are sent to login when opening a paid chapter', async () => {
    await renderChapter({ isLoggedIn: false });
    await click(dom.find('button'));
    expect(dom.find('output').textContent).toBe('/login');
    expect(api.getChapterContent).not.toHaveBeenCalled();
});

test('already-unlocked content opens without a second charge', async () => {
    const request = deferred();
    api.getChapterContent.mockReturnValue(request.promise);
    await renderChapter();
    await click(dom.find('button'));
    expect(dom.find('button').disabled).toBe(true);
    await act(async () => request.resolve({ id: 2 }));
    expect(dom.find('output').textContent).toBe('/comics/7/chapters/2');
    expect(api.unlockChapter).not.toHaveBeenCalled();
});

test('paid chapter unlock asks for consent and updates the wallet', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    api.getChapterContent.mockRejectedValue({ response: { status: 403 } });
    const onBalanceChange = vi.fn();
    await renderChapter({ onBalanceChange });
    await click(dom.find('button'));
    expect(api.unlockChapter).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await click(dom.find('button'));
    expect(api.unlockChapter).toHaveBeenCalledWith(2);
    expect(onBalanceChange).toHaveBeenCalledWith(20);
    expect(dom.find('output').textContent).toBe('/comics/7/chapters/2');
});

test.each([402, 409, 500])('unlock failure handles HTTP %s', async status => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.getChapterContent.mockRejectedValue({ response: { status: 403 } });
    api.unlockChapter.mockRejectedValue({ response: { status } });
    await renderChapter();
    await click(dom.find('button'));
    if (status === 409) expect(dom.find('output').textContent).toBe('/comics/7/chapters/2');
    else expect(dom.find('[role="alert"]').textContent).toContain(status === 402 ? 'เหรียญไม่เพียงพอ' : 'ไม่สามารถปลดล็อก');
});

test('network errors do not prompt or charge for unlocking', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    api.getChapterContent.mockRejectedValue(new Error('offline'));
    await renderChapter();
    await click(dom.find('button'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถตรวจสอบ');
    expect(confirm).not.toHaveBeenCalled();
    expect(api.unlockChapter).not.toHaveBeenCalled();
});

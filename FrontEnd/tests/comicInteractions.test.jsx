// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import FavoriteButton from '../src/components/comics/FavoriteButton';
import FollowButton from '../src/components/comics/FollowButton';
import AllComics from '../src/pages/comic-management/components/comic/AllComics';
import ReviewComics from '../src/pages/comic-management/components/comic/ReviewComics';
import InactiveComics from '../src/pages/comic-management/components/comic/InactiveComics';
import * as api from '../src/api/comicReaderApi';

vi.mock('../src/api/comicReaderApi', () => ({
    getMyFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn(),
    getMyFollowedComics: vi.fn(), followComic: vi.fn(), unfollowComic: vi.fn(),
}));

let container;
let root;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.resetAllMocks();
    api.getMyFavorites.mockResolvedValue([]);
    api.getMyFollowedComics.mockResolvedValue([]);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
});
afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});
const render = async (element) => {
    await act(async () => root.render(<MemoryRouter>{element}</MemoryRouter>));
};
const click = async (element) => { await act(async () => element.click()); };
const button = () => container.querySelector('button');

test.each([FavoriteButton, FollowButton])('guests get a login link without fetching collections (%s)', async (Component) => {
    await render(<Component comicId={1} isLoggedIn={false} />);
    expect(container.querySelector('a').getAttribute('href')).toBe('/login');
    expect(api.getMyFavorites).not.toHaveBeenCalled();
    expect(api.getMyFollowedComics).not.toHaveBeenCalled();
});

test.each([
    [FavoriteButton, 'getMyFavorites', 'addFavorite', 'removeFavorite', 'onFavoriteChange'],
    [FollowButton, 'getMyFollowedComics', 'followComic', 'unfollowComic', 'onFollowChange'],
])('collection buttons add and remove membership with count deltas (%s)', async (Component, load, add, remove, callback) => {
    const onChange = vi.fn();
    api[load].mockResolvedValue([{ comic: { id: '1' } }]);
    await render(<Component comicId={1} isLoggedIn followerCount={7} {...{ [callback]: onChange }} />);
    expect(button().getAttribute('aria-pressed')).toBe('true');
    await click(button());
    expect(api[remove]).toHaveBeenCalledWith(1);
    expect(onChange).toHaveBeenLastCalledWith(-1);
    expect(button().getAttribute('aria-pressed')).toBe('false');
    await click(button());
    expect(api[add]).toHaveBeenCalledWith(1);
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(button().getAttribute('aria-pressed')).toBe('true');
});

test('loading and saving disable actions until the request completes', async () => {
    let finishLoad;
    let finishSave;
    api.getMyFavorites.mockReturnValue(new Promise(resolve => { finishLoad = resolve; }));
    api.addFavorite.mockReturnValue(new Promise(resolve => { finishSave = resolve; }));
    await render(<FavoriteButton comicId={1} isLoggedIn />);
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('กำลังตรวจสอบ');
    await act(async () => finishLoad([]));
    await click(button());
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('กำลังบันทึก');
    await act(async () => finishSave());
    expect(button().disabled).toBe(false);
});

test.each([
    [new Error('offline'), 'ไม่สามารถอัปเดตรายการโปรดได้'],
    [{ response: { data: { message: 'Please retry' } } }, 'Please retry'],
])('failed writes retain selection and show an error', async (error, message) => {
    const onChange = vi.fn();
    api.addFavorite.mockRejectedValue(error);
    await render(<FavoriteButton comicId={1} isLoggedIn onFavoriteChange={onChange} />);
    await click(button());
    expect(container.querySelector('[role="alert"]').textContent).toBe(message);
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(button().disabled).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
});

test('failed reads show an error and a successful retry clears it', async () => {
    api.getMyFavorites.mockRejectedValueOnce(new Error('offline'));
    await render(<FavoriteButton comicId={1} isLoggedIn />);
    expect(container.querySelector('[role="alert"]').textContent).toContain('ไม่สามารถตรวจสอบ');
    await click(button());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(button().getAttribute('aria-pressed')).toBe('true');
});

test.each(['resolve', 'reject'])('stale collection requests cannot overwrite a newer comic (%s)', async outcome => {
    let finish;
    api.getMyFavorites.mockReturnValueOnce(new Promise((resolve, reject) => {
        finish = outcome === 'resolve' ? () => resolve([{ comicId: 1 }]) : () => reject(new Error('offline'));
    }));
    await render(<FavoriteButton comicId={1} isLoggedIn />);
    await render(<FavoriteButton comicId={2} isLoggedIn />);
    await act(async () => finish());
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(button().disabled).toBe(false);
    expect(container.querySelector('[role="alert"]')).toBeNull();
});

const comic = { id: 1, title: 'Example', approved: 'UNAPPROVED', status: 'ONGOING' };
test.each([AllComics, ReviewComics, InactiveComics])('management lists preserve edit and chapter actions (%s)', async Component => {
    const onEdit = vi.fn();
    const onManageChapters = vi.fn();
    await render(<Component comics={[comic]} onEdit={onEdit} onManageChapters={onManageChapters} />);
    expect(container.textContent).toContain('ไม่มีรูปปก');
    expect(container.textContent).toContain('ไม่มีคำอธิบาย');
    await click(container.querySelector('article > button'));
    expect(onEdit).toHaveBeenCalledWith(comic);
    await click(container.querySelector('[aria-label="ตัวเลือก Example"]'));
    const manage = [...container.querySelectorAll('button')].find(item => item.textContent === 'จัดการตอน');
    await click(manage);
    expect(onManageChapters).toHaveBeenCalledWith(comic);
    expect(container.textContent).not.toContain('จัดการตอน');
    await click(container.querySelector('[aria-label="ตัวเลือก Example"]'));
    await click([...container.querySelectorAll('button')].find(item => item.textContent === 'แก้ไขการ์ตูน'));
    expect(onEdit).toHaveBeenCalledTimes(2);
});

test('resubmission is available only for active rejected comics and disables while saving', async () => {
    const onResubmit = vi.fn();
    const comics = [comic, { ...comic, id: 2, isActive: false }, { ...comic, id: 3, approved: 'APPROVED' }];
    await render(<ReviewComics comics={comics} onResubmit={onResubmit} resubmittingId={null} />);
    const retry = [...container.querySelectorAll('button')].filter(item => item.textContent === 'ส่งพิจารณาใหม่');
    expect(retry).toHaveLength(1);
    await click(retry[0]);
    expect(onResubmit).toHaveBeenCalledWith(comic);
    await render(<ReviewComics comics={comics} onResubmit={onResubmit} resubmittingId={1} />);
    expect([...container.querySelectorAll('button')].find(item => item.textContent === 'กำลังส่ง...').disabled).toBe(true);
});

test.each([AllComics, ReviewComics, InactiveComics])('empty management lists display their empty state (%s)', async Component => {
    await render(<Component comics={[]} />);
    expect(container.querySelector('article')).toBeNull();
    expect(container.textContent).toContain('0 รายการ');
    expect(container.textContent).toContain(Component === AllComics ? 'ยังไม่มีการ์ตูนที่คุณสร้าง' : 'ไม่มีการ์ตูนในรายการนี้');
});

test('create action and legacy comic fields remain supported', async () => {
    const onCreate = vi.fn();
    await render(<AllComics comics={[{ _id: 'legacy', name: 'Legacy', cover: 'https://example.com/cover.jpg' }, {}]} onCreate={onCreate} />);
    expect(container.querySelector('img').alt).toBe('ปก Legacy');
    expect(container.textContent).toContain('Comic 2');
    expect(container.textContent).toContain('ไม่ทราบสถานะการอนุมัติ');
    await click(button());
    expect(onCreate).toHaveBeenCalledTimes(1);
});

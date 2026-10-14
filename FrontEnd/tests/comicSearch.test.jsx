// @vitest-environment jsdom
import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import SearchPage from '../src/pages/search/SearchPage';
import * as api from '../src/api/searchApi';
import { setupTestDom, click, change, deferred } from './helpers/dom';

vi.mock('../src/api/searchApi', () => ({ searchComics: vi.fn(), getSearchFilterOptions: vi.fn() }));
const dom = setupTestDom();
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(1); });
beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    api.searchComics.mockResolvedValue({ items: [{ id: 1, title: 'Story', avgRating: 4.1 }] });
    api.getSearchFilterOptions.mockResolvedValue({ categories: [{ value: '1', label: 'Action' }], tags: [{ value: '2', label: 'New' }] });
});

test('search combines keyword, category, tag and sort choices and supports Enter', async () => {
    await dom.render(<SearchPage />);
    await tick();
    expect(dom.container.textContent).toContain('Story');
    await change(dom.find('input'), 'Dragon');
    await click(dom.button('Category'));
    await click(dom.find('[type="checkbox"]'));
    await click(dom.button('Tag'));
    await click(dom.all('[type="checkbox"]')[1]);
    await click(dom.button('Sort'));
    await click(dom.button('ยอดอ่านสูงสุด'));
    await tick();
    expect(api.searchComics).toHaveBeenLastCalledWith({ keyword: 'Dragon', categories: ['1'], tags: ['2'], sort: 'popular', limit: 20 });
    await click(dom.find('[type="checkbox"]'));
    await click(dom.all('[type="checkbox"]')[1]);
    await tick();
    expect(api.searchComics.mock.lastCall[0]).toMatchObject({ categories: [], tags: [] });
    api.searchComics.mockClear();
    await act(async () => dom.find('[aria-label="ค้นหาการ์ตูน"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(api.searchComics).not.toHaveBeenCalled();
    await act(async () => dom.find('[aria-label="ค้นหาการ์ตูน"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(api.searchComics).toHaveBeenCalledOnce();
    await click(dom.button('ค้นหา'));
    expect(api.searchComics).toHaveBeenCalledTimes(2);
});

test('search handles loading, empty payloads and network failures without stale results', async () => {
    const request = deferred();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.getSearchFilterOptions.mockRejectedValue(new Error('offline'));
    api.searchComics.mockReturnValueOnce(request.promise);
    await dom.render(<SearchPage />);
    await tick();
    expect(dom.container.textContent).toContain('กำลังค้นหาการ์ตูน');
    await act(async () => request.resolve({}));
    expect(dom.container.textContent).toContain('ไม่พบผลการค้นหา');
    await click(dom.button('Category'));
    expect(dom.container.textContent).toContain('ไม่มีข้อมูล');
    api.searchComics.mockRejectedValue(new Error('offline'));
    await click(dom.button('ค้นหา'));
    expect(log).toHaveBeenCalledTimes(2);
    expect(dom.container.textContent).toContain('ไม่พบผลการค้นหา');
});

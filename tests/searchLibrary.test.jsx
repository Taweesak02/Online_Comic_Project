// @vitest-environment jsdom
import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import AuthorSearchPage from '../src/pages/author-search/AuthorSearchPage';
import SavedComicsPage from '../src/pages/library/SavedComicsPage';
import ProfileContent from '../src/pages/profile/components/ProfileContent';
import FilterGroup from '../src/pages/search/components/FilterGroup';
import Button, { Icon } from '../src/components/ui/Button';
import ComicSection from '../src/components/comics/ComicSection';
import * as users from '../src/api/publicUserApi';
import * as comics from '../src/api/comicReaderApi';
import { setupTestDom, click, change, submit, deferred } from './helpers/dom';

vi.mock('../src/api/publicUserApi', () => ({ searchPublicUsers: vi.fn(), getPublicUserComics: vi.fn() }));
vi.mock('../src/api/comicReaderApi', () => ({ getMyFavorites: vi.fn(), getMyFollowedComics: vi.fn(), getComicDetail: vi.fn() }));
const dom = setupTestDom();
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(300); });
beforeEach(() => {
    vi.resetAllMocks();
    users.searchPublicUsers.mockResolvedValue({ users: [], pagination: { total: 0, totalPages: 1 } });
    users.getPublicUserComics.mockResolvedValue([]);
    comics.getMyFavorites.mockResolvedValue([]);
    comics.getMyFollowedComics.mockResolvedValue([]);
});

test('author search debounces typing, normalizes invalid URL values and supports retry and paging', async () => {
    vi.useFakeTimers();
    users.searchPublicUsers.mockResolvedValue({ users: [{ id: 1, username: 'Alice' }, { id: 2, username: 'Bob', profileImage: 'https://example.com/profile.png', comicCount: 2 }], pagination: { total: 4, totalPages: 2 } });
    await dom.render(<AuthorSearchPage />, ['/?page=-2&sort=invalid']);
    expect(dom.find('output').textContent).toContain('กำลังค้นหา');
    expect(users.searchPublicUsers).not.toHaveBeenCalled();
    await tick();
    expect(users.searchPublicUsers).toHaveBeenLastCalledWith(expect.objectContaining({ username: '', page: 1, sort: 'latest' }));
    expect(dom.container.textContent).toContain('พบ 4 บัญชี');
    await change(dom.find('input'), 'A');
    await change(dom.find('input'), 'Alice');
    expect(users.searchPublicUsers).toHaveBeenCalledTimes(1);
    await tick();
    expect(users.searchPublicUsers).toHaveBeenCalledTimes(2);
    await submit(dom.find('form'));
    await tick();
    expect(users.searchPublicUsers).toHaveBeenCalledTimes(3);
    await change(dom.find('select'), 'oldest');
    await tick();
    expect(users.searchPublicUsers).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'oldest' }));
    await click(dom.button('ถัดไป'));
    await tick();
    expect(users.searchPublicUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    await click(dom.button('ก่อนหน้า'));
    await tick();
    expect(users.searchPublicUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
    await change(dom.find('input'), ' Alice ');
    await submit(dom.find('form'));
    await tick();
    expect(users.searchPublicUsers).toHaveBeenLastCalledWith(expect.objectContaining({ username: 'Alice' }));
});

test('author search recovers from errors and supports responses without users or pagination', async () => {
    vi.useFakeTimers();
    users.searchPublicUsers.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({});
    await dom.render(<AuthorSearchPage />);
    await tick();
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถค้นหา');
    await submit(dom.find('form'));
    await tick();
    expect(dom.container.textContent).toContain('ไม่พบผู้ใช้');
    expect(dom.button('ถัดไป').disabled).toBe(true);
});

test.each(['resolve', 'reject'])('stale author search responses are ignored (%s)', async outcome => {
    vi.useFakeTimers();
    const request = deferred();
    users.searchPublicUsers.mockReturnValueOnce(request.promise);
    await dom.render(<AuthorSearchPage />);
    await tick();
    const signal = users.searchPublicUsers.mock.calls[0][0].signal;
    await change(dom.find('input'), 'New');
    expect(signal.aborted).toBe(true);
    await tick();
    await act(async () => outcome === 'resolve' ? request.resolve({ users: [{ id: 1, username: 'Stale' }] }) : request.reject(new Error('stale')));
    expect(dom.container.textContent).not.toContain('Stale');
    expect(dom.find('[role="alert"]')).toBeNull();
});

test('saved comics waits for authentication then shows favorites, retry and enriched cards', async () => {
    await dom.render(<SavedComicsPage kind="favorites" authReady={false} isLoggedIn />);
    expect(dom.find('output').textContent).toContain('กำลังตรวจสอบ');
    const request = deferred();
    comics.getMyFavorites.mockReturnValueOnce(request.promise);
    await dom.render(<SavedComicsPage kind="favorites" authReady isLoggedIn />);
    expect(dom.find('output').textContent).toContain('กำลังโหลด');
    await act(async () => request.reject(new Error('offline')));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลด');
    comics.getMyFavorites.mockResolvedValue([{ comic: { id: 1, title: 'Base' } }, { comic: { id: 2, title: 'Fallback' } }, {}]);
    comics.getComicDetail.mockResolvedValueOnce({ title: 'Detailed', rating: 4, coverImage: 'https://example.com/cover.png' }).mockRejectedValueOnce(new Error('offline'));
    await click(dom.button('ลองอีกครั้ง'));
    expect(dom.container.textContent).toContain('Detailed');
    expect(dom.container.textContent).toContain('Fallback');
    await dom.render(<SavedComicsPage kind="follows" authReady isLoggedIn />);
    expect(comics.getMyFollowedComics).toHaveBeenCalledOnce();
    expect(dom.container.textContent).toContain('ยังไม่มีการ์ตูนที่ติดตาม');
    comics.getMyFavorites.mockResolvedValue([]);
    await dom.render(<SavedComicsPage kind="favorites" authReady isLoggedIn />);
    expect(dom.container.textContent).toContain('ยังไม่มีการ์ตูนที่ชื่นชอบ');
});

test('public profile resolves user details across pages while keeping the comic list', async () => {
    const request = deferred();
    users.getPublicUserComics.mockReturnValueOnce(request.promise);
    users.searchPublicUsers.mockResolvedValueOnce({ users: [{ id: 9 }], pagination: { totalPages: 2 } })
        .mockResolvedValueOnce({ users: [{ id: 1, username: 'Alice', profileImage: 'https://example.com/avatar.png' }] });
    await dom.render(<ProfileContent userId="1" username="Alice" />);
    expect(dom.find('output').textContent).toContain('กำลังโหลดโปรไฟล์');
    await act(async () => request.resolve([{ id: 5, title: 'Story', coverImage: 'https://example.com/cover.png', description: 'Description', chapterCount: 2, viewCount: 100 }]));
    expect(users.searchPublicUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(dom.find('h1').textContent).toBe('Alice');
    expect(dom.find('a').getAttribute('href')).toBe('/comics/5');
    expect(dom.all('img')).toHaveLength(2);
});

test('public profiles handle empty results, detail lookup failures and unavailable comics', async () => {
    users.searchPublicUsers.mockRejectedValue(new Error('offline'));
    await dom.render(<ProfileContent userId="1" username="Alice" />);
    expect(dom.find('h1').textContent).toBe('ผู้ใช้ #1');
    expect(dom.container.textContent).toContain('ยังไม่มีผลงาน');
    users.getPublicUserComics.mockRejectedValue(new Error('offline'));
    await dom.render(<ProfileContent userId="2" />);
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลดโปรไฟล์');
});

test('filters normalize options and notify single and multiple selection', async () => {
    const onSelect = vi.fn();
    const options = ['Action', { id: 2, name: 'Drama' }, { slug: 'fun', title: 'Fun' }, { label: 'Custom' }, { label: 'Unnamed' }, { label: ' ' }];
    await dom.render(<FilterGroup title="Category" options={options} selectedValues={['Action']} onSelect={onSelect} />);
    await click(dom.button('Category'));
    expect(dom.container.textContent).not.toContain('Unnamed');
    expect(dom.container.textContent).toContain('✓');
    await click(dom.button('Drama'));
    expect(onSelect).toHaveBeenCalledWith('2');
    await dom.render(<FilterGroup title="Category" options={options} selectedValues={['Action']} onSelect={onSelect} multiSelect variant="sort" />);
    expect(dom.find('input').checked).toBe(true);
    await click(dom.find('input'));
    expect(onSelect).toHaveBeenLastCalledWith('Action');
    await dom.render(<FilterGroup title="Category" options={null} />);
    expect(dom.container.textContent).toContain('ไม่มีข้อมูล');
    await click(dom.button('Category'));
    expect(dom.container.textContent).not.toContain('ไม่มีข้อมูล');
});

test.each([['coin', '0 0 16 16'], ['search', '0 0 1024 1024'], ['user', '0 0 24 24'], ['chevron', '0 0 24 24'], ['unknown', null]])('icons select the correct coordinate system (%s)', async (name, viewBox) => {
    await dom.render(<Icon name={name} />);
    expect(dom.find('svg')?.getAttribute('viewBox') ?? null).toBe(viewBox);
});

test('shared buttons retain accessibility attributes and click behavior', async () => {
    const onClick = vi.fn();
    await dom.render(<Button buttonText="Open" icon="chevron" onClick={onClick} ariaLabel="Open menu" ariaExpanded variant="primary" />);
    expect(dom.find('button').getAttribute('aria-expanded')).toBe('true');
    expect(dom.find('button').getAttribute('aria-label')).toBe('Open menu');
    await click(dom.find('button'));
    expect(onClick).toHaveBeenCalledOnce();
});

test('comic sections render populated cards and expose retry actions', async () => {
    const onRetry = vi.fn();
    await dom.render(<ComicSection title="Comics" error="Offline" onRetry={onRetry} />);
    await click(dom.find('button'));
    expect(onRetry).toHaveBeenCalledOnce();
    await dom.render(<ComicSection title="Comics" comics={[{ id: 1, title: 'Story' }]} />);
    expect(dom.container.textContent).toContain('Story');
    expect(dom.find('a').getAttribute('href')).toContain('/comics/1');
});

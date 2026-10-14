// @vitest-environment jsdom
import { act } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import ChapterReaderPage from '../src/pages/comics/ChapterReaderPage';
import * as api from '../src/api/comicReaderApi';
import { setupTestDom, click, deferred } from './helpers/dom';

vi.mock('../src/api/comicReaderApi', () => ({ getChapterContent: vi.fn(), getComicDetail: vi.fn(), getChapterComments: vi.fn() }));
const dom = setupTestDom();
beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    api.getComicDetail.mockResolvedValue({ chapters: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    api.getChapterContent.mockImplementation(async id => ({ id, chapterNumber: Number(id), title: `Chapter ${id}`, pages: [{ id: 1, imageUrl: '/uploads/page.png' }, { imageUrl: 'https://example.com/page2.png' }] }));
    api.getChapterComments.mockResolvedValue([]);
});
function ReaderRoute({ isLoggedIn }) {
    const navigate = useNavigate();
    return <><button onClick={() => navigate('/comics/7/chapters/3')}>Jump</button><ChapterReaderPage isLoggedIn={isLoggedIn} /></>;
}
const renderReader = (id = 2, isLoggedIn = false) => dom.render(
    <Routes><Route path="/comics/:comicId/chapters/:chapterId" element={<ReaderRoute isLoggedIn={isLoggedIn} />} /></Routes>,
    [`/comics/7/chapters/${id}`],
);

test('reader fetches protected content, renders ordered pages and navigates between chapters', async () => {
    const request = deferred();
    api.getChapterContent.mockReturnValueOnce(request.promise);
    await renderReader();
    expect(dom.container.textContent).toContain('กำลังเปิดตอน');
    expect(dom.find('img')).toBeNull();
    await act(async () => request.resolve({ id: 2, chapterNumber: 2, title: 'Chapter 2', pages: [{ imageUrl: '/uploads/page.png' }] }));
    expect(api.getChapterContent).toHaveBeenCalledWith('2');
    expect(api.getComicDetail).toHaveBeenCalledWith('7');
    expect(dom.find('h1').textContent).toContain('Chapter 2');
    expect(dom.find('img').getAttribute('src')).toBe('/uploads/page.png');
    expect(dom.find('img').alt).toBe('หน้าที่ 1');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(dom.all('nav a').map(link => link.getAttribute('href'))).toEqual(['/comics/7/chapters/1', '/comics/7/chapters/3']);
    await click(dom.button('← ตอนก่อนหน้า'));
    expect(dom.find('h1').textContent).toContain('Chapter 1');
    expect(dom.button('← ตอนก่อนหน้า').disabled).toBe(true);
    await click(dom.button('ตอนถัดไป →'));
    await click(dom.button('ตอนถัดไป →'));
    expect(dom.find('h1').textContent).toContain('Chapter 3');
    expect(dom.button('ตอนถัดไป →').disabled).toBe(true);
});

test.each([[401, false], [403, true], [500, false]])('reader distinguishes authorization and network failures (%s)', async (status, isLoggedIn) => {
    api.getChapterContent.mockRejectedValue({ response: { status, data: { message: 'Unavailable' } } });
    await renderReader(2, isLoggedIn);
    expect(dom.find('img')).toBeNull();
    expect(Boolean(dom.find('a[href="/login"]'))).toBe(status === 401);
    expect(dom.container.textContent).toContain(status === 500 ? 'Unavailable' : 'ปลดล็อก');
});

test('reader handles empty content and missing chapter lists', async () => {
    api.getChapterContent.mockResolvedValue({ id: 2, title: 'Empty', chapterNumber: 2 });
    api.getComicDetail.mockResolvedValue({});
    await renderReader();
    expect(dom.container.textContent).toContain('ไม่มีรูปภาพในตอนนี้');
    expect(dom.container.textContent).toContain('0 หน้า');
    expect(dom.button('← ตอนก่อนหน้า').disabled).toBe(true);
    expect(dom.button('ตอนถัดไป →').disabled).toBe(true);
});

test.each(['resolve', 'reject'])('reader ignores old chapter requests after navigation (%s)', async outcome => {
    const request = deferred();
    api.getChapterContent.mockReturnValueOnce(request.promise);
    await renderReader();
    await click(dom.button('Jump'));
    await act(async () => outcome === 'resolve' ? request.resolve({ id: 2, title: 'Stale' }) : request.reject(new Error('Stale')));
    expect(dom.find('h1').textContent).toContain('Chapter 3');
    expect(dom.container.textContent).not.toContain('Stale');
});

test('reader clears a chapter error when navigating to an accessible chapter', async () => {
    api.getChapterContent.mockRejectedValueOnce(new Error('offline'));
    await renderReader();
    expect(dom.container.textContent).toContain('ไม่สามารถเปิดตอนนี้ได้');
    await click(dom.button('Jump'));
    expect(dom.find('h1').textContent).toContain('Chapter 3');
});

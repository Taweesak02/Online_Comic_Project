// @vitest-environment jsdom
import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import ChapterComments from '../src/components/comics/ChapterComments';
import ComicRating from '../src/components/comics/ComicRating';
import * as api from '../src/api/comicReaderApi';
import { setupTestDom, click, change, submit, deferred } from './helpers/dom';

vi.mock('../src/api/comicReaderApi', () => ({
    getChapterComments: vi.fn(), addChapterComment: vi.fn(), editChapterComment: vi.fn(), deleteChapterComment: vi.fn(),
    getMyComicRating: vi.fn(), rateComic: vi.fn(),
}));
const dom = setupTestDom();
const own = { id: 1, user: { id: 2, username: 'Reader', profileImage: 'https://example.com/avatar.png' }, content: 'First', createdAt: '2026-01-01T00:00:00Z' };
const other = { id: 3, userId: 4, content: 'Other' };
const renderComments = () => dom.render(<ChapterComments chapterId={5} isLoggedIn currentUser={{ id: 2 }} />);
beforeEach(() => {
    vi.resetAllMocks();
    api.getChapterComments.mockResolvedValue([own, other]);
    api.getMyComicRating.mockResolvedValue({ rating: 2 });
});

test('guests can read comments but receive a login link instead of a posting form', async () => {
    const request = deferred();
    api.getChapterComments.mockReturnValue(request.promise);
    await dom.render(<ChapterComments chapterId={5} isLoggedIn={false} />);
    expect(dom.container.textContent).toContain('กำลังโหลดความคิดเห็น');
    expect(dom.find('a').getAttribute('href')).toBe('/login');
    expect(dom.find('textarea')).toBeNull();
    await act(async () => request.resolve([]));
    expect(dom.container.textContent).toContain('ยังไม่มีความคิดเห็น');
});

test('comments post trimmed text, disable during submission and refresh the list', async () => {
    const request = deferred();
    api.addChapterComment.mockReturnValue(request.promise);
    await renderComments();
    expect(dom.all('article')).toHaveLength(2);
    expect(dom.all('button').filter(item => item.textContent === 'แก้ไข')).toHaveLength(1);
    expect(dom.find('img').alt).toBe('รูปโปรไฟล์ของ Reader');
    await change(dom.find('#chapter-comment'), '   ');
    await submit(dom.find('form'));
    expect(api.addChapterComment).not.toHaveBeenCalled();
    await change(dom.find('#chapter-comment'), ' New comment ');
    await submit(dom.find('form'));
    expect(api.addChapterComment).toHaveBeenCalledWith(5, 'New comment');
    expect(dom.button('กำลังส่ง...').disabled).toBe(true);
    api.getChapterComments.mockResolvedValue([own, other, { id: 6, content: 'New comment' }]);
    await act(async () => request.resolve());
    expect(dom.find('#chapter-comment').value).toBe('');
    expect(dom.all('article')).toHaveLength(3);
});

test('owners can cancel edits or save trimmed edits without changing other comments', async () => {
    await renderComments();
    await click(dom.button('แก้ไข'));
    await click(dom.button('ยกเลิก'));
    expect(dom.find('article textarea')).toBeNull();
    await click(dom.button('แก้ไข'));
    await change(dom.find('article textarea'), '  ');
    await submit(dom.find('article form'));
    expect(api.editChapterComment).not.toHaveBeenCalled();
    await change(dom.find('article textarea'), ' Updated ');
    const request = deferred();
    api.editChapterComment.mockReturnValue(request.promise);
    await submit(dom.find('article form'));
    expect(dom.button('กำลังบันทึก...').disabled).toBe(true);
    await act(async () => request.resolve());
    expect(api.editChapterComment).toHaveBeenCalledWith(1, 'Updated');
    expect(dom.find('article textarea')).toBeNull();
    expect(dom.all('article').map(item => item.textContent).join(' ')).toContain('Updated');
    expect(dom.all('article')[1].textContent).toContain('Other');
});

test('admins can delete other users comments after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await dom.render(<ChapterComments chapterId={5} isLoggedIn currentUser={{ id: 10, roleName: 'ADMIN' }} />);
    expect(dom.all('button').filter(item => item.textContent === 'ลบ')).toHaveLength(2);
    await click(dom.button('ลบ'));
    expect(api.deleteChapterComment).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await click(dom.button('ลบ'));
    expect(api.deleteChapterComment).toHaveBeenCalledWith(1);
    expect(dom.all('article')).toHaveLength(1);
});

test.each([false, true])('comment read errors show fallback or server messages (%s)', async server => {
    api.getChapterComments.mockRejectedValue(server ? { response: { data: { message: 'Read denied' } } } : new Error('offline'));
    await renderComments();
    expect(dom.find('[role="alert"]').textContent).toBe(server ? 'Read denied' : 'ไม่สามารถโหลดความคิดเห็นได้');
});

test.each(['add', 'edit', 'delete', 'refresh'])('failed comment %s preserves data and presents the error', async operation => {
    await renderComments();
    const error = { response: { data: { message: 'Request failed' } } };
    if (operation === 'add' || operation === 'refresh') {
        if (operation === 'add') api.addChapterComment.mockRejectedValue(error);
        else api.getChapterComments.mockRejectedValue(error);
        await change(dom.find('#chapter-comment'), 'Test');
        await submit(dom.find('form'));
    } else if (operation === 'edit') {
        api.editChapterComment.mockRejectedValue(error);
        await click(dom.button('แก้ไข'));
        await submit(dom.find('article form'));
        expect(dom.find('article textarea')).not.toBeNull();
    } else {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        api.deleteChapterComment.mockRejectedValue(error);
        await click(dom.button('ลบ'));
    }
    expect(dom.find('[role="alert"]').textContent).toBe('Request failed');
    expect(dom.all('article')).toHaveLength(2);
});

test.each(['resolve', 'reject'])('old chapter requests are ignored after navigation (%s)', async outcome => {
    const request = deferred();
    api.getChapterComments.mockReturnValueOnce(request.promise);
    await dom.render(<ChapterComments chapterId={1} />);
    api.getChapterComments.mockResolvedValue([]);
    await dom.render(<ChapterComments chapterId={2} />);
    await act(async () => outcome === 'resolve' ? request.resolve([own]) : request.reject(new Error('late')));
    expect(dom.all('article')).toHaveLength(0);
    expect(dom.find('[role="alert"]')).toBeNull();
});

test('guests cannot rate comics', async () => {
    await dom.render(<ComicRating comicId={1} isLoggedIn={false} />);
    expect(dom.find('a').getAttribute('href')).toBe('/login');
    expect(api.getMyComicRating).not.toHaveBeenCalled();
});

test('rating loads, previews on hover, submits and refreshes aggregate ratings', async () => {
    const onRated = vi.fn();
    const request = deferred();
    api.rateComic.mockReturnValue(request.promise);
    await dom.render(<ComicRating comicId={1} isLoggedIn onRated={onRated} />);
    expect(dom.all('button')[1].getAttribute('aria-pressed')).toBe('true');
    await act(async () => dom.all('button')[4].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(dom.all('button')[4].className).toContain('text-amber');
    await act(async () => dom.all('button')[4].dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    await click(dom.all('button')[3]);
    expect(dom.all('button').every(item => item.disabled)).toBe(true);
    await act(async () => request.resolve());
    expect(api.rateComic).toHaveBeenCalledWith(1, 4);
    expect(onRated).toHaveBeenCalledOnce();
    expect(dom.find('output').textContent).toContain('บันทึกคะแนน');
    expect(dom.all('button')[3].getAttribute('aria-pressed')).toBe('true');
});

test.each([404, 500])('rating read errors handle HTTP %s', async status => {
    api.getMyComicRating.mockRejectedValue({ response: { status } });
    await dom.render(<ComicRating comicId={1} isLoggedIn />);
    expect(Boolean(dom.find('[role="alert"]'))).toBe(status !== 404);
});

test('failed rating writes retain the previous selection and allow retry', async () => {
    api.rateComic.mockRejectedValue(new Error('offline'));
    await dom.render(<ComicRating comicId={1} isLoggedIn />);
    await click(dom.all('button')[4]);
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถบันทึกคะแนน');
    expect(dom.all('button')[1].getAttribute('aria-pressed')).toBe('true');
    expect(dom.all('button').some(item => item.disabled)).toBe(false);
});

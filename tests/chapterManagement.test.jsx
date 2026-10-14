// @vitest-environment jsdom
import { act } from 'react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import ChapterManagementPage from '../src/pages/comic-management/ChapterManagementPage';
import * as api from '../src/api/comicManagementApi';
import { setupTestDom, click, change, submit, upload, deferred } from './helpers/dom';

vi.mock('../src/api/comicManagementApi', () => ({
    createChapter: vi.fn(), deleteChapter: vi.fn(), getChapterPages: vi.fn(), getComicChapters: vi.fn(),
    getManagedComic: vi.fn(), replaceChapterPages: vi.fn(), updateChapter: vi.fn(), uploadChapterImage: vi.fn(),
}));
const dom = setupTestDom();
const chapter = { id: 4, title: 'Chapter', chapterNumber: 2, coinCost: 5, viewCount: 3 };
const page1 = { id: 1, imageUrl: 'https://example.com/1.png' };
const page2 = { id: 2, imageUrl: 'https://example.com/2.png' };
const render = () => dom.render(<Routes><Route path="/comic-management/:comicId/chapters" element={<ChapterManagementPage />} /></Routes>, ['/comic-management/7/chapters']);
beforeEach(() => {
    vi.resetAllMocks();
    api.getManagedComic.mockResolvedValue({ title: 'Story', coverImage: 'https://example.com/cover.png' });
    api.getComicChapters.mockResolvedValue([chapter]);
    api.getChapterPages.mockResolvedValue([page1, page2]);
    api.uploadChapterImage.mockImplementation(async file => `https://example.com/${file.name}`);
    class TestURL extends URL {
        static createObjectURL = vi.fn(file => `blob:${file.name}`);
        static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', TestURL);
});

test('new chapters choose the next number, require pages and upload them in order', async () => {
    await render();
    expect(dom.find('h1').textContent).toBe('Story');
    await click(dom.button('+ เพิ่มตอน'));
    expect(dom.find('[name="chapterNumber"]').value).toBe('3');
    await submit(dom.find('form'));
    expect(dom.container.textContent).toContain('กรุณาเลือกรูปภาพอย่างน้อย 1 หน้า');
    const files = [new File(['a'], 'a.png'), new File(['b'], 'b.png')];
    await upload(dom.find('[type="file"]'), files);
    await change(dom.find('[name="title"]'), 'New chapter');
    await change(dom.find('[name="coinCost"]'), '10');
    const request = deferred();
    api.createChapter.mockReturnValue(request.promise);
    await submit(dom.find('form'));
    expect(dom.button('กำลังบันทึก...').disabled).toBe(true);
    expect(api.createChapter).toHaveBeenCalledWith({ comicId: '7', chapterNumber: '3', title: 'New chapter', coinCost: '10', pages: ['https://example.com/a.png', 'https://example.com/b.png'] });
    await act(async () => request.resolve());
    expect(dom.find('dialog')).toBeNull();
    expect(api.getComicChapters).toHaveBeenCalledTimes(2);
});

test('editing metadata alone preserves page images without replacing them', async () => {
    await render();
    await click(dom.button('แก้ไข'));
    expect(dom.find('[name="title"]').value).toBe('Chapter');
    await change(dom.find('[name="title"]'), 'Edited');
    await submit(dom.find('form'));
    expect(api.updateChapter).toHaveBeenCalledWith(4, { chapterNumber: '2', title: 'Edited', coinCost: '5' });
    expect(api.replaceChapterPages).not.toHaveBeenCalled();
});

test('editing page images keeps remaining images first and appends new uploads', async () => {
    await render();
    await click(dom.button('แก้ไข'));
    await click(dom.find('[aria-label="ลบหน้าที่ 1"]'));
    await upload(dom.find('[type="file"]'), [new File(['new'], 'new.png')]);
    await submit(dom.find('form'));
    expect(api.replaceChapterPages).toHaveBeenCalledWith(4, [page2.imageUrl, 'https://example.com/new.png']);
});

test('removing all existing pages is rejected until a replacement is supplied', async () => {
    await render();
    await click(dom.button('แก้ไข'));
    await click(dom.find('[aria-label="ลบหน้าที่ 1"]'));
    await click(dom.find('[aria-label="ลบหน้าที่ 1"]'));
    await submit(dom.find('form'));
    expect(api.updateChapter).not.toHaveBeenCalled();
    expect(dom.container.textContent).toContain('ตอนการ์ตูนต้องมีรูปภาพอย่างน้อย 1 หน้า');
    await click(dom.button('ยกเลิก'));
    expect(dom.find('dialog')).toBeNull();
});

test('chapter deletion requires confirmation and refreshes the list on success', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await render();
    await click(dom.button('ลบ'));
    expect(api.deleteChapter).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    api.deleteChapter.mockRejectedValueOnce(new Error('offline'));
    await click(dom.button('ลบ'));
    expect(dom.container.textContent).toContain('ไม่สามารถลบตอนการ์ตูนได้');
    api.getComicChapters.mockResolvedValue([]);
    await click(dom.button('ลบ'));
    expect(api.deleteChapter).toHaveBeenCalledWith(4);
    expect(dom.container.textContent).toContain('ยังไม่มีตอน');
});

test.each(['load', 'pages', 'save'])('chapter management displays %s failures', async operation => {
    if (operation === 'load') api.getManagedComic.mockRejectedValue(new Error('offline'));
    await render();
    if (operation === 'pages') {
        api.getChapterPages.mockRejectedValue(new Error('offline'));
        await click(dom.button('แก้ไข'));
    } else if (operation === 'save') {
        api.updateChapter.mockRejectedValue(new Error('offline'));
        await click(dom.button('แก้ไข'));
        await submit(dom.find('form'));
        expect(dom.find('[type="submit"]').disabled).toBe(false);
    }
    expect(dom.container.textContent).toContain('ไม่สามารถ');
});

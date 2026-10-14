// @vitest-environment jsdom
import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import ComicManagementPage from '../src/pages/comic-management/ComicManagementPage';
import ComicEditorForm from '../src/pages/comic-management/components/comic/ComicEditorForm';
import ChapterEditorModal from '../src/pages/comic-management/components/chapter/ChapterEditorModal';
import * as api from '../src/api/comicManagementApi';
import { getSearchFilterOptions } from '../src/api/searchApi';
import { setupTestDom, click, change, submit, upload, deferred } from './helpers/dom';

vi.mock('../src/api/comicManagementApi', () => ({
    getMyComics: vi.fn(), getComicOverview: vi.fn(), resubmitComic: vi.fn(),
    createComic: vi.fn(), editComic: vi.fn(), uploadCoverImage: vi.fn(), deleteComic: vi.fn(),
}));
vi.mock('../src/api/searchApi', () => ({ getSearchFilterOptions: vi.fn() }));
const dom = setupTestDom();
const comic = { id: 1, title: 'Comic', approved: 'UNAPPROVED' };
beforeEach(() => {
    vi.resetAllMocks();
    api.getMyComics.mockResolvedValue([comic, { id: 2, title: 'Hidden', isActive: false }]);
    api.getComicOverview.mockResolvedValue({ totalComics: 2, totalChapters: 10, totalViews: 1000, averageRating: 4.25 });
    getSearchFilterOptions.mockResolvedValue({ categories: [{ value: 1, label: 'Action' }], tags: [{ value: 2, label: 'Popular' }] });
    class TestURL extends URL {
        static createObjectURL = vi.fn(() => 'blob:preview');
        static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', TestURL);
});

test('creator dashboard navigates between active, review and inactive lists', async () => {
    await dom.render(<ComicManagementPage />);
    expect(dom.container.textContent).toContain('4.3');
    expect(dom.container.textContent).toContain('1,000');
    expect(dom.container.textContent).toContain('—');
    await click(dom.all('button').find(item => item.textContent.includes('อนุมัติและเปิดใช้งาน')));
    expect(dom.all('article')).toHaveLength(2);
    await click(dom.all('nav button').find(item => item.textContent.includes('การพิจารณา')));
    expect(dom.all('article')).toHaveLength(1);
    expect(dom.find('article').textContent).toContain('Comic');
    await click(dom.all('nav button').find(item => item.textContent.includes('ปิดใช้งานแล้ว')));
    expect(dom.all('article')).toHaveLength(1);
    expect(dom.find('article').textContent).toContain('Hidden');
});

test('creator page exposes loading, request errors and overview retry', async () => {
    const request = deferred();
    api.getMyComics.mockReturnValue(request.promise);
    api.getComicOverview.mockRejectedValue(new Error('offline'));
    await dom.render(<ComicManagementPage />);
    expect(dom.find('output').textContent).toContain('กำลังโหลดการ์ตูน');
    await act(async () => request.reject(new Error('offline')));
    expect(dom.all('[role="alert"]')).toHaveLength(2);
    api.getComicOverview.mockResolvedValue({ totalComics: 4 });
    await click(dom.button('ลองอีกครั้ง'));
    expect(dom.all('[role="alert"]')).toHaveLength(1);
});

test('creator can resubmit rejected work and receives success or error feedback', async () => {
    api.resubmitComic.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ approved: 'RESUBMIT' });
    await dom.render(<ComicManagementPage />, ['/?section=review']);
    await click(dom.button('ส่งพิจารณาใหม่'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถส่งการ์ตูน');
    await click(dom.button('ส่งพิจารณาใหม่'));
    expect(api.resubmitComic).toHaveBeenCalledWith(1);
    expect(dom.find('output').textContent).toContain('พิจารณาใหม่แล้ว');
    expect(dom.button('ส่งพิจารณาใหม่')).toBeUndefined();
});

test('creating a comic through the page closes the editor and refreshes data', async () => {
    await dom.render(<ComicManagementPage />, ['/?section=comics']);
    await click(dom.button('+ สร้างการ์ตูน'));
    expect(dom.find('dialog').open).toBe(true);
    await change(dom.find('input[name="title"]'), ' New story ');
    await submit(dom.find('form'));
    expect(api.createComic).toHaveBeenCalledWith(expect.objectContaining({ title: 'New story' }));
    expect(dom.find('dialog')).toBeNull();
    expect(dom.find('output').textContent).toBe('สร้างการ์ตูนสำเร็จ');
    expect(api.getMyComics).toHaveBeenCalledTimes(2);
    await click(dom.find('article > button'));
    expect(dom.find('dialog').getAttribute('aria-label')).toBe('แก้ไขการ์ตูน');
    await click(dom.button('ยกเลิก'));
    expect(dom.find('dialog')).toBeNull();
});

test('comic editor validates titles and uploads cover files with selected categories and tags', async () => {
    const onSuccess = vi.fn();
    api.uploadCoverImage.mockResolvedValue('/uploads/cover.png');
    const request = deferred();
    api.createComic.mockReturnValue(request.promise);
    await dom.render(<ComicEditorForm onSuccess={onSuccess} />);
    await submit(dom.find('form'));
    expect(dom.find('[role="alert"]').textContent).toContain('กรุณากรอกชื่อเรื่อง');
    expect(api.createComic).not.toHaveBeenCalled();
    await change(dom.find('[name="title"]'), ' New story ');
    await change(dom.find('textarea'), ' Description ');
    await click(dom.button('Action'));
    await click(dom.button('Popular'));
    await click(dom.button('Popular'));
    const file = new File(['cover'], 'cover.png', { type: 'image/png' });
    await upload(dom.find('[type="file"]'), [file]);
    expect(dom.find('img').src).toBe('blob:preview');
    expect(dom.container.textContent).toContain('cover.png');
    await submit(dom.find('form'));
    expect(dom.button('กำลังบันทึก...').disabled).toBe(true);
    await submit(dom.find('form'));
    expect(api.createComic).toHaveBeenCalledOnce();
    expect(api.uploadCoverImage).toHaveBeenCalledWith(file);
    expect(api.createComic).toHaveBeenCalledWith({ title: 'New story', description: 'Description', coverImage: '/uploads/cover.png', categoryIds: [1], tagIds: [] });
    await act(async () => request.resolve());
    expect(onSuccess).toHaveBeenCalledWith('สร้างการ์ตูนสำเร็จ');
    await upload(dom.find('[type="file"]'), []);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
});

test('comic edits retain existing cover, update status and report failed saves', async () => {
    const onSuccess = vi.fn();
    api.editComic.mockRejectedValueOnce({ response: { data: { message: 'Title exists' } } });
    await dom.render(<ComicEditorForm comic={{ ...comic, coverImage: 'https://example.com/cover.png', categories: [{ id: 1 }] }} onSuccess={onSuccess} />);
    expect(dom.button('บันทึกการแก้ไข')).toBeDefined();
    await change(dom.find('select'), 'COMPLETED');
    await submit(dom.find('form'));
    expect(dom.find('[role="alert"]').textContent).toBe('Title exists');
    expect(onSuccess).not.toHaveBeenCalled();
    await submit(dom.find('form'));
    expect(api.editComic).toHaveBeenLastCalledWith(1, expect.objectContaining({ status: 'COMPLETED', coverImage: 'https://example.com/cover.png' }));
    expect(onSuccess).toHaveBeenCalledWith('อัปเดตการ์ตูนสำเร็จ');
});

test('comic deletion requires confirmation and keeps the editor usable after failures', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onSuccess = vi.fn();
    api.deleteComic.mockRejectedValueOnce(new Error('offline'));
    await dom.render(<ComicEditorForm comic={comic} onSuccess={onSuccess} />);
    await click(dom.button('ปิดใช้งานการ์ตูน'));
    expect(api.deleteComic).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await click(dom.button('ปิดใช้งานการ์ตูน'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถปิดใช้งาน');
    await click(dom.button('ปิดใช้งานการ์ตูน'));
    expect(onSuccess).toHaveBeenCalledWith('ปิดใช้งานการ์ตูนสำเร็จ');
});

test('Escape requests modal closure and unmount closes the native dialog', async () => {
    const onClose = vi.fn();
    getSearchFilterOptions.mockRejectedValue(new Error('offline'));
    await dom.render(<ComicEditorForm onClose={onClose} />);
    const dialog = dom.find('dialog');
    expect(dialog.open).toBe(true);
    expect(dom.container.textContent).toContain('ไม่มีข้อมูลหมวดหมู่');
    const cancel = new Event('cancel', { cancelable: true });
    await act(async () => dialog.dispatchEvent(cancel));
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    await dom.render(<p>Closed</p>);
    expect(dialog.open).toBe(false);
});

test('chapter editor preserves page order, deletes existing pages and releases preview URLs', async () => {
    const onFilesChange = vi.fn();
    const onRemoveExistingPage = vi.fn();
    const props = { form: { chapterNumber: 1, coinCost: 0, title: 'Chapter' }, files: [], existingPages: [{ imageUrl: 'https://example.com/page.png' }], isEdit: true, onChange: vi.fn(), onFilesChange, onRemoveExistingPage, onCancel: vi.fn(), onSubmit: vi.fn(event => event.preventDefault()) };
    await dom.render(<ChapterEditorModal {...props} />);
    expect(dom.button('บันทึกการแก้ไข')).toBeDefined();
    await click(dom.find('[aria-label="ลบหน้าที่ 1"]'));
    expect(onRemoveExistingPage).toHaveBeenCalledWith('https://example.com/page.png');
    const file = new File(['page'], 'page.png', { type: 'image/png' });
    await upload(dom.find('[type="file"]'), [file]);
    expect(onFilesChange).toHaveBeenCalledWith([file]);
    await dom.render(<ChapterEditorModal {...props} files={[file]} saving />);
    expect(dom.find('img[alt="รูปใหม่ 1"]').src).toBe('blob:preview');
    expect(dom.button('กำลังบันทึก...').disabled).toBe(true);
    await dom.render(<ChapterEditorModal {...props} />);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview', 0, ['blob:preview']);
});

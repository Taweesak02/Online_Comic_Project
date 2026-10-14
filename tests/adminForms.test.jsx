// @vitest-environment jsdom
import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import PackageManagement from '../src/pages/admin-management/components/PackageManagement';
import PaymentMethodManagement from '../src/pages/admin-management/components/PaymentMethodManagement';
import UserManagement from '../src/pages/admin-management/components/UserManagement';
import ComicApprovalManagement from '../src/pages/admin-management/components/ComicApprovalManagement';
import * as api from '../src/api/adminManagementApi';
import { setupTestDom, click, change, submit, deferred } from './helpers/dom';

vi.mock('../src/api/adminManagementApi', () => ({
    searchAdminUsers: vi.fn(), banUser: vi.fn(), unbanUser: vi.fn(),
    searchAdminComics: vi.fn(), approveComic: vi.fn(), unapproveComic: vi.fn(),
}));
const dom = setupTestDom();
beforeEach(() => vi.resetAllMocks());

test.each([
    [PackageManagement, 'packages', { id: 1, name: 'Starter', coinAmount: 100, price: 50 }, 'แก้ไขแพ็กเกจ', 'บันทึกแพ็กเกจ', 'ลบแพ็กเกจ'],
    [PaymentMethodManagement, 'paymentMethods', { id: 1, name: 'Bank', code: 'BANK', promptPayId: '012345' }, 'แก้ไข', 'บันทึกช่องทาง', 'ลบ'],
])('admin editors create, edit, cancel and delete (%s)', async (Component, prop, item, editLabel, saveLabel, deleteLabel) => {
    const onSave = vi.fn().mockResolvedValue(true);
    const onDelete = vi.fn().mockResolvedValue(true);
    const props = { [prop]: [item], onSave, onDelete };
    await dom.render(<Component {...props} />);
    for (const input of dom.all('input')) await change(input, input.type === 'number' ? '12' : 'new');
    await submit(dom.find('form'));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'new' }), null);
    expect(dom.find('input').value).toBe('');
    await click(dom.button(editLabel));
    expect(dom.find('input').value).toBe(item.name);
    expect(dom.button(saveLabel)).toBeDefined();
    onSave.mockResolvedValue(false);
    await submit(dom.find('form'));
    expect(dom.find('input').value).toBe(item.name);
    await click(dom.button('ยกเลิก'));
    expect(dom.find('input').value).toBe('');
    await click(dom.button(editLabel));
    await click(dom.button(deleteLabel));
    expect(onDelete).toHaveBeenCalledWith(item);
    expect(dom.find('input').value).toBe('');
    await dom.render(<Component {...props} submitting />);
    expect(dom.button('กำลังบันทึก...').disabled).toBe(true);
    await dom.render(<Component {...props} {...{ [prop]: [] }} />);
    expect(dom.container.textContent).toContain('ยังไม่มี');
});

test('payment methods uppercase codes and reject incomplete forms', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    await dom.render(<PaymentMethodManagement paymentMethods={[]} onSave={onSave} />);
    expect(dom.find('[type="submit"]').disabled).toBe(true);
    await change(dom.all('input')[0], 'Bank');
    await change(dom.all('input')[1], 'bank');
    expect(dom.all('input')[1].value).toBe('BANK');
    expect(dom.find('[type="submit"]').disabled).toBe(false);
});

test('user search paginates and retains moderated users even if the API omits them', async () => {
    const users = [{ id: 1, username: 'Alice' }, { id: 2, username: 'Bob', status: 'banned' }];
    api.searchAdminUsers.mockResolvedValue({ users, pagination: { page: 2, totalPages: 3, total: 42 } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await dom.render(<UserManagement />);
    await change(dom.find('input'), 'Alice');
    await submit(dom.find('form'));
    expect(api.searchAdminUsers).toHaveBeenCalledWith('Alice', 1);
    await click(dom.button('ถัดไป'));
    expect(api.searchAdminUsers).toHaveBeenLastCalledWith('Alice', 3);
    await click(dom.button('ก่อนหน้า'));
    expect(api.searchAdminUsers).toHaveBeenLastCalledWith('Alice', 1);
    await click(dom.button('ระงับบัญชี'));
    expect(api.banUser).toHaveBeenCalledWith(1);
    expect(dom.find('output').textContent).toContain('สำเร็จ');
    api.searchAdminUsers.mockResolvedValue({ users: [], pagination: { page: 1, totalPages: 1 } });
    await submit(dom.find('form'));
    expect(dom.all('li')).toHaveLength(1);
    expect(dom.all('li')[0].textContent).toContain('Alice');
    await click(dom.button('ยกเลิกการระงับ'));
    expect(api.unbanUser).toHaveBeenCalledWith(1);
    await change(dom.find('input'), 'Nobody');
    await submit(dom.find('form'));
    expect(dom.container.textContent).toContain('ไม่พบผู้ใช้');
});

test('user moderation respects cancellation and displays request errors', async () => {
    api.searchAdminUsers.mockResolvedValue({ users: [{ id: 1, username: 'Alice' }] });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await dom.render(<UserManagement />);
    await submit(dom.find('form'));
    expect(dom.button('ก่อนหน้า').disabled).toBe(true);
    expect(dom.button('ถัดไป').disabled).toBe(true);
    await click(dom.button('ระงับบัญชี'));
    expect(api.banUser).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    api.banUser.mockRejectedValue(new Error('offline'));
    await click(dom.button('ระงับบัญชี'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สำเร็จ');
    api.searchAdminUsers.mockRejectedValue({ response: { data: { message: 'Search failed' } } });
    await submit(dom.find('form'));
    expect(dom.find('[role="alert"]').textContent).toBe('Search failed');
});

test('user searches show busy state while pending', async () => {
    const request = deferred();
    api.searchAdminUsers.mockReturnValue(request.promise);
    await dom.render(<UserManagement />);
    await submit(dom.find('form'));
    expect(dom.find('input').disabled).toBe(true);
    expect(dom.find('output').textContent).toContain('กำลังดำเนินการ');
    await act(async () => request.resolve({}));
    expect(dom.find('input').disabled).toBe(false);
});

test('comic moderation searches, paginates, approves and unapproves', async () => {
    api.searchAdminComics.mockResolvedValue({ comics: [{ id: 1, title: 'Comic', approved: 'UNAPPROVED' }, { id: 2, title: 'Other', approved: 'UNKNOWN', isActive: false }], pagination: { page: 2, totalPages: 3 } });
    api.approveComic.mockResolvedValue({ approved: 'APPROVED' });
    api.unapproveComic.mockResolvedValue({ approved: 'UNAPPROVED' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await dom.render(<ComicApprovalManagement />);
    await change(dom.find('input'), 'Comic');
    await submit(dom.find('form'));
    expect(api.searchAdminComics).toHaveBeenCalledWith('Comic', 1, '');
    await click(dom.button('ถัดไป'));
    expect(api.searchAdminComics).toHaveBeenLastCalledWith('Comic', 3, '');
    await click(dom.button('ก่อนหน้า'));
    expect(api.searchAdminComics).toHaveBeenLastCalledWith('Comic', 1, '');
    await click(dom.button('อนุมัติ'));
    expect(api.approveComic).toHaveBeenCalledWith(1);
    await click(dom.button('ยกเลิกการอนุมัติ'));
    expect(api.unapproveComic).toHaveBeenCalledWith(1);
    expect(dom.find('output').textContent).toContain('สำเร็จ');
});

test('comic searches and moderation handle errors and confirmation cancellation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    api.searchAdminComics.mockResolvedValue({ comics: [{ id: 1, title: 'Comic', approved: 'UNAPPROVED' }] });
    await dom.render(<ComicApprovalManagement />);
    await submit(dom.find('form'));
    await click(dom.button('อนุมัติ'));
    expect(api.approveComic).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    api.approveComic.mockRejectedValue(new Error('offline'));
    await click(dom.button('อนุมัติ'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สำเร็จ');
    api.searchAdminComics.mockRejectedValue(new Error('offline'));
    await submit(dom.find('form'));
    expect(dom.find('[role="alert"]').textContent).toContain('ค้นหาการ์ตูนไม่สำเร็จ');
});

test('resubmission moderation refreshes results and moves back from an empty last page', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.searchAdminComics.mockResolvedValue({ comics: [{ id: 1, title: 'Comic', approved: 'RESUBMIT' }], pagination: { page: 2, totalPages: 2 } });
    await dom.render(<ComicApprovalManagement />);
    await click(dom.button('ส่งพิจารณาใหม่ (RESUBMIT)'));
    expect(api.searchAdminComics).toHaveBeenCalledWith('', 1, 'RESUBMIT');
    api.searchAdminComics.mockResolvedValueOnce({ comics: [], pagination: { page: 2, totalPages: 1 } })
        .mockResolvedValueOnce({ comics: [], pagination: { page: 1, totalPages: 1 } });
    await click(dom.button('อนุมัติ'));
    expect(api.searchAdminComics).toHaveBeenLastCalledWith('', 1, 'RESUBMIT');
    expect(dom.container.textContent).toContain('ไม่พบการ์ตูนที่ส่งพิจารณาใหม่');
});

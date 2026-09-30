// @vitest-environment jsdom
import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import AdminManagementPage from '../src/pages/admin-management/AdminManagementPage';
import * as api from '../src/api/adminManagementApi';
import { setupTestDom, click, change, submit, deferred } from './helpers/dom';

vi.mock('../src/api/adminManagementApi', () => ({
    getAdminManagementData: vi.fn(), getAdminDashboardData: vi.fn(),
    createCategory: vi.fn(), editCategory: vi.fn(), deleteCategory: vi.fn(),
    createTag: vi.fn(), editTag: vi.fn(), deleteTag: vi.fn(),
    createCoinPackage: vi.fn(), editCoinPackage: vi.fn(), deleteCoinPackage: vi.fn(),
    createPaymentMethod: vi.fn(), editPaymentMethod: vi.fn(), deletePaymentMethod: vi.fn(),
    searchAdminUsers: vi.fn(), searchAdminComics: vi.fn(),
}));
const dom = setupTestDom();
beforeEach(() => {
    vi.resetAllMocks();
    api.getAdminManagementData.mockResolvedValue({ categories: [{ id: 1, name: 'Action' }], tags: [{ id: 2, name: 'New' }], packages: [{ id: 3, name: 'Starter', coinAmount: 10, price: 5 }], paymentMethods: [{ id: 4, name: 'Bank', code: 'BANK' }] });
    api.getAdminDashboardData.mockResolvedValue({ users: { total: 2000, active: 'invalid', banned: null, newToday: '' }, commerce: { totalRevenue: 50 } });
});
const section = async label => click(dom.all('nav button').find(item => item.textContent.includes(label)));

test('admin dashboard waits for permissions and data and formats missing metrics', async () => {
    await dom.render(<AdminManagementPage authReady={false} isAdmin={false} />);
    expect(dom.container.textContent).toContain('กำลังตรวจสอบสิทธิ์');
    expect(api.getAdminManagementData).not.toHaveBeenCalled();
    const request = deferred();
    api.getAdminManagementData.mockReturnValueOnce(request.promise);
    await dom.render(<AdminManagementPage authReady isAdmin />);
    expect(dom.container.textContent).toContain('กำลังโหลดข้อมูล');
    await act(async () => request.resolve({ categories: [], tags: [], packages: [], paymentMethods: [] }));
    expect(dom.container.textContent).toContain('2,000');
    expect(dom.container.textContent).toContain('฿50.00');
    expect(dom.container.textContent).toContain('—');
});

test.each([['หมวดหมู่', 'Category'], ['แท็ก', 'Tag']])('taxonomy changes trim names, refresh data and require deletion confirmation (%s)', async (label, resource) => {
    await dom.render(<AdminManagementPage authReady isAdmin />);
    await section('แท็กและหมวดหมู่');
    const input = dom.find(`[aria-label="ชื่อ${label}"]`);
    const panel = input.closest('section');
    const form = input.closest('form');
    await change(input, '  ');
    await submit(form);
    expect(api[`create${resource}`]).not.toHaveBeenCalled();
    await change(input, ' New label ');
    await submit(form);
    expect(api[`create${resource}`]).toHaveBeenCalledWith('New label');
    expect(input.value).toBe('');
    const find = text => [...panel.querySelectorAll('button')].find(item => item.textContent.trim() === text);
    await click(find('แก้ไข'));
    await click(find('ยกเลิก'));
    await click(find('แก้ไข'));
    await change(panel.querySelectorAll('input')[1], ' Edited ');
    await submit(panel.querySelectorAll('form')[1]);
    expect(api[`edit${resource}`]).toHaveBeenCalledWith(resource === 'Category' ? 1 : 2, 'Edited');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await click(find('ลบ'));
    expect(api[`delete${resource}`]).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await click(find('ลบ'));
    expect(api[`delete${resource}`]).toHaveBeenCalledWith(resource === 'Category' ? 1 : 2);
    expect(dom.find('output').textContent).toContain('สำเร็จ');
});

test.each([
    ['แพ็กเกจ', 'CoinPackage', 'แก้ไขแพ็กเกจ', 'ลบแพ็กเกจ', 3],
    ['ช่องทางชำระเงิน', 'PaymentMethod', 'แก้ไข', 'ลบ', 4],
])('admin creates, edits and removes %s', async (label, resource, editLabel, deleteLabel, id) => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await dom.render(<AdminManagementPage authReady isAdmin />);
    await section(label);
    for (const input of dom.all('form input')) await change(input, input.type === 'number' ? '10' : 'NEW');
    await submit(dom.find('form'));
    expect(api[`create${resource}`]).toHaveBeenCalled();
    await click(dom.button(editLabel));
    await submit(dom.find('form'));
    expect(api[`edit${resource}`]).toHaveBeenCalledWith(id, expect.objectContaining({ name: resource === 'CoinPackage' ? 'Starter' : 'Bank' }));
    await click(dom.button(deleteLabel));
    expect(api[`delete${resource}`]).toHaveBeenCalledWith(id);
});

test('admin load/save/delete failures show errors and failed saves retain input', async () => {
    api.getAdminManagementData.mockRejectedValueOnce(new Error('offline'));
    await dom.render(<AdminManagementPage authReady isAdmin />);
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลดข้อมูล');
    await section('แท็กและหมวดหมู่');
    api.createCategory.mockRejectedValueOnce({ response: { data: { message: 'Duplicate name' } } });
    const input = dom.find('[aria-label="ชื่อหมวดหมู่"]');
    await change(input, 'Action');
    await submit(input.closest('form'));
    expect(input.value).toBe('Action');
    expect(dom.find('[role="alert"]').textContent).toBe('Duplicate name');
    await submit(input.closest('form'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.deleteCategory.mockRejectedValueOnce(new Error('offline'));
    await click(dom.button('ลบ'));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถลบ');
    await section('จัดการผู้ใช้');
    expect(dom.find('[role="alert"]')).toBeNull();
    expect(dom.find('#admin-user-search')).not.toBeNull();
    await section('จัดการการ์ตูน');
    expect(dom.find('#admin-comic-search')).not.toBeNull();
});

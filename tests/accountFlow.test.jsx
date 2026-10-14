// @vitest-environment jsdom
import { act } from 'react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import LoginPage from '../src/pages/auth/LoginPage';
import RegisterPage from '../src/pages/auth/RegisterPage';
import ProfilePage from '../src/pages/profile/ProfilePage';
import * as auth from '../src/pages/auth/services/authApi';
import * as profile from '../src/api/profileApi';
import { setupTestDom, change, submit, upload, deferred } from './helpers/dom';

vi.mock('../src/pages/auth/services/authApi', () => ({ login: vi.fn(), register: vi.fn() }));
vi.mock('../src/api/profileApi', () => ({ getProfile: vi.fn(), updateProfile: vi.fn(), uploadProfileImage: vi.fn(), updateEmail: vi.fn(), changePassword: vi.fn() }));
const dom = setupTestDom();
beforeEach(() => {
    vi.resetAllMocks();
    profile.getProfile.mockResolvedValue({ id: 1, username: 'Alice', email: 'alice@example.com' });
    class TestURL extends URL {
        static createObjectURL = vi.fn(() => 'blob:avatar');
        static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', TestURL);
});

test.each([[LoginPage, 'login'], [RegisterPage, 'register']])('authentication submits credentials and navigates after success (%s)', async (Component, action) => {
    const onAuthenticated = vi.fn();
    const request = deferred();
    auth[action].mockReturnValue(request.promise);
    await dom.render(<Routes><Route path="/auth" element={<Component onAuthenticated={onAuthenticated} />} /><Route path="/" element={<p>Home</p>} /></Routes>, ['/auth']);
    const fields = { username: 'Alice', email: 'alice@example.com', password: 'secret12', confirmPassword: 'secret12' };
    for (const input of dom.all('input')) await change(input, fields[input.name]);
    await submit(dom.find('form'));
    expect(dom.find('[type="submit"]').disabled).toBe(true);
    const expected = { email: fields.email, password: fields.password };
    if (action === 'register') expected.username = fields.username;
    expect(auth[action]).toHaveBeenCalledWith(expected);
    const user = { id: 1, username: 'Alice' };
    await act(async () => request.resolve(user));
    expect(onAuthenticated).toHaveBeenCalledWith(user);
    expect(dom.container.textContent).toBe('Home');
});

test.each([[LoginPage, 'login'], [RegisterPage, 'register']])('authentication errors keep the form available (%s)', async (Component, action) => {
    auth[action].mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    await dom.render(<Component />);
    await submit(dom.find('form'));
    expect(dom.find('[role="alert"]').textContent).toBe('Invalid credentials');
    expect(dom.find('[type="submit"]').disabled).toBe(false);
});

test('registration rejects mismatched passwords before making a request', async () => {
    await dom.render(<RegisterPage />);
    await change(dom.find('[name="password"]'), 'secret12');
    await submit(dom.find('form'));
    expect(auth.register).not.toHaveBeenCalled();
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่ตรงกัน');
});

test('profile waits for auth and profile data and displays loading errors', async () => {
    const request = deferred();
    profile.getProfile.mockReturnValue(request.promise);
    await dom.render(<ProfilePage authReady={false} isLoggedIn={false} />);
    expect(dom.container.textContent).toContain('กำลังตรวจสอบบัญชี');
    await dom.render(<ProfilePage authReady isLoggedIn />);
    expect(dom.container.textContent).toContain('กำลังโหลดโปรไฟล์');
    await act(async () => request.reject(new Error('offline')));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลดข้อมูลผู้ใช้');
    expect(dom.find('aside').textContent).toContain('?');
});

test('profile uploads an avatar, trims the username and informs the session of changes', async () => {
    const onUserChange = vi.fn();
    const user = { id: 1, username: 'New name', profileImage: 'https://example.com/avatar.png' };
    profile.uploadProfileImage.mockResolvedValue(user.profileImage);
    const request = deferred();
    profile.updateProfile.mockReturnValue(request.promise);
    await dom.render(<ProfilePage authReady isLoggedIn onUserChange={onUserChange} />);
    const form = dom.all('form')[0];
    await change(form.querySelector('input'), '   ');
    await submit(form);
    expect(profile.updateProfile).not.toHaveBeenCalled();
    await change(form.querySelector('input'), ' New name ');
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    await upload(dom.find('[type="file"]'), [file]);
    expect(dom.find('img').src).toBe('blob:avatar');
    await submit(form);
    expect(form.querySelector('button').disabled).toBe(true);
    expect(profile.uploadProfileImage).toHaveBeenCalledWith(file);
    expect(profile.updateProfile).toHaveBeenCalledWith({ username: 'New name', profileImage: user.profileImage });
    await act(async () => request.resolve({ user }));
    expect(onUserChange).toHaveBeenCalledWith(user);
    expect(dom.find('img').src).toBe(user.profileImage);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(dom.find('output').textContent).toContain('สำเร็จ');
    await upload(dom.find('[type="file"]'), []);
});

test('email changes send the password and clear it only after success', async () => {
    const request = deferred();
    profile.updateEmail.mockReturnValue(request.promise);
    await dom.render(<ProfilePage authReady isLoggedIn />);
    const form = dom.all('form')[1];
    await change(form.querySelector('[type="email"]'), 'new@example.com');
    await change(form.querySelector('[type="password"]'), 'secret12');
    await submit(form);
    expect(form.querySelector('button').disabled).toBe(true);
    expect(profile.updateEmail).toHaveBeenCalledWith({ newEmail: 'new@example.com', currentPassword: 'secret12' });
    await act(async () => request.resolve({}));
    expect(form.querySelector('[type="password"]').value).toBe('');
    expect(dom.find('output').textContent).toContain('แก้ไขอีเมลสำเร็จ');
});

test('password changes validate confirmation and clear all password fields on success', async () => {
    const request = deferred();
    profile.changePassword.mockReturnValue(request.promise);
    await dom.render(<ProfilePage authReady isLoggedIn />);
    const form = dom.all('form')[2];
    const inputs = form.querySelectorAll('input');
    await change(inputs[0], 'old-password');
    await change(inputs[1], 'new-password');
    await submit(form);
    expect(profile.changePassword).not.toHaveBeenCalled();
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่ตรงกัน');
    await change(inputs[2], 'new-password');
    await submit(form);
    expect(form.querySelector('button').disabled).toBe(true);
    expect(profile.changePassword).toHaveBeenCalledWith({ currentPassword: 'old-password', newPassword: 'new-password', confirmPassword: 'new-password' });
    await act(async () => request.resolve());
    expect([...inputs].every(input => input.value === '')).toBe(true);
    expect(dom.find('output').textContent).toContain('เปลี่ยนรหัสผ่านสำเร็จ');
});

test.each([[0, 'updateProfile'], [1, 'updateEmail'], [2, 'changePassword']])('failed account update keeps the form usable (%s)', async (index, action) => {
    profile[action].mockRejectedValue(new Error('offline'));
    await dom.render(<ProfilePage authReady isLoggedIn />);
    const form = dom.all('form')[index];
    await submit(form);
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถ');
    expect(form.querySelector('button').disabled).toBe(false);
});

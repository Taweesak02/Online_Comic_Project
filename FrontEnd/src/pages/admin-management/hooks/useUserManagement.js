import { useState } from 'react';
import { banUser, searchAdminUsers, unbanUser } from '../../../api/adminManagementApi';

export default function useUserManagement() {
    const [keyword, setKeyword] = useState('');
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [moderatedUsers, setModeratedUsers] = useState({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const isBanned = (user) => user.status === 'banned' || user.isBanned === true || user.banned === true;

    const search = async (page = 1, username = query) => {
        setBusy(true); setError(''); setMessage('');
        try {
            const next = await searchAdminUsers(username, page);
            const users = (next.users ?? []).map((user) => ({
                ...user,
                status: moderatedUsers[user.id]?.status ?? (isBanned(user) ? 'banned' : 'active'),
            }));
            const knownUsers = Object.values(moderatedUsers)
                .filter((user) => user.username.toLowerCase().includes(username.trim().toLowerCase()))
                .filter((user) => !users.some((currentUser) => String(currentUser.id) === String(user.id)));
            setResult({ ...next, users: [...users, ...knownUsers] }); setQuery(username);
        } catch (err) {
            setResult(null);
            setError(err.response?.data?.message || 'ค้นหาผู้ใช้ไม่สำเร็จ');
        } finally { setBusy(false); }
    };

    const moderate = async (id, username, banned) => {
        const action = banned ? 'ระงับบัญชี' : 'ยกเลิกการระงับบัญชี';
        if (!window.confirm(`${action} ${username} (ID: ${id})?`)) return;
        setBusy(true); setError(''); setMessage('');
        try {
            await (banned ? banUser(id) : unbanUser(id));
            setModeratedUsers((current) => ({
                ...current,
                [id]: {
                    ...(result?.users?.find((user) => String(user.id) === String(id)) ?? { id, username }),
                    status: banned ? 'banned' : 'active',
                },
            }));
            setResult((current) => current ? {
                ...current,
                users: current.users.map((user) => String(user.id) === String(id)
                    ? { ...user, status: banned ? 'banned' : 'active' } : user),
            } : current);
            setMessage(`${action} ${username} (ID: ${id}) สำเร็จ`);
        } catch (err) {
            setError(err.response?.data?.message || `${action}ไม่สำเร็จ`);
        } finally { setBusy(false); }
    };

    return { keyword, setKeyword, result, busy, error, message, isBanned, search, moderate };
}

import { useState } from 'react';
import { approveComic, searchAdminComics, unapproveComic } from '../../../api/adminManagementApi';

export default function useComicApprovalManagement() {
    const [keyword, setKeyword] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const search = async (page = 1, title = query, approved = status) => {
        setBusy(true); setError(''); setMessage('');
        try {
            const next = await searchAdminComics(title, page, approved);
            setResult(next);
            setQuery(title.trim());
        } catch (err) {
            setResult(null);
            setError(err.response?.data?.message || 'ค้นหาการ์ตูนไม่สำเร็จ');
        } finally { setBusy(false); }
    };

    const moderate = async (comic, approve) => {
        const action = approve ? 'อนุมัติ' : 'ยกเลิกการอนุมัติ';
        if (!window.confirm(`${action} ${comic.title} (ID: ${comic.id})?`)) return;
        setBusy(true); setError(''); setMessage('');
        try {
            const updated = await (approve ? approveComic(comic.id) : unapproveComic(comic.id));
            if (status === 'RESUBMIT') {
                setResult(null);
                try {
                    let page = result?.pagination?.page ?? 1;
                    let next = await searchAdminComics(query, page, status);
                    if (page > 1 && page > next.pagination.totalPages) {
                        page = Math.max(1, next.pagination.totalPages);
                        next = await searchAdminComics(query, page, status);
                    }
                    setResult(next);
                } catch {
                    setError('อัปเดตสถานะแล้ว แต่โหลดรายการใหม่ไม่สำเร็จ กรุณาค้นหาอีกครั้ง');
                }
            } else setResult((current) => current ? {
                ...current,
                comics: current.comics.map((item) => item.id === comic.id ? { ...item, ...updated } : item),
            } : current);
            setMessage(`${action} ${comic.title} (ID: ${comic.id}) สำเร็จ`);
        } catch (err) {
            setError(err.response?.data?.message || `${action}ไม่สำเร็จ`);
        } finally { setBusy(false); }
    };

    const changeStatus = (value) => { setStatus(value); setKeyword(''); search(1, '', value); };

    return { keyword, setKeyword, status, result, busy, error, message, search, moderate, changeStatus };
}

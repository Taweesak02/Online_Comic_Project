import { Navigate } from 'react-router-dom';

import SavedComicList from './components/SavedComicList';

export default function SavedComicsPage({ kind, isLoggedIn, authReady }) {
    if (!authReady) return <output className="block py-20 text-center">กำลังตรวจสอบบัญชีผู้ใช้...</output>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <SavedComicList key={kind} kind={kind} />;
}

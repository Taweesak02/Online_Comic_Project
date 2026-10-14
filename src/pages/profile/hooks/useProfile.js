import { useEffect, useMemo, useState } from 'react';
import { changePassword, getProfile, updateEmail, updateProfile, uploadProfileImage } from '../../../api/profileApi';
import { getCoverUrl } from '../../../utils/comicUtils';

export default function useProfile({ isLoggedIn, onUserChange }) {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const preview = useMemo(
        () => imageFile ? URL.createObjectURL(imageFile) : getCoverUrl(user?.profileImage),
        [imageFile, user?.profileImage],
    );

    useEffect(() => () => {
        if (imageFile && preview) URL.revokeObjectURL(preview);
    }, [imageFile, preview]);

    useEffect(() => {
        if (!isLoggedIn) return;
        let active = true;
        getProfile()
            .then((profile) => {
                if (!active) return;
                setUser(profile);
                setUsername(profile?.username ?? '');
                setEmailForm((current) => ({ ...current, newEmail: profile?.email ?? '' }));
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [isLoggedIn]);

    const showResult = (nextUser, successMessage) => {
        if (nextUser) {
            setUser(nextUser);
            onUserChange?.(nextUser);
        }
        setMessage(successMessage);
    };

    const submitProfile = async (event) => {
        event.preventDefault();
        if (!username.trim()) return;
        setSaving('profile');
        setError('');
        setMessage('');
        try {
            const profileImage = imageFile ? await uploadProfileImage(imageFile) : undefined;
            const result = await updateProfile({ username: username.trim(), profileImage });
            setImageFile(null);
            showResult(result?.user, 'แก้ไขชื่อและรูปโปรไฟล์สำเร็จ');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถแก้ไขโปรไฟล์ได้');
        } finally {
            setSaving('');
        }
    };

    const submitEmail = async (event) => {
        event.preventDefault();
        setSaving('email');
        setError('');
        setMessage('');
        try {
            const result = await updateEmail(emailForm);
            setEmailForm((current) => ({ ...current, currentPassword: '' }));
            showResult(result?.user, 'แก้ไขอีเมลสำเร็จ กรุณายืนยันอีเมลใหม่');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถแก้ไขอีเมลได้');
        } finally {
            setSaving('');
        }
    };

    const submitPassword = async (event) => {
        event.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }
        setSaving('password');
        setError('');
        setMessage('');
        try {
            await changePassword(passwordForm);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage('เปลี่ยนรหัสผ่านสำเร็จ');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        } finally {
            setSaving('');
        }
    };

    return {
        username, setUsername, imageFile, setImageFile, emailForm, setEmailForm, passwordForm,
        setPasswordForm, loading, saving, error, message, preview, submitProfile, submitEmail,
        submitPassword,
    };
}

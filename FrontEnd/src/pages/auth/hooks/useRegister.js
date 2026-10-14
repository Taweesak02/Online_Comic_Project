import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authApi';
import getErrorMessage from '../../../utils/getErrorMessage';

export default function useRegister(onAuthenticated) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateField = ({ target: { name, value } }) => {
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);

        try {
            const user = await register({
                username: form.username,
                email: form.email,
                password: form.password,
            });
            onAuthenticated?.(user);
            navigate('/', { replace: true });
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'สมัครสมาชิกไม่สำเร็จ'));
        } finally {
            setLoading(false);
        }
    };

    return { form, error, loading, updateField, handleSubmit };
}

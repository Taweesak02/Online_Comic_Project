import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authApi';
import getErrorMessage from '../../../utils/getErrorMessage';

export default function useLogin(onAuthenticated) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateField = ({ target: { name, value } }) => {
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({
                email: form.email,
                password: form.password,
            });
            onAuthenticated?.(user);
            navigate('/', { replace: true });
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'เข้าสู่ระบบไม่สำเร็จ'));
        } finally {
            setLoading(false);
        }
    };

    return { form, error, loading, updateField, handleSubmit };
}

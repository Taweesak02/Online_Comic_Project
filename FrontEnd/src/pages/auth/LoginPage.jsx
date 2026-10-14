import LoginForm from './components/LoginForm';
import useLogin from './hooks/useLogin';
import { Link } from 'react-router-dom';

export default function LoginPage({ onAuthenticated }) {
    const { form, error, loading, updateField, handleSubmit } = useLogin(onAuthenticated);

    return (
        <main className="mx-auto flex min-h-[calc(100vh-122px)] w-full max-w-6xl items-start justify-center px-4 py-12 sm:py-16">
            <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h1 className="mb-6 text-xl font-semibold text-slate-900">ลงชื่อเข้าใช้ระบบ</h1>

                <LoginForm
                    form={form}
                    error={error}
                    loading={loading}
                    updateField={updateField}
                    handleSubmit={handleSubmit}
                />

                <p className="mt-5 text-center text-sm text-slate-600">
                    ยังไม่มีบัญชี?{' '}
                    <Link className="font-medium text-[#487c31] hover:underline" to="/register">
                        สมัครสมาชิก
                    </Link>
                </p>
            </section>
        </main>
    );
}

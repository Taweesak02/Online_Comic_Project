import { Link } from 'react-router-dom';

export default function LoginForm({ form, error, loading, updateField, handleSubmit }) {
    return (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-medium text-slate-800" htmlFor="login-email">
                <span>อีเมล</span>
                <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="เช่น gogo123@gmail.com"
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#59923E] focus:ring-2 focus:ring-[#A6D577]/50"
                    required
                />
            </label>

            <label className="block text-sm font-medium text-slate-800" htmlFor="login-password">
                <span>รหัสผ่าน</span>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="กรอกรหัสผ่าน"
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#59923E] focus:ring-2 focus:ring-[#A6D577]/50"
                    required
                />
            </label>

            <Link className="block text-sm text-[#487c31] hover:underline" to="/forgot-password">
                ลืมรหัสผ่าน?
            </Link>

            {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="w-full rounded-md bg-[#59923E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4B7C34] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
            >
                {loading ? 'กำลังดำเนินการ...' : 'ลงชื่อเข้าใช้ระบบ'}
            </button>
        </form>
    );
}

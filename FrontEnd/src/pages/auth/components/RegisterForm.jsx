export default function RegisterForm({ form, error, loading, updateField, handleSubmit }) {
    return (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-medium text-slate-800" htmlFor="register-username">
                <span>ชื่อผู้ใช้</span>
                <input
                    id="register-username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={updateField}
                    placeholder="เช่น reader01"
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#59923E] focus:ring-2 focus:ring-[#A6D577]/50"
                    required
                />
            </label>

            <label className="block text-sm font-medium text-slate-800" htmlFor="register-email">
                <span>อีเมล</span>
                <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="เช่น gogo123@gmail.com"
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#59923E] focus:ring-2 focus:ring-[#A6D577]/50"
                    required
                />
            </label>

            <label className="block text-sm font-medium text-slate-800" htmlFor="register-password">
                <span>รหัสผ่าน</span>
                <input
                    id="register-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#59923E] focus:ring-2 focus:ring-[#A6D577]/50"
                    required
                />
            </label>

            <label className="block text-sm font-medium text-slate-800" htmlFor="register-confirm-password">
                <span>ยืนยันรหัสผ่าน</span>
                <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#59923E] focus:ring-2 focus:ring-[#A6D577]/50"
                    required
                />
            </label>

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
                {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
            </button>
        </form>
    );
}

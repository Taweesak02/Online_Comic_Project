import { inputClass } from './profileFormStyles';

export default function ProfileEmailForm({ emailForm, setEmailForm, saving, submitEmail }) {
    return (
        <form className="rounded-4xl border border-[#e7e7e9] bg-[#f3f3f3] p-6 sm:p-8" onSubmit={submitEmail}>
            <h2 className="text-xl font-bold text-[#0d0c22]">แก้ไขอีเมล</h2>
            <p className="mt-1 text-sm text-[#666666]">ต้องยืนยันด้วยรหัสผ่านปัจจุบัน</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#0d0c22]"><span>อีเมลใหม่</span>
                    <input className={inputClass} type="email" value={emailForm.newEmail} onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))} required />
                </label>
                <label className="text-sm font-semibold text-[#0d0c22]"><span>รหัสผ่านปัจจุบัน</span>
                    <input className={inputClass} type="password" value={emailForm.currentPassword} onChange={(event) => setEmailForm((current) => ({ ...current, currentPassword: event.target.value }))} autoComplete="current-password" required />
                </label>
            </div>
            <button className="mt-5 rounded-xl bg-[#59923E] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={saving === 'email'}>
                {saving === 'email' ? 'กำลังบันทึก...' : 'เปลี่ยนอีเมล'}
            </button>
        </form>
    );
}

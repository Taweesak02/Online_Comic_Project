import { inputClass } from './profileFormStyles';

export default function ProfilePasswordForm({ passwordForm, setPasswordForm, saving, submitPassword }) {
    return (
        <form className="rounded-4xl border border-[#e7e7e9] bg-[#f3f3f3] p-6 sm:p-8" onSubmit={submitPassword}>
            <h2 className="text-xl font-bold text-[#0d0c22]">เปลี่ยนรหัสผ่าน</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-semibold text-[#0d0c22]"><span>รหัสผ่านปัจจุบัน</span>
                    <input className={inputClass} type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} autoComplete="current-password" required />
                </label>
                <label className="text-sm font-semibold text-[#0d0c22]"><span>รหัสผ่านใหม่</span>
                    <input className={inputClass} type="password" minLength="6" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} autoComplete="new-password" required />
                </label>
                <label className="text-sm font-semibold text-[#0d0c22]"><span>ยืนยันรหัสผ่านใหม่</span>
                    <input className={inputClass} type="password" minLength="6" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} autoComplete="new-password" required />
                </label>
            </div>
            <button className="mt-5 rounded-xl bg-[#59923E] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={saving === 'password'}>
                {saving === 'password' ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
        </form>
    );
}

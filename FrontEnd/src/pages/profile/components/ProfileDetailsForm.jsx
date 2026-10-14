import { inputClass } from './profileFormStyles';

export default function ProfileDetailsForm({ username, setUsername, saving, submitProfile }) {
    return (
        <form className="rounded-4xl border border-[#e7e7e9] bg-[#f3f3f3] p-6 sm:p-8" onSubmit={submitProfile}>
            <h2 className="text-xl font-bold text-[#0d0c22]">ข้อมูลทั่วไป</h2>
            <label className="mt-5 block text-sm font-semibold text-[#0d0c22]"><span>ชื่อผู้ใช้</span>
                <input className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
            <button className="mt-5 rounded-xl bg-[#213f68] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={saving === 'profile'}>
                {saving === 'profile' ? 'กำลังบันทึก...' : 'บันทึกชื่อและรูป'}
            </button>
        </form>
    );
}

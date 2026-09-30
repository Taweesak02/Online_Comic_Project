import usePaymentMethodEditor from '../hooks/usePaymentMethodEditor';

export default function PaymentMethodManagement({ paymentMethods, submitting, onSave, onDelete }) {
    const { form, setForm, editingId, resetForm, submit, startEditing, remove } = usePaymentMethodEditor({ onSave, onDelete });

    const getSaveLabel = () => {
        if (submitting) {
            return 'กำลังบันทึก...';
        }
        if (editingId) {
            return 'บันทึกช่องทาง';
        }
        return 'เพิ่มช่องทาง';
    };

    return (
        <section>
            <p className="text-sm font-semibold text-[#213f68]">PAYMENT SETTINGS</p>
            <h2 className="mt-1 text-2xl font-bold">ช่องทางชำระเงิน</h2>
            <p className="mt-1 text-sm text-[#666666]">เพิ่มและจัดการช่องทางที่ผู้ใช้เลือกได้ในหน้าชำระเงิน</p>

            <div className="mt-6 rounded-2xl border border-[#e7e7e9] bg-white p-5 sm:p-6">
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
                    <label className="text-sm font-semibold">
                        <span>ชื่อช่องทาง</span>
                        <input
                            className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 font-normal outline-none focus:border-[#213f68]"
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            placeholder="เช่น PromptPay"
                            required
                        />
                    </label>
                    <label className="text-sm font-semibold">
                        <span>Code</span>
                        <input
                            className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 font-normal uppercase outline-none focus:border-[#213f68]"
                            value={form.code}
                            onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                            placeholder="เช่น PROMPTPAY"
                            pattern="[A-Za-z0-9_-]+"
                            title="ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข _ และ -"
                            required
                        />
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                        <span>หมายเลขพร้อมเพย์ (PromptPay ID)</span>
                        <input
                            className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 font-normal outline-none focus:border-[#213f68]"
                            type="text"
                            value={form.promptPayId}
                            onChange={(event) => setForm({ ...form, promptPayId: event.target.value })}
                            placeholder="หมายเลขบัญชีพร้อมเพย์สำหรับรับชำระเงิน"
                        />
                    </label>
                    <div className="flex justify-end gap-2 sm:col-span-2">
                        {editingId && (
                            <button className="rounded-xl border px-5 py-3 text-sm font-semibold" type="button" onClick={resetForm}>
                                ยกเลิก
                            </button>
                        )}
                        <button type="submit" className="rounded-xl bg-[#213f68] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={submitting || !form.name.trim() || !form.code.trim()}>
                            {getSaveLabel()}
                        </button>
                    </div>
                </form>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {paymentMethods.length ? paymentMethods.map((method) => (
                        <article className="rounded-xl bg-[#f8f8f8] p-4" key={method.id}>
                            <strong className="text-[#0d0c22]">{method.name}</strong>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#666666]">{method.code}</p>
                            {method.promptPayId && (
                                <p className="mt-1 break-all text-sm text-[#666666]">PromptPay ID: {method.promptPayId}</p>
                            )}
                            <div className="mt-3 flex gap-3">
                                <button className="text-xs font-semibold text-[#213f68]" type="button" onClick={() => startEditing(method)}>
                                    แก้ไข
                                </button>
                                <button
                                    className="text-xs font-semibold text-red-700 disabled:opacity-50"
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => remove(method)}
                                >
                                    ลบ
                                </button>
                            </div>
                        </article>
                    )) : <p className="text-sm text-[#666666]">ยังไม่มีช่องทางชำระเงิน</p>}
                </div>
            </div>
        </section>
    );
}

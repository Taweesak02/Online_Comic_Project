import usePackageEditor from "../hooks/usePackageEditor";

export default function PackageManagement({
  packages,
  submitting,
  onSave,
  onDelete,
}) {
  const { form, setForm, editingId, reset, submit, startEditing, remove } =
    usePackageEditor({ onSave, onDelete });
  const getSaveLabel = () => {
      if (submitting) {
          return "กำลังบันทึก...";
      }
      if (editingId) {
          return "บันทึกแพ็กเกจ";
      }
      return "เพิ่มแพ็กเกจ";
  };

  return (
    <section>
      <p className="text-sm font-semibold text-[#213f68]">COIN STORE</p>
      <h2 className="mt-1 text-2xl font-bold">แพ็กเกจเหรียญ</h2>
      <p className="mt-1 text-sm text-[#666666]">
        สร้างและแก้ไขแพ็กเกจสำหรับหน้าซื้อเหรียญ
      </p>
      <div className="mt-6 rounded-2xl border border-[#e7e7e9] bg-white p-5 sm:p-6">
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={submit}>
          {[
            ["name", "ชื่อแพ็กเกจ", "text"],
            ["coinAmount", "จำนวนเหรียญ", "number"],
            ["price", "ราคา (บาท)", "number"],
          ].map(([field, label, type]) => (
            <label className="text-sm font-semibold" key={field}>
              {label}
              <input
                className="mt-2 w-full rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 font-normal"
                type={type}
                min={{ price: "0.01", coinAmount: "1" }[field]}
                step={field === "price" ? "0.01" : undefined}
                value={form[field]}
                onChange={(event) =>
                  setForm({ ...form, [field]: event.target.value })
                }
                required
              />
            </label>
          ))}
          <div className="flex justify-end gap-2 sm:col-span-3">
            {editingId && (
              <button
                className="rounded-xl border px-5 py-3 text-sm font-semibold"
                type="button"
                onClick={reset}
              >
                ยกเลิก
              </button>
            )}
            <button type="submit"
              className="rounded-xl bg-[#213f68] px-6 py-3 text-sm font-semibold text-white"
              disabled={submitting}
            >
              {getSaveLabel()}
            </button>
          </div>
        </form>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {packages.length ? (
            packages.map((item) => (
              <article className="rounded-xl bg-[#f8f8f8] p-4" key={item.id}>
                <strong>{item.name}</strong>
                <p className="mt-1 text-sm text-[#666666]">
                  {item.coinAmount} เหรียญ ·{" "}
                  {Number(item.price).toLocaleString("th-TH")} บาท
                </p>
                <div className="mt-3 flex gap-3">
                  <button type="button"
                    className="text-xs font-semibold text-[#213f68]"
                    onClick={() => startEditing(item)}
                  >
                    แก้ไขแพ็กเกจ
                  </button>
                  <button type="button"
                    className="text-xs font-semibold text-red-700"
                    disabled={submitting}
                    onClick={() => remove(item)}
                  >
                    ลบแพ็กเกจ
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-[#666666]">ยังไม่มีแพ็กเกจ</p>
          )}
        </div>
      </div>
    </section>
  );
}

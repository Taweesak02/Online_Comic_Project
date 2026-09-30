import useNameEditor from "../hooks/useNameEditor";

export default function NameManager({
  title,
  description,
  items,
  submitting,
  onCreate,
  onEdit,
  onDelete,
}) {
  const { name, setName, editing, setEditing, submit, submitEdit } = useNameEditor({ onCreate, onEdit });
  return (
    <section className="rounded-2xl border border-[#e7e7e9] bg-white p-5 sm:p-6">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-[#666666]">{description}</p>
      <form className="mt-5 flex gap-3" onSubmit={submit}>
        <input
          className="min-w-0 flex-1 rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 text-sm outline-none focus:border-[#213f68]"
          aria-label={`ชื่อ${title}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={`ชื่อ${title}`}
          required
        />
        <button type="submit"
          className="rounded-xl bg-[#213f68] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          disabled={submitting || !name.trim()}
        >
          เพิ่ม
        </button>
      </form>
      <div className="mt-5 space-y-2">
        {items.length ? (
          items.map((item) =>
            editing?.id === item.id ? (
              <form className="flex gap-2" onSubmit={submitEdit} key={item.id}>
                <input
                  className="min-w-0 flex-1 rounded-xl border border-[#213f68] px-3 py-2 text-sm"
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                  autoFocus
                  required
                />
                <button type="submit"
                  className="rounded-xl bg-[#213f68] px-3 py-2 text-xs font-semibold text-white"
                  disabled={submitting}
                >
                  บันทึก
                </button>
                <button
                  className="rounded-xl border px-3 py-2 text-xs font-semibold"
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  ยกเลิก
                </button>
              </form>
            ) : (
              <div
                className="flex items-center justify-between rounded-xl bg-[#f8f8f8] px-3 py-2"
                key={item.id}
              >
                <span className="text-sm font-semibold">{item.name}</span>
                <div className="flex gap-3">
                  <button type="button"
                    className="text-xs font-semibold text-[#213f68]"
                    onClick={() => setEditing({ id: item.id, name: item.name })}
                  >
                    แก้ไข
                  </button>
                  <button type="button"
                    className="text-xs font-semibold text-red-700"
                    disabled={submitting}
                    onClick={() => onDelete(item)}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ),
          )
        ) : (
          <p className="text-sm text-[#666666]">ยังไม่มีข้อมูล</p>
        )}
      </div>
    </section>
  );
}

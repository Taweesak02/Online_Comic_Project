export default function PaymentMethodSelector({ paymentMethods, paymentMethodId, onSelect, disabled }) {
    return (
        paymentMethods.length ? (
            <div className="mt-5 grid gap-3">
                {paymentMethods.map((method) => (
                    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${paymentMethodId === String(method.id) ? 'border-[#213f68] bg-[#213f68]/5' : 'border-[#e7e7e9] hover:border-[#9daabe]'}`} key={method.id}>
                        <input type="radio" name="paymentMethod" value={method.id} disabled={disabled} checked={paymentMethodId === String(method.id)} onChange={(event) => onSelect(event.target.value)} />
                        <span>
                            <strong className="block text-[#0d0c22]">{method.name}</strong>
                            {method.code && <span className="text-xs uppercase text-[#666666]">{method.code}</span>}
                        </span>
                    </label>
                ))}
            </div>
        ) : <p className="mt-5 text-sm text-[#666666]">ยังไม่มีวิธีชำระเงินที่พร้อมใช้งาน</p>
    );
}

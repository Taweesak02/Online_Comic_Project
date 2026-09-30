import { formatPrice } from '../utils/formatters';

export default function CoinPackageSelector({ packages, selectedPackageId, onSelect }) {
    return (
        <section aria-labelledby="coin-package-title">
            <h2 className="text-xl font-bold text-[#0d0c22]" id="coin-package-title">เลือกแพ็กเกจ</h2>
            {packages.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((coinPackage) => {
                        const selected = selectedPackageId === String(coinPackage.id);
                        return (
                            <label className={`cursor-pointer rounded-2xl border-2 bg-white p-5 transition ${selected ? 'border-[#213f68] shadow-lg' : 'border-[#e7e7e9] hover:border-[#9daabe]'}`} key={coinPackage.id}>
                                <input className="sr-only" type="radio" name="coinPackage" value={coinPackage.id} checked={selected} onChange={(event) => onSelect(event.target.value)} />
                                <span className="text-sm font-semibold text-[#666666]">{coinPackage.name}</span>
                                <strong className="mt-3 block text-3xl text-[#213f68]">● {coinPackage.coinAmount}</strong>
                                <span className="mt-1 block text-sm text-[#666666]">เหรียญ</span>
                                <span className="mt-4 block text-lg font-bold text-[#0d0c22]">{formatPrice(coinPackage.price)}</span>
                            </label>
                        );
                    })}
                </div>
            ) : <p className="mt-4 rounded-2xl bg-white p-8 text-center text-[#666666]">ยังไม่มีแพ็กเกจที่พร้อมจำหน่าย</p>}
        </section>
    );
}

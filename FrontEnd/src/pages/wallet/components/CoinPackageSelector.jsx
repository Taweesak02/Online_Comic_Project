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
                                <strong className="mt-3 block text-2xl text-[#213f68]"> 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                                        <path d="M0 0h16v16H0z" fill="none" />
                                        <g fill="currentColor">
                                            <path d="M8 3a5 5 0 1 1 0 10A5 5 0 0 1 8 3M7 5v6h2V5z" />
                                            <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1m0 1a6 6 0 1 0 0 12A6 6 0 0 0 8 2" />
                                        </g>
                                    </svg>
                                    {coinPackage.coinAmount} เหรียญ
                                </strong>
                               
                                <span className="mt-4 block text-lg font-bold text-[#0d0c22]">{formatPrice(coinPackage.price)}</span>
                            </label>
                        );
                    })}
                </div>
            ) : <p className="mt-4 rounded-2xl bg-white p-8 text-center text-[#666666]">ยังไม่มีแพ็กเกจที่พร้อมจำหน่าย</p>}
        </section>
    );
}

import CoinPackageSelector from './CoinPackageSelector';
import { formatPrice } from '../utils/formatters';

export default function CoinPurchaseForm({
    packages,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    submitPurchase,
}) {
    return (
        <form className="mt-7" onSubmit={submitPurchase}>
            <CoinPackageSelector
                packages={packages}
                selectedPackageId={selectedPackageId}
                onSelect={setSelectedPackageId}
            />

            <div className="mt-6 flex justify-end">
                <button className="rounded-full bg-[#59923E] px-7 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!selectedPackageId}>
                    {selectedPackage ? `ไปหน้าชำระเงิน ${formatPrice(selectedPackage.price)} →` : 'เลือกแพ็กเกจ'}
                </button>
            </div>
        </form>
    );
}

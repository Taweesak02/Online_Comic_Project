import { getTransactionDate } from '../utils/transactions';
import WalletTransactionCard from './WalletTransactionCard';

export default function WalletTransactionList({ transactions }) {
    return (
        <section className="mt-7 overflow-hidden rounded-4xl border border-[#e7e7e9] bg-white shadow-[0_12px_35px_rgba(27,32,50,0.07)]" aria-label="รายการประวัติ Wallet">
            <div className="divide-y divide-[#e7e7e9]">
                {transactions.map((transaction, index) => (
                    <WalletTransactionCard
                        key={transaction.id ?? `${getTransactionDate(transaction)}-${index}`}
                        transaction={transaction}
                    />
                ))}
            </div>
        </section>
    );
}

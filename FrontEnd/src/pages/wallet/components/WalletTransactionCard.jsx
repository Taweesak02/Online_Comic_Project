import { formatNumber, formatDate } from '../utils/formatters';
import { getTransactionAmount, getTransactionDate, isCreditTransaction, getTransactionTitle } from '../utils/transactions';

export default function WalletTransactionCard({ transaction }) {
    const amount = getTransactionAmount(transaction);
    const isCredit = isCreditTransaction(transaction, amount);
    const displayedAmount = Math.abs(amount);
    const balanceAfter = transaction.balanceAfter ?? transaction.balance_after ?? transaction.balance;

    return (
        <article className="flex items-center justify-between gap-4 px-5 py-5 sm:px-7">
            <div className="min-w-0">
                <h2 className="truncate font-bold text-[#0d0c22]">{getTransactionTitle(transaction)}</h2>
                <p className="mt-1 text-xs text-[#666666]">{formatDate(getTransactionDate(transaction))}</p>
                {balanceAfter !== undefined && balanceAfter !== null && (
                    <p className="mt-1 text-xs text-[#8a8a8a]">ยอดคงเหลือหลังรายการ {formatNumber(balanceAfter)} เหรียญ</p>
                )}
            </div>
            <strong className={`shrink-0 text-lg ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                {isCredit ? '+' : '-'}{formatNumber(displayedAmount)} เหรียญ
            </strong>
        </article>
    );
}

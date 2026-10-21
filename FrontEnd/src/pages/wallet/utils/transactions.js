export const getTransactionAmount = (transaction) => Number(
    transaction.amount ?? transaction.changeAmount ?? transaction.coinAmount ?? transaction.coins ?? 0,
);

export const getTransactionDate = (transaction) => (
    transaction.createdAt ?? transaction.created_at ?? transaction.transactionDate ?? transaction.transaction_date ?? transaction.date
);

const getTransactionType = (transaction) => String(
    transaction.type ?? transaction.transactionType ?? transaction.transaction_type ?? '',
).toLowerCase();

export const isCreditTransaction = (transaction, amount) => {
    const type = getTransactionType(transaction);
    if (['debit', 'spend', 'payment', 'unlock'].includes(type)) return false;
    if (['credit', 'creator_reward', 'deposit', 'purchase', 'topup', 'top_up', 'refund'].includes(type)) return true;
    return amount >= 0;
};

export const getTransactionTitle = (transaction) => {
    if (transaction.description) return transaction.description;

    const type = getTransactionType(transaction);
    if (['creator_reward'].includes(type)) return 'รายได้จากการปลดล็อก';
    if (['credit', 'deposit', 'purchase', 'topup', 'top_up'].includes(type)) return 'เติมเหรียญ';
    if (['debit', 'spend', 'payment', 'unlock'].includes(type)) return 'ใช้เหรียญ';
    if (type === 'refund') return 'คืนเหรียญ';
    return transaction.type ?? transaction.transactionType ?? transaction.transaction_type ?? 'รายการ Wallet';
};

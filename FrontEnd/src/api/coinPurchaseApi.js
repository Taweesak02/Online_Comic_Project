import api from './client';

const unwrap = (payload) => payload?.data ?? payload;

const normalizeList = (payload, requiredKey) => {
    const result = unwrap(payload);
    if (Array.isArray(result)) return result;
    return Object.values(result ?? {}).filter((item) => item && typeof item === 'object' && requiredKey in item);
};

export const getCoinPackages = async () => normalizeList((await api.get('/package')).data, 'coinAmount');
export const getPaymentMethods = async () => normalizeList((await api.get('/payment-method')).data, 'code');
export const getWallet = async () => unwrap((await api.get('/wallet')).data);

const findTransactionList = (payload) => {
    const result = unwrap(payload);
    if (Array.isArray(result)) return result;
    if (!result || typeof result !== 'object') return null;

    const indexedTransactions = Object.entries(result)
        .filter(([key, value]) => /^\d+$/.test(key) && value && typeof value === 'object')
        .sort(([firstKey], [secondKey]) => Number(firstKey) - Number(secondKey))
        .map(([, transaction]) => transaction);
    if (indexedTransactions.length) return indexedTransactions;

    const keys = ['transactions', 'walletTransactions', 'wallet_transactions', 'items', 'results', 'history', 'data'];
    for (const key of keys) {
        const value = result[key];
        if (Array.isArray(value)) return value;
        const nestedList = findTransactionList(value);
        if (nestedList) return nestedList;
    }

    return null;
};

export const getWalletTransactions = async () => {
    const response = await api.get('/wallet/history');
    return findTransactionList(response.data) ?? [];
};
export const purchaseCoins = async (packageId, paymentMethodId) => unwrap((await api.post('/payment/purchase', {
    packageId: Number(packageId),
    paymentMethodId: Number(paymentMethodId),
})).data);

export const getPaymentStatus = async (transactionId) => unwrap((await api.get(`/payment/status/${encodeURIComponent(transactionId)}`)).data);

export const cancelPayment = async (transactionId) => unwrap((await api.patch(`/payment/${encodeURIComponent(transactionId)}/cancel`)).data);

export const verifyPaymentSlip = async (transactionId, slip) => {
    const formData = new FormData();
    formData.append('slip', slip);
    return unwrap((await api.post(`/payment/${encodeURIComponent(transactionId)}/verify-slip`, formData)).data);
};

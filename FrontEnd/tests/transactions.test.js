import assert from 'node:assert/strict';
import { test } from 'vitest';
import { getTransactionAmount, getTransactionDate, isCreditTransaction, getTransactionTitle } from '../src/pages/wallet/utils/transactions.js';

test('wallet amounts accept API aliases and numeric strings', () => {
    for (const field of ['amount', 'changeAmount', 'coinAmount', 'coins']) {
        assert.equal(getTransactionAmount({ [field]: '-25.5' }), -25.5);
    }
    assert.equal(getTransactionAmount({}), 0);
    assert.equal(getTransactionAmount({ amount: 0, coins: 50 }), 0);
    assert.equal(getTransactionAmount({ amount: null, changeAmount: 20 }), 20);
});

test('wallet dates accept API aliases and prefer the canonical field', () => {
    const date = '2026-01-02T03:04:00Z';
    for (const field of ['createdAt', 'created_at', 'transactionDate', 'transaction_date', 'date']) {
        assert.equal(getTransactionDate({ [field]: date }), date);
    }
    assert.equal(getTransactionDate({ createdAt: date, date: 'older' }), date);
    assert.equal(getTransactionDate({ createdAt: null, date }), date);
    assert.equal(getTransactionDate({}), undefined);
});

test('explicit transaction types determine credit or debit regardless of amount sign', () => {
    for (const field of ['type', 'transactionType', 'transaction_type']) {
        for (const type of ['debit', 'spend', 'payment', 'unlock']) {
            assert.equal(isCreditTransaction({ [field]: type.toUpperCase() }, 100), false);
        }
        for (const type of ['credit', 'deposit', 'purchase', 'topup', 'top_up', 'refund']) {
            assert.equal(isCreditTransaction({ [field]: type.toUpperCase() }, -100), true);
        }
        assert.equal(isCreditTransaction({ [field]: 'CREATOR_REWARD' }, -100), true);
    }
});

test('unrecognized transaction types fall back to the amount sign', () => {
    for (const transaction of [{}, { type: 'adjustment' }]) {
        assert.equal(isCreditTransaction(transaction, -1), false);
        assert.equal(isCreditTransaction(transaction, 0), true);
        assert.equal(isCreditTransaction(transaction, 1), true);
    }
});

test('wallet titles use descriptions first and localized type labels otherwise', () => {
    assert.equal(getTransactionTitle({ description: 'Chapter 12', type: 'unlock' }), 'Chapter 12');
    assert.equal(getTransactionTitle({ transactionType: 'CREATOR_REWARD' }), 'รายได้จากการปลดล็อก');
    for (const field of ['type', 'transactionType', 'transaction_type']) {
        for (const type of ['credit', 'deposit', 'purchase', 'topup', 'top_up']) {
            assert.equal(getTransactionTitle({ [field]: type.toUpperCase() }), 'เติมเหรียญ');
        }
        for (const type of ['debit', 'spend', 'payment', 'unlock']) {
            assert.equal(getTransactionTitle({ [field]: type }), 'ใช้เหรียญ');
        }
        assert.equal(getTransactionTitle({ [field]: 'REFUND' }), 'คืนเหรียญ');
        assert.equal(getTransactionTitle({ [field]: 'Adjustment' }), 'Adjustment');
    }
    assert.equal(getTransactionTitle({}), 'รายการ Wallet');
});

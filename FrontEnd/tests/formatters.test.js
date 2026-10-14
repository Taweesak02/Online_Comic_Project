import assert from 'node:assert/strict';
import { test } from 'vitest';
import { formatPrice, formatNumber, formatDate } from '../src/pages/wallet/utils/formatters.js';

test('prices render Thai baht with grouping and two decimal places', () => {
    assert.equal(formatPrice('1234.5'), '฿1,234.50');
    assert.equal(formatPrice(0), '฿0.00');
    assert.equal(formatPrice(-25), '-฿25.00');
});

test('numbers support strings, negatives, and empty or invalid input', () => {
    assert.equal(formatNumber('12345.5'), '12,345.5');
    assert.equal(formatNumber(-1200), '-1,200');
    for (const value of [undefined, null, '', 'invalid', NaN, 0]) {
        assert.equal(formatNumber(value), '0');
    }
});

test('missing and invalid dates display the unknown-time label', () => {
    for (const value of [undefined, null, '', 'invalid', '2026-99-99']) {
        assert.equal(formatDate(value), 'ไม่ทราบเวลา');
    }
});

test('dates display Thai calendar dates and local time', () => {
    // Construct local time so the expectation works in any machine timezone.
    assert.equal(formatDate(new Date(2026, 0, 2, 13, 5)), '2 ม.ค. 2569 13:05');
});

// @vitest-environment jsdom
import { act } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import PaymentPage from '../src/pages/wallet/PaymentPage';
import WalletTransactionPage from '../src/pages/wallet/WalletTransactionPage';
import * as api from '../src/api/coinPurchaseApi';
import { setupTestDom, click, submit, upload, deferred } from './helpers/dom';

vi.mock('../src/api/coinPurchaseApi', () => ({
    getCoinPackages: vi.fn(), getPaymentMethods: vi.fn(), getWallet: vi.fn(), purchaseCoins: vi.fn(),
    getPaymentStatus: vi.fn(), verifyPaymentSlip: vi.fn(), cancelPayment: vi.fn(), cancelPaymentOnPageExit: vi.fn(),
    getWalletTransactions: vi.fn(),
}));
const dom = setupTestDom();
const pending = { paymentTransactionId: 'tx-1', amount: 50, paymentStatus: 'PENDING', qrImage: 'https://example.com/qr.png' };
beforeEach(() => {
    vi.resetAllMocks();
    api.getCoinPackages.mockResolvedValue([{ id: 1, name: 'Starter', coinAmount: 100, price: 50 }]);
    api.getPaymentMethods.mockResolvedValue([{ id: 2, name: 'Bank', code: 'BANK' }, { id: 3, name: 'Other', code: 'OTHER' }]);
    api.purchaseCoins.mockResolvedValue(pending);
    api.getPaymentStatus.mockResolvedValue({ paymentStatus: 'PENDING' });
    api.getWallet.mockResolvedValue({ balance: 100 });
    api.getWalletTransactions.mockResolvedValue([]);
    api.cancelPayment.mockResolvedValue({});
    api.cancelPaymentOnPageExit.mockResolvedValue({});
});
function Destination() {
    const location = useLocation();
    return <output>{location.pathname} {location.state?.paymentSuccess}</output>;
}
const renderPayment = (props = {}, url = '/payment?packageId=1') => dom.render(
    <Routes><Route path="/payment" element={<PaymentPage isLoggedIn authReady {...props} />} /><Route path="*" element={<Destination />} /></Routes>, [url],
);

test('payment waits for authentication and redirects guests', async () => {
    await renderPayment({ authReady: false, isLoggedIn: false });
    expect(dom.container.textContent).toContain('กำลังตรวจสอบบัญชี');
    expect(api.getCoinPackages).not.toHaveBeenCalled();
    await renderPayment({ isLoggedIn: false });
    expect(dom.find('output').textContent).toContain('/login');
});

test.each(['/payment', '/payment?packageId=99'])('missing packages show a link to the store (%s)', async url => {
    await renderPayment({}, url);
    expect(dom.container.textContent).toContain('ไม่พบแพ็กเกจ');
    expect(dom.find('a[href="/coin-purchase"]')).not.toBeNull();
});

test('payment loading and load errors are visible', async () => {
    const request = deferred();
    api.getCoinPackages.mockReturnValue(request.promise);
    await renderPayment();
    expect(dom.container.textContent).toContain('กำลังโหลดข้อมูลการชำระเงิน');
    await act(async () => request.reject(new Error('offline')));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลดข้อมูล');
});

test('purchase selects a method, blocks duplicate purchases and can be cancelled and recreated', async () => {
    await renderPayment();
    await click(dom.all('input[type="radio"]')[1]);
    const request = deferred();
    api.purchaseCoins.mockReturnValueOnce(request.promise);
    await submit(dom.find('form'));
    await submit(dom.find('form'));
    expect(api.purchaseCoins).toHaveBeenCalledExactlyOnceWith(1, '3');
    expect(dom.find('[type="submit"]').disabled).toBe(true);
    await act(async () => request.resolve(pending));
    expect(dom.find('img').src).toBe(pending.qrImage);
    await submit(dom.find('form'));
    expect(api.purchaseCoins).toHaveBeenCalledOnce();
    expect(dom.button('ส่งสลิปยืนยันการชำระเงิน').disabled).toBe(true);
    const cancel = deferred();
    api.cancelPayment.mockReturnValueOnce(cancel.promise);
    await click(dom.button('ยกเลิกการชำระเงิน'));
    expect(dom.button('กำลังยกเลิก...').disabled).toBe(true);
    await act(async () => cancel.resolve());
    expect(api.cancelPayment).toHaveBeenCalledWith('tx-1');
    expect(dom.find('output').textContent).toContain('ยกเลิกการชำระเงินแล้ว');
    expect(dom.find('[type="submit"]').disabled).toBe(false);
    await submit(dom.find('form'));
    expect(api.purchaseCoins).toHaveBeenCalledTimes(2);
});

test('slip verification completes payment, updates balance and navigates with success message', async () => {
    const onBalanceChange = vi.fn();
    api.verifyPaymentSlip.mockResolvedValue({ payment: { paymentStatus: 'COMPLETED' } });
    await renderPayment({ onBalanceChange });
    await submit(dom.find('form'));
    const slip = new File(['receipt'], 'receipt.png', { type: 'image/png' });
    await upload(dom.find('input[type="file"]'), [slip]);
    await click(dom.button('ส่งสลิปยืนยันการชำระเงิน'));
    expect(api.verifyPaymentSlip).toHaveBeenCalledWith('tx-1', slip);
    expect(onBalanceChange).toHaveBeenCalledWith(100);
    expect(dom.find('output').textContent).toContain('/wallet/transactions ซื้อ 100 เหรียญสำเร็จ');
    expect(api.cancelPayment).not.toHaveBeenCalled();
});

test.each(['PENDING', 'FAILED', undefined])('status checks display %s without crediting the wallet', async status => {
    api.getPaymentStatus.mockResolvedValue({ paymentStatus: status });
    await renderPayment();
    await submit(dom.find('form'));
    const request = deferred();
    api.getPaymentStatus.mockReturnValueOnce(request.promise);
    await click(dom.button('ตรวจสอบสถานะ'));
    expect(dom.button('กำลังตรวจสอบ...').disabled).toBe(true);
    await act(async () => request.resolve({ paymentStatus: status }));
    expect(api.getWallet).not.toHaveBeenCalled();
    expect(dom.find('output').textContent).toContain(status === 'PENDING' ? 'รอการชำระเงิน' : `สถานะ: ${status ?? 'ไม่ทราบ'}`);
    if (status === 'FAILED') {
        expect(dom.button('ยกเลิกการชำระเงิน')).toBeUndefined();
        expect(dom.find('input[type="file"]').disabled).toBe(true);
    }
});

test.each(['purchase', 'status', 'cancel'])('payment %s failures allow retry', async operation => {
    await renderPayment();
    if (operation === 'purchase') api.purchaseCoins.mockRejectedValue(new Error('offline'));
    await submit(dom.find('form'));
    if (operation === 'status') {
        api.getPaymentStatus.mockRejectedValue(new Error('offline'));
        await click(dom.button('ตรวจสอบสถานะ'));
    } else if (operation === 'cancel') {
        api.cancelPayment.mockRejectedValueOnce(new Error('offline'));
        await click(dom.button('ยกเลิกการชำระเงิน'));
    }
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถ');
    expect(dom.all('button').some(item => !item.disabled)).toBe(true);
});

test('pagehide cancels a pending payment once using the keepalive API', async () => {
    await renderPayment();
    await submit(dom.find('form'));
    await act(async () => {
        window.dispatchEvent(new Event('pagehide'));
        window.dispatchEvent(new Event('pagehide'));
    });
    expect(api.cancelPaymentOnPageExit).toHaveBeenCalledExactlyOnceWith('tx-1');
    await dom.render(<p>Left payment</p>);
    expect(api.cancelPayment).not.toHaveBeenCalled();
});

test('a purchase finishing after navigation is cancelled', async () => {
    const request = deferred();
    api.purchaseCoins.mockReturnValue(request.promise);
    await renderPayment();
    await submit(dom.find('form'));
    await dom.render(<p>Left payment</p>);
    await act(async () => request.resolve(pending));
    expect(api.cancelPayment).toHaveBeenCalledExactlyOnceWith('tx-1');
});

test('wallet history renders transactions and the payment success message', async () => {
    api.getWalletTransactions.mockResolvedValue([{ id: 1, amount: 100, type: 'credit', createdAt: '2026-01-01', description: 'Top up' }, { id: 2, amount: -20, type: 'unlock' }]);
    await dom.render(<WalletTransactionPage isLoggedIn authReady />, [{ pathname: '/wallet/transactions', state: { paymentSuccess: 'Paid' } }]);
    expect(dom.find('output').textContent).toBe('Paid');
    expect(dom.container.textContent).toContain('Top up');
    expect(dom.container.textContent).toContain('ใช้เหรียญ');
});

test('wallet history handles loading, errors and empty results', async () => {
    const request = deferred();
    api.getWalletTransactions.mockReturnValue(request.promise);
    await dom.render(<WalletTransactionPage isLoggedIn authReady />);
    expect(dom.container.textContent).toContain('กำลังโหลดประวัติ Wallet');
    await act(async () => request.reject(new Error('offline')));
    expect(dom.find('[role="alert"]').textContent).toContain('ไม่สามารถโหลดประวัติ');
    expect(dom.container.textContent).toContain('ยังไม่มีประวัติ Wallet');
});

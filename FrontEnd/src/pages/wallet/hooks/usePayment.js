import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCoinPackages, getPaymentMethods, getWallet, purchaseCoins, getPaymentStatus, verifyPaymentSlip, cancelPayment } from '../../../api/coinPurchaseApi';

const pendingPaymentKey = 'pendingCoinPayment';

const getSavedPendingPayment = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(pendingPaymentKey));
        if (!saved?.packageId || !saved?.payment?.paymentTransactionId) return null;
        return saved;
    } catch {
        localStorage.removeItem(pendingPaymentKey);
        return null;
    }
};

const savePendingPayment = (packageId, payment) => {
    localStorage.setItem(pendingPaymentKey, JSON.stringify({ packageId, payment }));
};

const clearSavedPendingPayment = () => localStorage.removeItem(pendingPaymentKey);

export default function usePayment({ isLoggedIn, onBalanceChange }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const packageId = searchParams.get('packageId') ?? '';
    const [coinPackage, setCoinPackage] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethodId, setPaymentMethodId] = useState('');
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    const [payment, setPayment] = useState(null);
    const [slip, setSlip] = useState(null);
    const [checking, setChecking] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    useEffect(() => {
        if (!isLoggedIn || !packageId) return;

        let active = true;
        Promise.all([getCoinPackages(), getPaymentMethods()])
            .then(([packages, methods]) => {
                if (!active) return;
                const savedPendingPayment = getSavedPendingPayment();
                const activePackageId = savedPendingPayment?.packageId ?? packageId;
                const activePackage = packages.find((item) => String(item.id) === String(activePackageId)) ?? null;
                setCoinPackage(activePackage);
                setPaymentMethods(methods);
                setPaymentMethodId(String(methods[0]?.id ?? ''));
                if (savedPendingPayment && activePackage) {
                    setPayment(savedPendingPayment.payment);
                    setStatusMessage('มีรายการชำระเงินที่รอดำเนินการอยู่ ระบบเปิดรายการเดิมเพื่อให้ชำระเงินต่อ');
                }
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลการชำระเงินได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [isLoggedIn, packageId]);

    const submitPayment = async (event) => {
        event.preventDefault();
        if (!coinPackage || !paymentMethodId || paying || payment) return;

        setPaying(true);
        setError('');
        setStatusMessage('');
        try {
            const result = await purchaseCoins(coinPackage.id, paymentMethodId);
            savePendingPayment(packageId, result);
            setPayment(result);
            setStatusMessage('รอการชำระเงิน');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถชำระเงินได้');
        } finally {
            setPaying(false);
        }
    };

    const checkPayment = async (uploadSlip = false) => {
        if (!payment?.paymentTransactionId || checking || cancelling || (uploadSlip && (!slip || (payment.paymentStatus && payment.paymentStatus !== 'PENDING')))) return;
        setChecking(true);
        setError('');
        try {
            const result = uploadSlip
                ? (await verifyPaymentSlip(payment.paymentTransactionId, slip)).payment
                : await getPaymentStatus(payment.paymentTransactionId);
            if (result?.paymentStatus) {
                setPayment((current) => ({ ...current, paymentStatus: result.paymentStatus }));
            }
            if (result?.paymentStatus === 'COMPLETED') {
                clearSavedPendingPayment();
                const wallet = await getWallet();
                onBalanceChange?.(wallet?.balance ?? 0);
                navigate('/wallet/transactions', {
                    replace: true,
                    state: { paymentSuccess: `ซื้อ ${coinPackage.coinAmount} เหรียญสำเร็จ` },
                });
            } else {
                if (result?.paymentStatus && result.paymentStatus !== 'PENDING') clearSavedPendingPayment();
                setStatusMessage(result?.paymentStatus === 'PENDING' ? 'รอการชำระเงิน กรุณาชำระเงินแล้วแนบสลิป' : `สถานะ: ${result?.paymentStatus ?? 'ไม่ทราบ'}`);
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถตรวจสอบการชำระเงินได้ กรุณาลองตรวจสอบสถานะอีกครั้ง');
        } finally {
            setChecking(false);
        }
    };

    const cancelCurrentPayment = async () => {
        if (!payment?.paymentTransactionId || checking || cancelling || (payment.paymentStatus && payment.paymentStatus !== 'PENDING')) return;

        setCancelling(true);
        setError('');
        try {
            await cancelPayment(payment.paymentTransactionId);
            clearSavedPendingPayment();
            setPayment(null);
            setSlip(null);
            setStatusMessage('ยกเลิกการชำระเงินแล้ว สามารถเลือกรายการชำระเงินใหม่ได้');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถยกเลิกการชำระเงินได้ กรุณาตรวจสอบสถานะแล้วลองอีกครั้ง');
        } finally {
            setCancelling(false);
        }
    };

    return {
        packageId, coinPackage, paymentMethods, paymentMethodId, setPaymentMethodId,
        loading, paying, error, payment, slip, setSlip, checking, statusMessage,
        submitPayment, checkPayment, cancelling, cancelCurrentPayment,
    };
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCoinPackages, getPaymentMethods, getWallet, purchaseCoins, getPaymentStatus, verifyPaymentSlip, cancelPayment, cancelPaymentOnPageExit } from '../../../api/coinPurchaseApi';

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
    const pendingTransaction = useRef(null);
    const pageActive = useRef(false);

    useEffect(() => {
        pageActive.current = true;
        const cancelPending = (exitingDocument = false) => {
            const transactionId = pendingTransaction.current;
            if (!transactionId) return;
            pendingTransaction.current = null;
            const cancel = exitingDocument ? cancelPaymentOnPageExit : cancelPayment;
            void cancel(transactionId).catch(() => {
                // A completed payment may already have been settled by the server.
            });
        };
        const handlePageHide = () => cancelPending(true);
        window.addEventListener('pagehide', handlePageHide);
        return () => {
            pageActive.current = false;
            window.removeEventListener('pagehide', handlePageHide);
            cancelPending();
        };
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !packageId) return;

        let active = true;
        Promise.all([getCoinPackages(), getPaymentMethods()])
            .then(([packages, methods]) => {
                if (!active) return;
                setCoinPackage(packages.find((item) => String(item.id) === packageId) ?? null);
                setPaymentMethods(methods);
                setPaymentMethodId(String(methods[0]?.id ?? ''));
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
            if (!pageActive.current) {
                // Navigation can happen before the purchase request returns its ID.
                await cancelPayment(result.paymentTransactionId);
                return;
            }
            pendingTransaction.current = result.paymentTransactionId;
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
                if (result.paymentStatus !== 'PENDING') pendingTransaction.current = null;
                setPayment((current) => ({ ...current, paymentStatus: result.paymentStatus }));
            }
            if (!pageActive.current) return;
            if (result?.paymentStatus === 'COMPLETED') {
                const wallet = await getWallet();
                onBalanceChange?.(wallet?.balance ?? 0);
                navigate('/wallet/transactions', {
                    replace: true,
                    state: { paymentSuccess: `ซื้อ ${coinPackage.coinAmount} เหรียญสำเร็จ` },
                });
            } else {
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
            pendingTransaction.current = null;
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

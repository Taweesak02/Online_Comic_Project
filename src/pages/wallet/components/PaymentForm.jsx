import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentVerification from './PaymentVerification';
import PaymentSummary from './PaymentSummary';

export default function PaymentForm({
    coinPackage,
    paymentMethods,
    paymentMethodId,
    setPaymentMethodId,
    paying,
    payment,
    slip,
    setSlip,
    checking,
    statusMessage,
    submitPayment,
    checkPayment,
    cancelling,
    cancelCurrentPayment,
}) {
    return (
        <form className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={submitPayment}>
            <section className="rounded-4xl border border-[#e7e7e9] bg-white p-5 sm:p-7" aria-labelledby="payment-method-title">
                <h2 className="text-xl font-bold text-[#0d0c22]" id="payment-method-title">วิธีชำระเงิน</h2>
                <PaymentMethodSelector
                    paymentMethods={paymentMethods}
                    paymentMethodId={paymentMethodId}
                    onSelect={setPaymentMethodId}
                    disabled={paying || !!payment}
                />
                {payment && (
                    <PaymentVerification
                        payment={payment}
                        slip={slip}
                        checking={checking}
                        cancelling={cancelling}
                        onCancelPayment={cancelCurrentPayment}
                        statusMessage={statusMessage}
                        onSlipChange={setSlip}
                        onCheckPayment={checkPayment}
                    />
                )}
            </section>

            <PaymentSummary
                coinPackage={coinPackage}
                payment={payment}
                paying={paying}
                paymentMethodId={paymentMethodId}
            />
        </form>
    );
}

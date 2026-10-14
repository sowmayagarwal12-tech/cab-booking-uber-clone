import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, Banknote, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ ride, onConfirm, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('STRIPE_CARD');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('321');
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    try {
      await onConfirm({
        rideId: ride.id,
        paymentMethod: paymentMethod,
        stripeToken: 'tok_mock_visa_' + Date.now()
      });

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      alert('Payment processing failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold">Payment Confirmed!</h3>
            <p className="text-neutral-400 text-sm mt-1">
              ₹{ride.totalFare?.toFixed(2)} charged securely via Stripe
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Complete Payment</h3>
                <p className="text-xs text-neutral-400">Powered by Stripe Payments SDK</p>
              </div>
            </div>

            {/* Total Fare Card */}
            <div className="bg-neutral-800/80 rounded-2xl p-4 mb-5 border border-neutral-700/60">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-neutral-400">Total Ride Fare</span>
                <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded font-medium border border-blue-700/50">
                  {ride.vehicleType}
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                ₹{ride.totalFare ? ride.totalFare.toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-neutral-400 mt-2 flex items-center justify-between border-t border-neutral-700/50 pt-2">
                <span>Distance: {ride.distanceKm} km</span>
                <span>Duration: {ride.durationMinutes} mins</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-neutral-300 block">Select Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('STRIPE_CARD')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                    paymentMethod === 'STRIPE_CARD'
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                    paymentMethod === 'CASH'
                      ? 'border-emerald-500 bg-emerald-600/20 text-white'
                      : 'border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash Payment</span>
                </button>
              </div>
            </div>

            {/* Simulated Stripe Card Input Form */}
            {paymentMethod === 'STRIPE_CARD' && (
              <div className="space-y-3 mb-6 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <label className="text-[11px] text-neutral-400 font-medium">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 font-medium">Expires</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 font-medium">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="CVC"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/30"
            >
              <Lock className="w-4 h-4" />
              <span>{processing ? 'Processing...' : `Pay ₹${ride.totalFare?.toFixed(2)}`}</span>
            </button>

            <p className="text-[11px] text-center text-neutral-500 mt-3 flex items-center justify-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>256-bit End-to-End Encrypted Payment</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

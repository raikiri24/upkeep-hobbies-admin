import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { formatCurrency, formatCurrencyPlain } from '../utils/currency';

interface PaymentProcessorProps {
  total: number;
  onClose: () => void;
  onPaymentComplete: (method: 'cash' | 'card' | 'digital') => void;
  processing: boolean;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  total,
  onClose,
  onPaymentComplete,
  processing,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'digital' | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentMethods = [
    {
      id: 'cash' as const,
      name: 'Cash',
      icon: DollarSign,
      description: 'Pay with cash',
    },
    {
      id: 'card' as const,
      name: 'Card',
      icon: CreditCard,
      description: 'Credit or debit card',
    },
    {
      id: 'digital' as const,
      name: 'Digital Wallet',
      icon: Smartphone,
      description: 'Mobile payment',
    },
  ];

  const calculateChange = () => {
    if (selectedMethod === 'cash' && cashReceived) {
      const received = parseFloat(cashReceived);
      return received > total ? received - total : 0;
    }
    return 0;
  };

  const handlePayment = () => {
    if (selectedMethod && selectedMethod !== 'cash') {
      onPaymentComplete(selectedMethod);
      setShowSuccess(true);
    } else if (selectedMethod === 'cash' && cashReceived && parseFloat(cashReceived) >= total) {
      onPaymentComplete(selectedMethod);
      setShowSuccess(true);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center max-w-sm">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-400 mb-6">Transaction completed successfully.</p>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Total Amount */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-white">{formatCurrencyPlain(total)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full bg-slate-800 border rounded-lg p-4 text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-indigo-500 bg-slate-750'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === method.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{method.name}</h3>
                    <p className="text-sm text-slate-400">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cash Input */}
        {selectedMethod === 'cash' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cash Received
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {parseFloat(cashReceived) > 0 && (
              <div className="mt-2 text-sm">
                {parseFloat(cashReceived) < total ? (
                  <p className="text-red-400">
                    Insufficient amount. Need {formatCurrency(total - parseFloat(cashReceived))} more.
                  </p>
                ) : (
                  <p className="text-green-400">
                    Change: {formatCurrency(calculateChange())}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={
              !selectedMethod ||
              processing ||
              (selectedMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total))
            }
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {selectedMethod === 'cash' && 'Accept Cash'}
                {selectedMethod === 'card' && 'Process Card'}
                {selectedMethod === 'digital' && 'Process Digital Payment'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor;
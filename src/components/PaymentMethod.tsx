'use client';

import { CreditCard } from 'lucide-react';

interface PaymentMethodProps {
  onSelect: (method: 'card' | 'paypal' | 'bank') => void;
  selectedMethod?: 'card' | 'paypal' | 'bank';
}

export default function PaymentMethod({ onSelect, selectedMethod = 'card' }: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      {/* Méthodes de paiement */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onSelect('card')}
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedMethod === 'card'
              ? 'border-[#4CAF50] bg-[#E8F5E9]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-sm font-medium">Carte</p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('paypal')}
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedMethod === 'paypal'
              ? 'border-[#4CAF50] bg-[#E8F5E9]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-6 h-6 mx-auto mb-2 bg-blue-500 rounded"></div>
          <p className="text-sm font-medium">PayPal</p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('bank')}
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedMethod === 'bank'
              ? 'border-[#4CAF50] bg-[#E8F5E9]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-6 h-6 mx-auto mb-2 bg-green-500 rounded"></div>
          <p className="text-sm font-medium">Virement</p>
        </button>
      </div>
    </div>
  );
}


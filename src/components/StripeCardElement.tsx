'use client';

import { useEffect, useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, AlertCircle } from 'lucide-react';

interface StripeCardElementProps {
  onReady?: () => void;
  onError?: (error: string) => void;
}

export default function StripeCardElement({ onReady, onError }: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (elements && stripe) {
      setIsLoading(false);
      onReady?.();
    }
  }, [elements, stripe, onReady]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (!stripe || !elements) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Chargement du formulaire de paiement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Lock className="w-4 h-4" />
        <span>Paiement sécurisé SSL 256 bits</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded-lg">
        <PaymentElement
          onReady={() => {
            setIsLoading(false);
            setError(null);
            onReady?.();
          }}
          onChange={(e) => {
            if (e.error) {
              setError(e.error.message);
              onError?.(e.error.message);
            } else {
              setError(null);
            }
          }}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {isLoading && (
        <div className="text-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4CAF50] mx-auto"></div>
        </div>
      )}
    </div>
  );
}


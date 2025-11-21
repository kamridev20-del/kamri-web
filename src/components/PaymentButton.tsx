'use client';

import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function PaymentButton({
  clientSecret,
  amount,
  onSuccess,
  onError,
  disabled = false,
}: PaymentButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe n\'est pas encore chargé');
      return;
    }

    setProcessing(true);

    try {
      // ✅ IMPORTANT: Appeler elements.submit() AVANT confirmPayment()
      // Cela valide les éléments et prépare le paiement
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        onError(submitError.message || 'Erreur lors de la validation du formulaire');
        setProcessing(false);
        return;
      }

      // Confirmer le paiement avec PaymentElement
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Erreur lors du paiement');
        setProcessing(false);
        return;
      }

      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          onSuccess();
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure ou autre action requise
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (actionError) {
            onError(actionError.message || 'Erreur lors de l\'authentification');
            setProcessing(false);
          } else {
            onSuccess();
          }
        } else {
          onError('Le paiement n\'a pas pu être confirmé');
          setProcessing(false);
        }
      } else {
        onError('Le paiement n\'a pas pu être confirmé');
        setProcessing(false);
      }
    } catch (err: any) {
      onError(err.message || 'Erreur inattendue');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={!stripe || !elements || processing || disabled}
        className="w-full bg-[#4CAF50] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Traitement du paiement...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Confirmer et payer ${amount.toFixed(2)}</span>
          </>
        )}
      </button>
    </form>
  );
}


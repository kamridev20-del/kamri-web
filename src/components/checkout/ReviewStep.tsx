'use client';

import PaymentButton from '@/components/PaymentButton';
import StripeCardElement from '@/components/StripeCardElement';
import StripeProvider from '@/components/StripeProvider';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';
import { useMemo } from 'react';
import { Address } from './AddressStep';
import { ShippingOption } from '@/components/ShippingOptions';

interface ReviewStepProps {
  address: Address;
  shippingOption: ShippingOption | null;
  paymentMethod: 'card' | 'paypal' | 'bank';
  clientSecret: string | null;
  paymentIntentId: string | null;
  onPlaceOrder: () => Promise<void>;
  onBack?: () => void;
  processingPayment: boolean;
  error: string | null;
}

export default function ReviewStep({
  address,
  shippingOption,
  paymentMethod,
  clientSecret,
  paymentIntentId,
  onPlaceOrder,
  onBack,
  processingPayment,
  error,
}: ReviewStepProps) {
  const { cartItems } = useCart();

  const subtotal = useMemo(() => {
    return (cartItems || []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const shipping = useMemo(() => shippingOption?.freight || 0, [shippingOption?.freight]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const getImageUrl = (image: string | string[] | null | undefined): string | null => {
    if (!image) return null;
    if (typeof image === 'string') {
      try {
        const parsed = JSON.parse(image);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const url = parsed[0];
          return url && (url.startsWith('http://') || url.startsWith('https://')) ? url : null;
        }
        return image.startsWith('http://') || image.startsWith('https://') ? image : null;
      } catch {
        return image.startsWith('http://') || image.startsWith('https://') ? image : null;
      }
    } else if (Array.isArray(image) && image.length > 0) {
      const url = image[0];
      return url && (url.startsWith('http://') || url.startsWith('https://')) ? url : null;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif de la commande</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      
      {address && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Adresse de livraison</h3>
          <p className="text-sm text-gray-600">
            {address.street}<br />
            {address.zipCode} {address.city}<br />
            {address.state}, {address.country}
          </p>
        </div>
      )}

      {shippingOption && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Livraison</h3>
          <p className="text-sm text-gray-600">
            {shippingOption.logisticName} - {shippingOption.shippingTime}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Produits</h3>
        <div className="space-y-3">
          {(cartItems || []).map((item) => {
            const imageUrl = getImageUrl(item.product.image);
            
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`${imageUrl ? 'hidden' : 'flex'} w-16 h-16 bg-gray-200 rounded items-center justify-center`}>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {paymentMethod === 'card' && clientSecret ? (
        <StripeProvider clientSecret={clientSecret}>
          {/* Remonter les éléments Stripe pour que PaymentButton puisse les utiliser */}
          <StripeCardElement />
          <div className="mt-4">
            <PaymentButton
              clientSecret={clientSecret}
              amount={total}
              onSuccess={onPlaceOrder}
              onError={(err) => {
                console.error('Erreur paiement:', err);
              }}
              disabled={processingPayment}
            />
          </div>
        </StripeProvider>
      ) : (
        <div className="flex gap-4">
          {onBack && (
            <button
              onClick={onBack}
              disabled={processingPayment}
              className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retour
            </button>
          )}
          <button
            onClick={onPlaceOrder}
            disabled={processingPayment}
            className="flex-1 bg-[#4CAF50] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Confirmer et payer ${total.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}


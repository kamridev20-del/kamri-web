'use client';

import AddressStep, { Address } from '@/components/checkout/AddressStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import ReviewStep from '@/components/checkout/ReviewStep';
import ShippingStep from '@/components/checkout/ShippingStep';
import HomeFooter from '@/components/HomeFooter';
import ModernHeader from '@/components/ModernHeader';
import { ShippingOption } from '@/components/ShippingOptions';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';
import { ArrowLeft, CheckCircle, CreditCard, Package, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

type Step = 'address' | 'shipping' | 'payment' | 'review';

// Configuration de navigation entre les étapes
const getNextStep = (currentStep: Step, hasCJProducts: boolean): Step => {
  const navigationMap: Record<Step, Step> = {
    address: hasCJProducts ? 'shipping' : 'payment',
    shipping: 'payment',
    payment: 'review',
    review: 'review',
  };
  return navigationMap[currentStep];
};

const getPreviousStep = (currentStep: Step, hasCJProducts: boolean): Step => {
  const navigationMap: Record<Step, Step> = {
    address: 'address',
    shipping: 'address',
    payment: hasCJProducts ? 'shipping' : 'address',
    review: 'payment',
  };
  return navigationMap[currentStep];
};

// Validations
const validateOrder = (address: Address | null, hasCJProducts: boolean, selectedShippingOption: ShippingOption | null) => {
  const errors: string[] = [];
  
  !address && errors.push('Veuillez compléter votre adresse');
  hasCJProducts && !selectedShippingOption && errors.push('Veuillez sélectionner une option de livraison');
  
  return errors;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  
  // États pour l'orchestration des étapes
  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // États partagés entre les étapes (passés aux composants)
  const [address, setAddress] = useState<Address | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Calculs mémorisés
  const subtotal = useMemo(() => {
    return (cartItems || []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const shipping = useMemo(() => selectedShippingOption?.freight || 0, [selectedShippingOption?.freight]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const hasCJProducts = useMemo(() => {
    return (cartItems || []).some(item => 
      (item.product as any).source === 'cj-dropshipping' || 
      (item.product as any).cjProductId
    );
  }, [cartItems]);

  // Handlers pour la navigation entre les étapes
  const handleAddressNext = useCallback((addr: Address) => {
    setAddress(addr);
    setCurrentStep(getNextStep('address', hasCJProducts));
  }, [hasCJProducts]);

  const handleShippingNext = useCallback((option: ShippingOption) => {
    setSelectedShippingOption(option);
    setCurrentStep(getNextStep('shipping', hasCJProducts));
  }, [hasCJProducts]);

  const handleShippingBack = useCallback(() => {
    setCurrentStep(getPreviousStep('shipping', hasCJProducts));
  }, [hasCJProducts]);

  const handlePaymentNext = useCallback((paymentData?: { method: 'card' | 'paypal' | 'bank'; clientSecret: string | null; paymentIntentId: string | null }) => {
    if (paymentData) {
      setPaymentMethod(paymentData.method);
      setClientSecret(paymentData.clientSecret);
      setPaymentIntentId(paymentData.paymentIntentId);
    }
    setCurrentStep(getNextStep('payment', hasCJProducts));
  }, [hasCJProducts]);

  const handlePaymentBack = useCallback(() => {
    setCurrentStep(getPreviousStep('payment', hasCJProducts));
  }, [hasCJProducts]);


  const handlePlaceOrder = useCallback(async () => {
    const validationErrors = validateOrder(address, hasCJProducts, selectedShippingOption);
    
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      const orderItems = (cartItems || []).map(item => ({
        productId: item.productId,
        variantId: (item as any).variantId || null,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderResponse = await apiClient.createOrder({
        items: orderItems,
        shippingAddress: {
          street: address!.street,
          city: address!.city,
          state: address!.state,
          zipCode: address!.zipCode,
          country: address!.country,
        },
        shippingMethod: selectedShippingOption?.logisticName || 'Standard',
        shippingCost: shipping,
        paymentMethod: paymentMethod,
        total: total,
        paymentIntentId: paymentMethod === 'card' ? paymentIntentId : undefined,
      });

      if (orderResponse.error) {
        throw new Error(orderResponse.error);
      }

      const orderId = orderResponse.data?.id || '';
      
      // Rediriger immédiatement sans vider le panier ici
      // Le panier sera vidé sur la page de confirmation ou par le backend
      router.replace(`/order-confirmation?orderId=${orderId}`);
      
      // Ne pas vider le panier ici pour éviter le message "panier vide"
      // Le panier sera géré par la page de confirmation ou le backend
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la commande');
      setProcessingPayment(false);
    }
  }, [address, hasCJProducts, selectedShippingOption, shipping, paymentMethod, total, paymentIntentId, cartItems, router]);

  const handleReviewBack = useCallback(() => {
    setCurrentStep(getPreviousStep('review', hasCJProducts));
  }, [hasCJProducts]);

  // Mémoriser steps AVANT tout return conditionnel (règle des hooks)
  const steps = useMemo(() => [
    { id: 'address' as const, label: 'Adresse', icon: Package },
    ...(hasCJProducts ? [{ id: 'shipping' as const, label: 'Livraison', icon: Truck }] : []),
    { id: 'payment' as const, label: 'Paiement', icon: CreditCard },
    { id: 'review' as const, label: 'Récapitulatif', icon: CheckCircle },
  ], [hasCJProducts]);

  // Early return pour panier vide (calculé avec useMemo pour éviter les re-renders)
  // Ne pas afficher "panier vide" si une commande est en cours de traitement
  const isEmptyCart = useMemo(() => {
    if (processingPayment) return false; // Ne pas afficher pendant le traitement
    return !cartItems || cartItems.length === 0;
  }, [cartItems, processingPayment]);
  
  if (isEmptyCart) {
    return (
      <div className="min-h-screen bg-[#F0F8F0]">
        <ModernHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">Ajoutez des produits avant de passer commande</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors"
          >
            Continuer les achats
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au panier</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = steps.findIndex(s => s.id === currentStep) === index;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                          : isCompleted
                          ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-[#4CAF50]' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-[#4CAF50]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {currentStep === 'address' && (
              <AddressStep onNext={handleAddressNext} initialAddress={address} />
            )}

            {currentStep === 'shipping' && hasCJProducts && address && (
              <ShippingStep address={address} onNext={handleShippingNext} onBack={handleShippingBack} />
            )}

            {currentStep === 'payment' && (
              <PaymentStep total={total} onNext={handlePaymentNext} onBack={handlePaymentBack} />
            )}

            {currentStep === 'review' && (
              <ReviewStep
                address={address!}
                shippingOption={selectedShippingOption}
                paymentMethod={paymentMethod}
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                onPlaceOrder={handlePlaceOrder}
                onBack={handleReviewBack}
                processingPayment={processingPayment}
                error={error}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {selectedShippingOption ? `$${shipping.toFixed(2)}` : 'À calculer'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-[#4CAF50]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Paiement sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

'use client';

import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import RecommendedProducts from '../../components/RecommendedProducts';
import AddressStep, { Address } from '../../components/checkout/AddressStep';
import PaymentStep from '../../components/checkout/PaymentStep';
import ReviewStep from '../../components/checkout/ReviewStep';
import ShippingStep from '../../components/checkout/ShippingStep';
import { ShippingOption } from '../../components/ShippingOptions';
import { useCart } from '../../contexts/CartContext';
import { useGeo } from '../../contexts/GeoContext';
import { apiClient } from '../../lib/api';
import { ArrowLeft, CheckCircle, CreditCard, Package, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const url = parsed[0];
        // Vérifier que c'est une URL valide
        return url && (url.startsWith('http://') || url.startsWith('https://')) ? url : null;
      }
      // Si ce n'est pas un tableau, vérifier que c'est une URL valide
      return image.startsWith('http://') || image.startsWith('https://') ? image : null;
    } catch {
      // Si le parsing échoue, vérifier que c'est une URL valide
      return image.startsWith('http://') || image.startsWith('https://') ? image : null;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    const url = image[0];
    return url && (url.startsWith('http://') || url.startsWith('https://')) ? url : null;
  }
  
  return null;
};

interface CartGroup {
  originCountryCode: string;
  originCountryName: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    variantId?: string;
    cjVariantId?: string;
    image?: string;
  }>;
  shippingOptions?: Array<{
    logisticName: string;
    shippingTime: string;
    freight: number;
    currency: string;
  }>;
  selectedShippingOption?: {
    logisticName: string;
    shippingTime: string;
    freight: number;
    currency: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
}

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

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartCount, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { country } = useGeo();

  // État pour basculer entre panier et checkout
  const [showCheckout, setShowCheckout] = useState(false);
  
  // États pour le checkout
  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // États pour le groupement par origine
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const cartGroupsRef = useRef<CartGroup[]>([]);

  // ⚠️ IMPORTANT: Ne JAMAIS appeler setState dans le JSX/render
  // Si vous avez besoin d'initialiser des quantités, utilisez un useEffect comme ci-dessous
  // ❌ INTERDIT: {cartItems?.map(item => { if (!itemQuantities[item.id]) { setItemQuantities(...) } })}
  
  // Nettoyer automatiquement selectedItems quand des items sont retirés du panier
  // Utiliser une ref pour éviter les re-renders inutiles
  const cartItemsForCleanupRef = useRef(cartItems);
  
  useEffect(() => {
    cartItemsForCleanupRef.current = cartItems;
  }, [cartItems]);
  
  // Initialiser selectedItems avec TOUS les articles par défaut
  // La sélection ne sert qu'à permettre la suppression sélective
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const allItemIds = new Set(cartItems.map(item => item.id));
      
      // Vérifier si tous les articles sont déjà sélectionnés
      const allSelected = cartItems.every(item => selectedItems.has(item.id));
      
      // Si ce n'est pas le cas, sélectionner tous les articles
      if (!allSelected || selectedItems.size !== allItemIds.size) {
        setSelectedItems(allItemIds);
      }
    } else {
      // Si le panier est vide, vider la sélection
      setSelectedItems(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems?.length]); // Seulement dépendre de la longueur pour éviter les re-renders
  
  // Nettoyer les items supprimés de la sélection
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
    setSelectedItems(prev => {
        const currentCartItems = cartItemsForCleanupRef.current;
      const newSet = new Set(prev);
      let hasChanges = false;
      
      // Supprimer les items qui ne sont plus dans le panier
      for (const id of prev) {
          if (!currentCartItems?.find(x => x.id === id)) {
          newSet.delete(id);
          hasChanges = true;
        }
      }
        
        // Ajouter les nouveaux items qui ne sont pas encore sélectionnés
        for (const item of currentCartItems) {
          if (!newSet.has(item.id)) {
            newSet.add(item.id);
            hasChanges = true;
          }
        }
      
      // Ne retourner un nouveau Set que s'il y a eu des changements
      return hasChanges ? newSet : prev;
    });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems?.length]); // Seulement dépendre de la longueur, pas de l'objet entier

  // Charger les groupes du panier
  useEffect(() => {
    console.log('🔄 [CartPage] useEffect déclenché:', {
      cartItemsLength: cartItems?.length,
      countryCode: country?.countryCode,
      loadingGroups,
      cartItemsRef: cartItems,
      countryRef: country,
    });

    const loadGroups = async () => {
      if (!cartItems || cartItems.length === 0 || !country || !country.countryCode) {
        if (cartGroupsRef.current.length > 0) {
          setCartGroups([]);
          cartGroupsRef.current = [];
        }
        return;
      }

      setLoadingGroups(true);
      setGroupsError(null);
      try {
        const response = await apiClient.getGroupedCart(country.countryCode);
        if (response.data) {
          setCartGroups(response.data);
          cartGroupsRef.current = response.data;
        } else {
          setGroupsError('Erreur lors du chargement des groupes');
        }
      } catch (error: any) {
        console.error('Erreur chargement groupes:', error);
        // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
        const errorMessage = typeof error?.message === 'string' 
          ? error.message 
          : (error?.message as any)?.message || String(error) || 'Erreur lors du chargement des groupes';
        setGroupsError(errorMessage);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [cartItems?.length, country?.countryCode]);

  // Calculs basés sur les groupes (mémorisés pour éviter les re-renders)
  const subtotal = useMemo(() => 
    (cartGroups || []).reduce((sum, group) => sum + group.subtotal, 0),
    [cartGroups]
  );

  const totalShipping = useMemo(() => 
    (cartGroups || []).reduce((sum, group) => sum + group.shippingCost, 0),
    [cartGroups]
  );

  const totalSavings = useMemo(() => 
    (cartItems || []).reduce((sum, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      return sum + ((originalPrice - item.product.price) * item.quantity);
    }, 0),
    [cartItems]
  );
  
  const promoDiscount = useMemo(() => 
    promoCode === 'WELCOME10' ? subtotal * 0.1 : 0,
    [promoCode, subtotal]
  );

  const total = useMemo(() => 
    subtotal + totalShipping - promoDiscount,
    [subtotal, totalShipping, promoDiscount]
  );
  
  // Calcul du pourcentage moyen de réduction (mémorisé)
  const averageDiscountPercentage = useMemo(() => {
    const itemsWithDiscount = (cartItems || []).filter(item => item.product.originalPrice && item.product.originalPrice > item.product.price);
    return itemsWithDiscount.length > 0 
      ? itemsWithDiscount.reduce((sum, item) => sum + calculateDiscountPercentage(item.product.originalPrice!, item.product.price), 0) / itemsWithDiscount.length
      : 0;
  }, [cartItems]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article de votre panier ?')) {
      try {
        await removeFromCart(itemId);
        // La mise à jour de selectedItems sera gérée automatiquement par le useEffect
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const toggleSelectAll = () => {
    const items = cartItems || [];
    if (selectedItems.size === items.length && items.length > 0) {
      // Si tout est sélectionné, désélectionner tout (pour permettre la suppression)
      setSelectedItems(new Set());
    } else {
      // Sinon, sélectionner tous les articles
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };
  
  // Fonction pour supprimer uniquement les articles sélectionnés
  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) {
      alert('Aucun article sélectionné');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.size} article(s) de votre panier ?`)) {
      try {
        // Supprimer tous les articles sélectionnés
        const promises = Array.from(selectedItems).map(itemId => removeFromCart(itemId));
        await Promise.all(promises);
        // La mise à jour de selectedItems sera gérée automatiquement par le useEffect
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const applyPromoCode = () => {
    if (promoCode === 'WELCOME10') {
      alert('Code appliqué ! Réduction de 10% appliquée');
    } else {
      alert('Code invalide - Le code promo n\'est pas valide');
    }
  };

  // Calculs pour le checkout
  const checkoutSubtotal = useMemo(() => {
    return (cartItems || []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const checkoutShipping = useMemo(() => selectedShippingOption?.freight || 0, [selectedShippingOption?.freight]);
  const checkoutTotal = useMemo(() => checkoutSubtotal + checkoutShipping, [checkoutSubtotal, checkoutShipping]);

  const hasCJProducts = useMemo(() => {
    return (cartItems || []).some(item => 
      (item.product as any).source === 'cj-dropshipping' || 
      (item.product as any).cjProductId
    );
  }, [cartItems]);

  // Handlers pour le checkout
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
        shippingCost: checkoutShipping,
        paymentMethod: paymentMethod,
        total: checkoutTotal,
        paymentIntentId: paymentMethod === 'card' ? paymentIntentId : undefined,
      });

      if (orderResponse.error) {
        throw new Error(orderResponse.error);
      }

      const orderId = orderResponse.data?.id || '';
      
      // Message de confirmation avant redirection
      console.log('✅ Commande créée avec succès:', orderId);
      
      // Rediriger vers la page de confirmation
      // Le panier sera vidé dans la page de confirmation une fois qu'elle est complètement chargée
      router.push(`/order-confirmation?orderId=${orderId}&success=true`);
    } catch (err: any) {
      // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
      const errorMessage = typeof err?.message === 'string' 
        ? err.message 
        : (err?.message as any)?.message || String(err) || 'Erreur lors de la création de la commande';
      setError(errorMessage);
      setProcessingPayment(false);
    }
  }, [address, hasCJProducts, selectedShippingOption, checkoutShipping, paymentMethod, checkoutTotal, paymentIntentId, cartItems, clearCart, router]);

  const handleReviewBack = useCallback(() => {
    setCurrentStep(getPreviousStep('review', hasCJProducts));
  }, [hasCJProducts]);

  const proceedToCheckout = useCallback(() => {
    if (!cartItems || cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    // Basculer vers le checkout au lieu de rediriger
    setShowCheckout(true);
    setCurrentStep('address');
    setError(null);
  }, [cartItems]);

  const handleBackToCart = useCallback(() => {
    setShowCheckout(false);
    setCurrentStep('address');
    setError(null);
  }, []);

  // Revenir au panier si le panier devient vide pendant le checkout
  // Utiliser une ref pour éviter les re-renders inutiles (bonne pratique de l'article)
  const wasCheckoutActiveRef = useRef(false);
  
  useEffect(() => {
    wasCheckoutActiveRef.current = showCheckout;
  }, [showCheckout]);
  
  useEffect(() => {
    // Ne revenir au panier que si on était en checkout ET que le panier devient vide
    // Éviter les updates inutiles si on n'est pas en checkout
    if (wasCheckoutActiveRef.current && (!cartItems || cartItems.length === 0)) {
      setShowCheckout(false);
      setCurrentStep('address');
      wasCheckoutActiveRef.current = false;
    }
  }, [cartItems]); // Seulement dépendre de cartItems, pas de showCheckout

  // Mémoriser steps pour le checkout
  const steps = useMemo(() => [
    { id: 'address' as const, label: 'Adresse', icon: Package },
    ...(hasCJProducts ? [{ id: 'shipping' as const, label: 'Livraison', icon: Truck }] : []),
    { id: 'payment' as const, label: 'Paiement', icon: CreditCard },
    { id: 'review' as const, label: 'Récapitulatif', icon: CheckCircle },
  ], [hasCJProducts]);

  // Rendu principal
  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        </div>
      ) : showCheckout ? (
        // VUE CHECKOUT
        <>
          <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
                  Finaliser la commande
                </h1>
              </motion.div>
            </div>
          </section>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
              onClick={handleBackToCart}
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
                  <PaymentStep total={checkoutTotal} onNext={handlePaymentNext} onBack={handlePaymentBack} />
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
                      <span className="font-medium">${checkoutSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Livraison</span>
                      <span className="font-medium">
                        {selectedShippingOption ? `$${checkoutShipping.toFixed(2)}` : 'À calculer'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-[#4CAF50]">${checkoutTotal.toFixed(2)}</span>
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
        </>
      ) : (
        // VUE PANIER (code existant)
        <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
              Mon Panier
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              {(cartItems || []).length} article(s) dans votre panier
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Articles du panier */}
          <div className="lg:col-span-2">
            {/* Header avec sélection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex justify-between items-center">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-3 text-[#424242] hover:text-[#4CAF50] transition-colors duration-300"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedItems.size === (cartItems || []).length 
                      ? 'bg-[#4CAF50] border-[#4CAF50]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedItems.size === (cartItems || []).length && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">
                    {selectedItems.size === (cartItems || []).length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </span>
                </button>
                
                {selectedItems.size > 0 && selectedItems.size < (cartItems || []).length && (
                  <button
                    onClick={handleRemoveSelected}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer sélection ({selectedItems.size})</span>
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                      try {
                        await clearCart();
                        console.log('✅ Panier vidé avec succès');
                      } catch (error) {
                        console.error('❌ Erreur lors du vidage du panier:', error);
                      }
                    }
                  }}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Vider le panier</span>
                </button>
              </div>
            </motion.div>

            {/* Liste des groupes par origine */}
            {loadingGroups ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
                <p className="text-[#424242]">Chargement des groupes...</p>
              </div>
            ) : groupsError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6">
                <p className="text-red-800">{groupsError}</p>
              </div>
            ) : cartGroups.length > 0 ? (
              <div className="space-y-6">
                {cartGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.originCountryCode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    {/* En-tête du groupe */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F5E8] flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M15 11a3 3 0 11-6 0M18 11a3 3 0 11-6 0m6 0v1a2 2 0 01-2 2h-2M9 11v1a2 2 0 002 2h2m-4-4h.01M21 11a3 3 0 11-6 0m6 0v1a2 2 0 01-2 2h-2m-4-4h.01" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[#424242]">Expédié depuis {group.originCountryName}</h3>
                          <p className="text-sm text-gray-500">{group.items.length} article(s)</p>
                        </div>
                      </div>
                      {group.shippingOptions && group.shippingOptions.length > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Livraison</p>
                          <p className="font-semibold text-[#4CAF50]">
                            {group.selectedShippingOption?.logisticName || 'Standard'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {group.selectedShippingOption?.shippingTime || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Articles du groupe */}
                    <div className="space-y-4">
                      {group.items.map((item, itemIndex) => {
                        const cartItem = (cartItems || []).find(ci => ci.id === item.id);
                        if (!cartItem) return null;
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                            className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {/* Image - Cliquable */}
                            <Link 
                              href={`/product/${item.productId}`}
                              className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(() => {
                                const imageUrl = getCleanImageUrl(item.image);
                                return imageUrl ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={item.productName} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                );
                              })()}
                            </Link>

                            {/* Détails */}
                            <div className="flex-1">
                              <Link 
                                href={`/product/${item.productId}`}
                                className="block mb-1 group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h4 className="font-semibold text-[#424242] group-hover:text-[#4CAF50] transition-colors cursor-pointer">
                                  {item.productName}
                                </h4>
                              </Link>
                              <p className="text-sm text-gray-500 mb-2">${item.price.toFixed(2)} × {item.quantity}</p>
                              
                              {/* Contrôles quantité */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="ml-auto text-red-500 hover:text-red-600 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Prix total */}
                            <div className="text-right">
                              <p className="font-bold text-lg text-[#4CAF50]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Résumé du groupe */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Sous-total</p>
                        <p className="font-semibold text-lg">${group.subtotal.toFixed(2)}</p>
                      </div>
                      {group.shippingCost > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Livraison</p>
                          <p className="font-semibold text-lg text-[#4CAF50]">${group.shippingCost.toFixed(2)}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total groupe</p>
                        <p className="font-bold text-xl text-[#4CAF50]">${group.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-[#424242]">Votre panier est vide</p>
              </div>
            )}

            {/* Ancien affichage (fallback si pas de groupes) */}
            {cartGroups.length === 0 && !loadingGroups && (
              <div className="space-y-4">
                {(cartItems || []).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox de sélection */}
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-2 ${
                        selectedItems.has(item.id) 
                          ? 'bg-[#4CAF50] border-[#4CAF50]' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Image du produit - Cliquable */}
                    <Link 
                      href={`/product/${item.product.id}`}
                      className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(() => {
                        const imageUrl = getCleanImageUrl(item.product.image);
                        return imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null;
                      })()}
                      <div className={`${getCleanImageUrl(item.product.image) ? 'hidden' : 'flex'} w-full h-full bg-gray-100 items-center justify-center`}>
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </Link>
                    
                    {/* Détails du produit */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link 
                            href={`/product/${item.product.id}`}
                            className="block group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <h3 className="text-lg font-semibold text-[#424242] mb-1 group-hover:text-[#4CAF50] transition-colors cursor-pointer">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {item.product.category?.name || 'Non catégorisé'} • {item.product.supplier?.name || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-300 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#4CAF50]">{item.product.price}$</span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-sm text-gray-500 line-through">{item.product.originalPrice}$</span>
                            )}
                          </div>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span className="bg-[#E8F5E8] text-[#4CAF50] px-2 py-1 rounded-full text-sm font-medium">
                              {formatDiscountPercentage(calculateDiscountPercentage(item.product.originalPrice, item.product.price))}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {item.product.stock <= 0 && (
                        <div className="mt-2">
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}

            {/* Code promo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 mt-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#424242]">Code promo</h3>
                <button
                  onClick={() => setShowPromoInput(!showPromoInput)}
                  className="text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors duration-300"
                >
                  {showPromoInput ? 'Masquer' : 'J\'ai un code'}
                </button>
              </div>
              
              {showPromoInput && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Entrez votre code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#45a049] transition-colors duration-300"
                  >
                    Appliquer
                  </button>
                </div>
              )}
            </motion.div>

            {/* Produits recommandés */}
            <RecommendedProducts />
          </div>

          {/* Sidebar - Résumé et commande */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
            >
              <h3 className="text-xl font-bold text-[#424242] mb-6">Résumé de la commande</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)}$</span>
                </div>
                
                {averageDiscountPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Économies</span>
                    <span className="text-[#4CAF50] font-medium">
                      {formatDiscountPercentage(Math.round(averageDiscountPercentage))}
                    </span>
                  </div>
                )}
                
                {/* Détail des frais de livraison par groupe */}
                {cartGroups.length > 1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Livraison</span>
                      <span className="font-medium">
                        {totalShipping === 0 ? 'Gratuite' : `${totalShipping.toFixed(2)}$`}
                      </span>
                    </div>
                    <div className="pl-4 space-y-1 text-sm text-gray-500">
                      {cartGroups.map((group) => (
                        group.shippingCost > 0 && (
                          <div key={group.originCountryCode} className="flex justify-between">
                            <span>{group.originCountryName}:</span>
                            <span>${group.shippingCost.toFixed(2)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                {cartGroups.length <= 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">
                      {totalShipping === 0 ? 'Gratuite' : `${totalShipping.toFixed(2)}$`}
                    </span>
                  </div>
                )}
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Réduction promo</span>
                    <span className="text-[#4CAF50] font-medium">-{promoDiscount.toFixed(2)}$</span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#424242]">Total</span>
                    <span className="text-xl font-bold text-[#4CAF50]">{total.toFixed(2)}$</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  {selectedItems.size} article(s) sélectionné(s)
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={proceedToCheckout}
                  className="w-full bg-[#4CAF50] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#45a049] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  Commander
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
                
                <a 
                  href="/products" 
                  className="w-full text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors duration-300 text-center block py-2"
                >
                  Continuer mes achats
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
        </>
      )}
      
      <HomeFooter />
    </div>
  );
}
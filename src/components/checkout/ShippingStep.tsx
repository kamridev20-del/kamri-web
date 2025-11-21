'use client';

import { ShippingOption, ShippingOptions } from '@/components/ShippingOptions';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Address } from './AddressStep';

interface ShippingStepProps {
  address: Address;
  onNext: (shippingOption: ShippingOption) => void;
  onBack?: () => void;
}

export default function ShippingStep({ address, onNext, onBack }: ShippingStepProps) {
  const { cartItems } = useCart();
  
  // États locaux
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isCalculatingFreightRef = useRef(false);
  const cartItemsRef = useRef(cartItems);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const hasCJProducts = useMemo(() => {
    return (cartItems || []).some(item => 
      (item.product as any).source === 'cj-dropshipping' || 
      (item.product as any).cjProductId
    );
  }, [cartItems]);

  const normalizeCountryCode = useCallback((country: string | null | undefined): string => {
    if (!country) return 'FR';
    if (country.length === 2 && country === country.toUpperCase()) return country;
    
    const countryMap: Record<string, string> = {
      'france': 'FR', 'belgium': 'BE', 'belgique': 'BE',
      'united states': 'US', 'usa': 'US', 'canada': 'CA',
      'united kingdom': 'GB', 'uk': 'GB',
      'germany': 'DE', 'deutschland': 'DE', 'allemagne': 'DE',
      'spain': 'ES', 'espagne': 'ES',
      'italy': 'IT', 'italie': 'IT',
      'switzerland': 'CH', 'suisse': 'CH',
      'netherlands': 'NL', 'pays-bas': 'NL', 'hollande': 'NL',
    };
    
    return countryMap[country.toLowerCase().trim()] || 'FR';
  }, []);

  const calculateFreight = useCallback(async (addr: Address) => {
    if (isCalculatingFreightRef.current) return;
    isCalculatingFreightRef.current = true;
    setLoadingShipping(true);
    setError(null);

    try {
      const cjProducts = (cartItemsRef.current || []).filter(item => 
        (item.product as any).source === 'cj-dropshipping' || 
        (item.product as any).cjProductId
      );

      if (cjProducts.length === 0) {
        setShippingOptions([]);
        return;
      }

      const products: Array<{ vid: string; quantity: number }> = [];
      let originCountryCode = 'CN';
      
      for (const item of cjProducts) {
        const product = item.product as any;
        if (product.originCountryCode) {
          originCountryCode = product.originCountryCode;
        }
        
        let variant = null;
        if ((item as any).variantId && product.productVariants) {
          variant = product.productVariants.find(
            (v: any) => v.id === (item as any).variantId && v.cjVariantId
          );
        }
        if (!variant && product.productVariants) {
          variant = product.productVariants.find((v: any) => v.cjVariantId);
        }
        if (!variant && product.productVariants?.length > 0) {
          variant = product.productVariants[0];
        }
        
        if (variant?.cjVariantId) {
          products.push({ vid: variant.cjVariantId, quantity: item.quantity });
        }
      }

      if (products.length === 0) {
        setShippingOptions([]);
        return;
      }

      const destinationCountryCode = normalizeCountryCode(addr.country);
      const response = await apiClient.calculateCJFreight({
        startCountryCode: originCountryCode,
        endCountryCode: destinationCountryCode,
        zip: addr.zipCode,
        products
      });

      if (response.error) {
        // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error as any)?.message || 'Erreur lors du calcul des options de livraison';
        setError(errorMessage);
        setShippingOptions([]);
        return;
      }

      if (response.data?.freightOptions?.length > 0) {
        setShippingOptions(response.data.freightOptions);
        setSelectedShippingOption(response.data.freightOptions[0]);
      } else {
        setShippingOptions([]);
        setError('Aucune option de livraison disponible');
      }
    } catch (err: any) {
      console.error('Erreur calcul fret:', err);
      // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
      const errorMessage = typeof err?.message === 'string' 
        ? err.message 
        : (err?.message as any)?.message || String(err) || 'Erreur lors du calcul des options de livraison';
      setError(errorMessage);
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
      isCalculatingFreightRef.current = false;
    }
  }, [normalizeCountryCode]);

  useEffect(() => {
    if (hasCJProducts && address) {
      setTimeout(() => calculateFreight(address), 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, hasCJProducts]); // calculateFreight est stable grâce à useCallback

  const handleSelect = useCallback((option: ShippingOption) => {
    setSelectedShippingOption(option);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedShippingOption) {
      setError('Veuillez sélectionner une option de livraison');
      return;
    }
    onNext(selectedShippingOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShippingOption]); // onNext est stable grâce à useCallback dans le parent

  if (!hasCJProducts) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Options de livraison</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      
      {loadingShipping ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Calcul des options de livraison...</p>
        </div>
      ) : (
        <>
          <ShippingOptions
            options={shippingOptions}
            loading={false}
            error={null}
            selectedOption={selectedShippingOption}
            onSelect={handleSelect}
          />
          
          <div className="mt-6 flex gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Retour
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={!selectedShippingOption}
              className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer vers le paiement
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}


'use client';

import AddressForm from '@/components/AddressForm';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { CheckCircle, Package } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressStepProps {
  onNext: (address: Address) => void;
  initialAddress?: Address | null;
  loading?: boolean;
}

export default function AddressStep({ onNext, initialAddress, loading: parentLoading }: AddressStepProps) {
  const { user } = useAuth();
  
  // États locaux - Initialiser avec initialAddress seulement au premier rendu (solution Stack Overflow)
  const [address, setAddress] = useState<Address | null>(() => initialAddress || null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const userIdRef = useRef<string | null>(null);
  const addressesLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  // Note: initialAddress est utilisé uniquement pour l'initialisation via useState(() => ...)
  // On ne synchronise pas avec initialAddress après le premier rendu pour éviter les boucles infinies
  // (Solution Stack Overflow : ne jamais appeler setState directement dans le corps du composant)

  // Charger les adresses sauvegardées
  useEffect(() => {
    const userId = user?.id || null;
    
    if (!userId) {
      setSavedAddresses([]);
      addressesLoadedRef.current = null;
      return;
    }
    
    if (addressesLoadedRef.current === userId) return;
    
    const loadAddresses = async () => {
      addressesLoadedRef.current = userId;
      try {
        console.log('📦 [AddressStep] Chargement des adresses pour userId:', userId);
        const response = await apiClient.getAddresses();
        if (response.data) {
          const addressesData = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
          const formattedAddresses: Address[] = addressesData.map((addr: any) => ({
            id: addr.id,
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zipCode: addr.zipCode || '',
            country: addr.country || 'FR',
            isDefault: addr.isDefault || false,
          }));
          
          console.log('✅ [AddressStep] Adresses chargées:', formattedAddresses.length);
          setSavedAddresses(formattedAddresses);
          
          const defaultAddress = formattedAddresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            console.log('📍 [AddressStep] Adresse par défaut sélectionnée:', defaultAddress);
            setAddress(defaultAddress);
            setUseSavedAddress(true);
          } else if (formattedAddresses.length > 0) {
            console.log('📍 [AddressStep] Première adresse sélectionnée:', formattedAddresses[0]);
            setAddress(formattedAddresses[0]);
            setUseSavedAddress(true);
          }
        }
      } catch (err) {
        console.error('❌ [AddressStep] Erreur chargement adresses:', err);
        setSavedAddresses([]);
      }
    };

    loadAddresses();
  }, [user?.id]);

  const loadSavedAddresses = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;
    
    try {
      const response = await apiClient.getAddresses();
      if (response.data) {
        const addressesData = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        const formattedAddresses: Address[] = addressesData.map((addr: any) => ({
          id: addr.id,
          street: addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          country: addr.country || 'FR',
          isDefault: addr.isDefault || false,
        }));
        setSavedAddresses(formattedAddresses);
      }
    } catch (err) {
      console.error('Erreur chargement adresses:', err);
    }
  }, []);

  const handleSubmit = useCallback(async (newAddress: Address) => {
    if (user) {
      try {
        await apiClient.createAddress({
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          zipCode: newAddress.zipCode,
          country: newAddress.country,
          isDefault: savedAddresses.length === 0,
        });
        await loadSavedAddresses();
      } catch (err) {
        console.error('Erreur sauvegarde adresse:', err);
      }
    }
    onNext(newAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, savedAddresses.length, loadSavedAddresses]); // onNext est stable grâce à useCallback dans le parent

  const handleContinueWithSaved = useCallback(() => {
    if (address) {
      onNext(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // onNext est stable grâce à useCallback dans le parent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Adresse de livraison</h2>
      
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Adresses sauvegardées</h3>
            <button
              type="button"
              onClick={() => {
                setUseSavedAddress(false);
                setAddress(null);
              }}
              className="text-sm text-[#4CAF50] hover:text-[#45a049] font-medium"
            >
              + Nouvelle adresse
            </button>
          </div>
          
          <div className="space-y-3 mb-6">
            {savedAddresses.map((savedAddr, index) => (
              <div
                key={savedAddr.id || index}
                onClick={() => {
                  setAddress(savedAddr);
                  setUseSavedAddress(true);
                }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  address && 
                  (savedAddr.id ? address.id === savedAddr.id : 
                   (address.street === savedAddr.street && address.city === savedAddr.city))
                    ? 'border-[#4CAF50] bg-[#E8F5E8]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900">{savedAddr.street}</p>
                      {savedAddr.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-[#4CAF50] text-white rounded">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {savedAddr.zipCode} {savedAddr.city}, {savedAddr.state}
                    </p>
                    <p className="text-sm text-gray-600">{savedAddr.country}</p>
                  </div>
                  {address && 
                   (savedAddr.id ? address.id === savedAddr.id : 
                    (address.street === savedAddr.street && address.city === savedAddr.city)) && (
                    <CheckCircle className="w-6 h-6 text-[#4CAF50] flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!useSavedAddress || savedAddresses.length === 0) && (
        <div>
          {savedAddresses.length > 0 && (
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle adresse</h3>
          )}
          <AddressForm
            initialAddress={address || undefined}
            onSubmit={handleSubmit}
            loading={loading || parentLoading || false}
          />
        </div>
      )}

      {useSavedAddress && address && (
        <button
          onClick={handleContinueWithSaved}
          className="mt-6 w-full bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors"
        >
          Continuer avec cette adresse
        </button>
      )}
    </motion.div>
  );
}


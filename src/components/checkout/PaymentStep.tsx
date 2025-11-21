'use client';

import PaymentMethod from '@/components/PaymentMethod';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PaymentStepProps {
  total: number;
  onNext: (data?: { method: 'card' | 'paypal' | 'bank'; clientSecret: string | null; paymentIntentId: string | null }) => void;
  onBack?: () => void;
}

export default function PaymentStep({ total, onNext, onBack }: PaymentStepProps) {
  // États locaux
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const paymentIntentCreatedRef = useRef(false);
  const totalRef = useRef(total);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  const clientSecretRef = useRef<string | null>(null);
  const paymentMethodRef = useRef<'card' | 'paypal' | 'bank'>('card');
  const paymentIntentIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    clientSecretRef.current = clientSecret;
    paymentMethodRef.current = paymentMethod;
    paymentIntentIdRef.current = paymentIntentId;
  }, [clientSecret, paymentMethod, paymentIntentId]);

  const createPaymentIntent = useCallback(async () => {
    if (paymentIntentCreatedRef.current || clientSecretRef.current) return;
    
    paymentIntentCreatedRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createPaymentIntent(totalRef.current, 'usd');
      if (response.error) {
        // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error as any)?.message || 'Erreur lors de la création du paiement';
        setError(errorMessage);
        // NE PAS remettre paymentIntentCreatedRef.current à false pour éviter la boucle infinie
        // L'utilisateur devra changer de méthode de paiement ou recharger la page
        return;
      }
      if (response.data?.clientSecret) {
        const newClientSecret = response.data.clientSecret;
        const newPaymentIntentId = response.data.paymentIntentId || null;
        
        setClientSecret(newClientSecret);
        if (response.data.paymentIntentId) {
          setPaymentIntentId(response.data.paymentIntentId);
        }
        // Ne plus notifier automatiquement le parent - le parent lira les valeurs quand nécessaire
      }
    } catch (err: any) {
      // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
      const errorMessage = typeof err?.message === 'string' 
        ? err.message 
        : (err?.message as any)?.message || String(err) || 'Erreur lors de la création du paiement';
      setError(errorMessage);
      // NE PAS remettre paymentIntentCreatedRef.current à false pour éviter la boucle infinie
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pas de dépendances - utilise les refs pour éviter les re-créations

  // Créer PaymentIntent quand on entre dans l'étape payment avec méthode card
  useEffect(() => {
    // Ne créer le PaymentIntent que si toutes les conditions sont remplies ET qu'on n'a pas déjà essayé
    if (paymentMethod === 'card' && totalRef.current > 0 && !clientSecret && !loading && !paymentIntentCreatedRef.current && !error) {
      const timer = setTimeout(() => {
        createPaymentIntent();
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, clientSecret, loading]); // Ne pas inclure error pour éviter les re-déclenchements

  const handleMethodChange = useCallback((method: 'card' | 'paypal' | 'bank') => {
    setPaymentMethod(method);
    setError(null); // Réinitialiser l'erreur quand on change de méthode
    // Réinitialiser le PaymentIntent si on change de méthode
    if (method !== 'card') {
      paymentIntentCreatedRef.current = false;
      setClientSecret(null);
      setPaymentIntentId(null);
    } else {
      // Si on revient à 'card', réinitialiser le flag pour permettre un nouvel essai
      paymentIntentCreatedRef.current = false;
    }
    // Ne plus notifier automatiquement - le parent lira les valeurs quand nécessaire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pas de dépendances

  const handleContinue = useCallback(() => {
    if (paymentMethod === 'card' && !clientSecret) {
      setError('Veuillez attendre le chargement du formulaire de paiement');
      return;
    }
    setError(null);
    // Passer les données de paiement au parent lors du passage à l'étape suivante
    onNext({
      method: paymentMethod,
      clientSecret,
      paymentIntentId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, clientSecret, paymentIntentId]); // onNext est stable grâce à useCallback dans le parent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Méthode de paiement</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      
      <PaymentMethod
        onSelect={handleMethodChange}
        selectedMethod={paymentMethod}
      />
      
      {paymentMethod === 'card' && (
        <div className="mt-6">
          {clientSecret ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Paiement par carte sélectionné</span>
              </div>
              <p className="text-sm text-green-700">
                Vous pourrez saisir vos informations de carte à l'étape suivante pour finaliser le paiement.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Préparation du paiement sécurisé...</p>
            </div>
          )}
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            Vous serez redirigé vers PayPal pour finaliser le paiement
          </p>
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            Les détails de virement vous seront envoyés par email après confirmation de commande.
          </p>
        </div>
      )}

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
          disabled={paymentMethod === 'card' && !clientSecret}
          className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer vers le récapitulatif
        </button>
      </div>
    </motion.div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import ModernHeader from '@/components/ModernHeader';
import HomeFooter from '@/components/HomeFooter';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Vider le panier une fois que la page de confirmation est affichée
  // On le fait dès que orderId est présent, même si les détails sont encore en chargement
  useEffect(() => {
    if (orderId) {
      // Vider le panier immédiatement une fois sur la page de confirmation
      // Cela évite d'afficher un panier vide avant d'arriver sur cette page
      clearCart().catch(console.error);
    }
  }, [orderId, clearCart]);

  const loadOrderDetails = async () => {
    try {
      const response = await apiClient.getOrders();
      if (response.data) {
        const foundOrder = Array.isArray(response.data) 
          ? response.data.find((o: any) => o.id === orderId)
          : null;
        
        if (foundOrder) {
          setOrder(foundOrder);
          
          // Récupérer le numéro de suivi depuis le mapping CJ si disponible
          if (foundOrder.cjMapping) {
            setTrackingNumber(foundOrder.cjMapping.trackNumber);
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement commande:', err);
    } finally {
      setLoading(false);
    }
  };

  // Afficher immédiatement la confirmation même si les détails sont en cours de chargement
  if (loading && !orderId) {
    return (
      <div className="min-h-screen bg-[#F0F8F0]">
        <ModernHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la commande...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#4CAF50]" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Commande confirmée et payée !
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            Merci pour votre achat. Votre commande a été enregistrée avec succès et sera traitée dans les plus brefs délais.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>📧 Un email de confirmation</strong> vous sera envoyé sous peu avec tous les détails de votre commande.
            </p>
            <p className="text-sm text-green-800 mt-2">
              <strong>📦 Votre commande</strong> apparaîtra également dans votre espace client et sera visible par notre équipe pour traitement.
            </p>
          </div>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Numéro de commande</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{orderId.substring(0, 8)}</p>
            </div>
          )}

          {trackingNumber && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">Numéro de suivi</p>
              </div>
              <p className="text-xl font-bold text-blue-900 font-mono">{trackingNumber}</p>
              <p className="text-xs text-blue-700 mt-2">
                Vous recevrez un email de confirmation avec les détails de suivi
              </p>
            </div>
          )}

          {order && (
            <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Détails de la commande</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">${order.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-semibold capitalize">{order.status || 'En attente'}</span>
                </div>
                {order.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>
            <button
              onClick={() => router.push('/profile?tab=orders')}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Voir mes commandes
            </button>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}


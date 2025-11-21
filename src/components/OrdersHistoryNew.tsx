'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

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

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image?: string | string[];
    category?: { name: string };
    supplier?: { name: string };
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  cjMapping?: {
    cjOrderId?: string;
    cjOrderNumber?: string;
    status?: string;
    trackNumber?: string | null;
    metadata?: string | null;
  };
}

export default function OrdersHistoryNew() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 [OrdersHistory] Chargement des commandes...');
      const response = await apiClient.getOrders();
      
      if (response.data) {
        console.log('✅ [OrdersHistory] Commandes chargées:', response.data);
        // L'API retourne { data: [...], message: "..." }, on doit extraire data
        const ordersData = response.data.data || response.data;
        // S'assurer que ordersData est un tableau
        const ordersArray = Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersArray);
      } else {
        console.log('❌ [OrdersHistory] Erreur:', response.error);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ [OrdersHistory] Erreur lors du chargement:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'livrée':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'expédiée':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'en cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Livrée';
      case 'shipped':
        return 'Expédiée';
      case 'processing':
        return 'En cours de traitement';
      case 'cancelled':
        return 'Annulée';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de vos commandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#424242] mb-2">Mes commandes</h3>
            <p className="text-gray-600">Historique de vos commandes</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#4CAF50]">{orders ? orders.length : 0}</p>
            <p className="text-sm text-gray-600">Commandes totales</p>
          </div>
        </div>

        {/* Liste des commandes */}
        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h4 className="text-xl font-semibold text-[#424242] mb-2">Aucune commande</h4>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/products'}
              className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors duration-300"
            >
              Découvrir nos produits
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders && Array.isArray(orders) && orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-[#424242] mb-1">
                      Commande #{order.id.slice(-8).toUpperCase()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#4CAF50]">
                      {order.total.toFixed(2)}$
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => {
                        const imageUrl = getCleanImageUrl(item.product.image);
                        return (
                          <img
                            key={idx}
                            src={imageUrl || '/images/placeholder-product.png'}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.png';
                            }}
                          />
                        );
                      })}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#424242]">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.items[0]?.product.name}
                        {order.items.length > 1 && ` et ${order.items.length - 1} autre${order.items.length > 2 ? 's' : ''}`}
                      </p>
                      {/* ✅ Afficher le numéro de suivi si disponible */}
                      {order.cjMapping?.trackNumber && (
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                          📦 Suivi: {order.cjMapping.trackNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#45a049] transition-colors duration-300"
                  >
                    Voir détails
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de détails de commande */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#424242]">
                Commande #{selectedOrder.id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations de la commande */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Date de commande</p>
                  <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-[#4CAF50]">{selectedOrder.total.toFixed(2)}$</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Articles</p>
                  <p className="font-semibold">{selectedOrder.items.length}</p>
                </div>
              </div>

              {/* ✅ Informations de suivi CJ */}
              {selectedOrder.cjMapping && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informations de livraison CJ Dropshipping
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedOrder.cjMapping.cjOrderNumber && (
                      <div>
                        <p className="text-blue-700 font-medium">Numéro de commande CJ</p>
                        <p className="text-blue-900 font-mono text-xs">{selectedOrder.cjMapping.cjOrderNumber}</p>
                      </div>
                    )}
                    {selectedOrder.cjMapping.trackNumber && (
                      <div>
                        <p className="text-blue-700 font-medium">Numéro de suivi</p>
                        <p className="text-blue-900 font-mono text-xs font-bold">{selectedOrder.cjMapping.trackNumber}</p>
                      </div>
                    )}
                    {selectedOrder.cjMapping.status && (
                      <div>
                        <p className="text-blue-700 font-medium">Statut CJ</p>
                        <p className="text-blue-900 capitalize">{selectedOrder.cjMapping.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Articles de la commande */}
              <div>
                <h4 className="font-semibold text-[#424242] mb-4">Articles commandés</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => {
                    const imageUrl = getCleanImageUrl(item.product.image);
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={imageUrl || '/images/placeholder-product.png'}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder-product.png';
                          }}
                        />
                      <div className="flex-1">
                        <h5 className="font-medium text-[#424242]">{item.product.name}</h5>
                        <p className="text-sm text-gray-600">
                          {item.product.category?.name} • {item.product.supplier?.name}
                        </p>
                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#4CAF50]">
                          {(item.price * item.quantity).toFixed(2)}$
                        </p>
                        <p className="text-sm text-gray-600">{item.price.toFixed(2)}$ l'unité</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

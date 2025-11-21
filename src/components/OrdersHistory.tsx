'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function OrdersHistory() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const orders = [
    {
      id: 'CMD-2024-001',
      date: '15 Janvier 2024',
      total: 89.99,
      status: 'Livrée',
      statusColor: 'bg-green-100 text-green-800',
      items: [
        { name: 'T-shirt KAMRI Premium', quantity: 2, price: 29.99 },
        { name: 'Casquette KAMRI', quantity: 1, price: 19.99 },
        { name: 'Frais de port', quantity: 1, price: 9.99 }
      ]
    },
    {
      id: 'CMD-2024-002',
      date: '10 Janvier 2024',
      total: 156.50,
      status: 'En cours de livraison',
      statusColor: 'bg-blue-100 text-blue-800',
      items: [
        { name: 'Sweat KAMRI', quantity: 1, price: 49.99 },
        { name: 'Pantalon KAMRI', quantity: 1, price: 79.99 },
        { name: 'Chaussettes KAMRI', quantity: 3, price: 6.99 },
        { name: 'Frais de port', quantity: 1, price: 9.99 }
      ]
    },
    {
      id: 'CMD-2024-003',
      date: '5 Janvier 2024',
      total: 45.00,
      status: 'Expédiée',
      statusColor: 'bg-yellow-100 text-yellow-800',
      items: [
        { name: 'Casquette KAMRI', quantity: 2, price: 19.99 },
        { name: 'Frais de port', quantity: 1, price: 5.02 }
      ]
    },
    {
      id: 'CMD-2023-045',
      date: '20 Décembre 2023',
      total: 234.99,
      status: 'Livrée',
      statusColor: 'bg-green-100 text-green-800',
      items: [
        { name: 'Ensemble KAMRI Premium', quantity: 1, price: 199.99 },
        { name: 'Accessoires KAMRI', quantity: 1, price: 24.99 },
        { name: 'Frais de port', quantity: 1, price: 10.01 }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Livrée':
        return '✅';
      case 'En cours de livraison':
        return '🚚';
      case 'Expédiée':
        return '📦';
      case 'En attente':
        return '⏳';
      case 'Annulée':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#424242] mb-2">Mes commandes</h3>
            <p className="text-gray-500">Suivez l'état de vos commandes et consultez l'historique</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#4CAF50]">{orders.length}</p>
            <p className="text-sm text-gray-500">Commandes totales</p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#4CAF50]/10 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[#4CAF50]">
              {orders.filter(o => o.status === 'Livrée').length}
            </p>
            <p className="text-sm text-gray-600">Livrées</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'En cours de livraison').length}
            </p>
            <p className="text-sm text-gray-600">En cours</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'Expédiée').length}
            </p>
            <p className="text-sm text-gray-600">Expédiées</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}$
            </p>
            <p className="text-sm text-gray-600">Total dépensé</p>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{getStatusIcon(order.status)}</span>
                    <h4 className="font-semibold text-[#424242]">{order.id}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{order.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#4CAF50]">{order.total.toFixed(2)}$</p>
                    <p className="text-sm text-gray-500">{order.items.length} article(s)</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#45a049] transition-colors duration-300"
                  >
                    Voir les détails
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal de détails de commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#424242]">Détails de la commande {selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations de la commande */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date de commande</p>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedOrder.statusColor}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Articles de la commande */}
              <div>
                <h4 className="font-semibold text-[#424242] mb-4">Articles commandés</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{(item.price * item.quantity).toFixed(2)}$</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#424242]">Total</span>
                  <span className="text-xl font-bold text-[#4CAF50]">{selectedOrder.total.toFixed(2)}$</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-[#4CAF50] text-white py-3 rounded-lg font-medium hover:bg-[#45a049] transition-colors duration-300"
                >
                  Suivre la commande
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  Commander à nouveau
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

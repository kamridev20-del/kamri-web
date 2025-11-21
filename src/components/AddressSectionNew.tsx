'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AddressSectionNew() {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });

  // Charger les adresses au montage du composant
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      console.log('🏠 [AddressSection] Chargement des adresses...');
      const response = await apiClient.getAddresses();
      
      if (response.data) {
        console.log('✅ [AddressSection] Adresses chargées:', response.data);
        // L'API retourne { data: [...], message: "..." }, on doit extraire data
        const addressesData = response.data.data || response.data;
        // S'assurer que addressesData est un tableau
        const addressesArray = Array.isArray(addressesData) ? addressesData : [];
        setAddresses(addressesArray);
      } else {
        console.log('❌ [AddressSection] Erreur:', response.error);
        setAddresses([]);
      }
    } catch (error) {
      console.error('❌ [AddressSection] Erreur lors du chargement:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setShowModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowModal(true);
  };

  const handleSaveAddress = async () => {
    try {
      setSaving(true);
      console.log('💾 [AddressSection] Sauvegarde de l\'adresse...', formData);

      let response;
      if (editingAddress) {
        response = await apiClient.updateAddress(editingAddress.id, formData);
      } else {
        response = await apiClient.createAddress(formData);
      }

      if (response.data) {
        console.log('✅ [AddressSection] Adresse sauvegardée');
        await loadAddresses();
        setShowModal(false);
        setEditingAddress(null);
      } else {
        console.log('❌ [AddressSection] Erreur:', response.error);
        alert('Erreur lors de la sauvegarde: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [AddressSection] Erreur:', error);
      alert('Erreur lors de la sauvegarde de l\'adresse');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      return;
    }

    try {
      console.log('🗑️ [AddressSection] Suppression de l\'adresse:', addressId);
      const response = await apiClient.deleteAddress(addressId);

      if (response.data !== undefined) {
        console.log('✅ [AddressSection] Adresse supprimée');
        await loadAddresses();
      } else {
        console.log('❌ [AddressSection] Erreur:', response.error);
        alert('Erreur lors de la suppression: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [AddressSection] Erreur:', error);
      alert('Erreur lors de la suppression de l\'adresse');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      console.log('⭐ [AddressSection] Définir comme adresse par défaut:', addressId);
      const response = await apiClient.setDefaultAddress(addressId);

      if (response.data) {
        console.log('✅ [AddressSection] Adresse par défaut définie');
        await loadAddresses();
      } else {
        console.log('❌ [AddressSection] Erreur:', response.error);
        alert('Erreur: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [AddressSection] Erreur:', error);
      alert('Erreur lors de la définition de l\'adresse par défaut');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de vos adresses...</p>
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
            <h3 className="text-2xl font-bold text-[#424242] mb-2">Mes adresses</h3>
            <p className="text-gray-600">Gérez vos adresses de livraison</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddAddress}
            className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors duration-300"
          >
            + Ajouter une adresse
          </motion.button>
        </div>

        {/* Liste des adresses */}
        {!addresses || addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h4 className="text-xl font-semibold text-[#424242] mb-2">Aucune adresse</h4>
            <p className="text-gray-600 mb-6">Ajoutez votre première adresse pour faciliter vos commandes</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddAddress}
              className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors duration-300"
            >
              Ajouter une adresse
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses && Array.isArray(addresses) && addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  address.isDefault
                    ? 'border-[#4CAF50] bg-[#E8F5E8]'
                    : 'border-gray-200 bg-white hover:border-[#4CAF50]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-[#424242] mb-2">
                      {address.street}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-500 text-sm">{address.country}</p>
                  </div>
                  {address.isDefault && (
                    <span className="bg-[#4CAF50] text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Par défaut
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 bg-[#4CAF50] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#45a049] transition-colors duration-300"
                    >
                      Définir par défaut
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors duration-300"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-300"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
          >
            <h3 className="text-2xl font-bold text-[#424242] mb-6">
              {editingAddress ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rue
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    placeholder="75001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région/État
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  placeholder="Île-de-France"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Entrez votre pays"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Définir comme adresse par défaut
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={saving || !formData.street || !formData.city || !formData.zipCode}
                className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

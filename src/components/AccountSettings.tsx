'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AccountSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      orderHistory: false,
      dataSharing: false
    },
    preferences: {
      theme: 'light',
      language: 'fr',
      currency: 'EUR'
    }
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleNotificationChange = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyChange = (type) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  const handlePreferenceChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: value
      }
    }));
  };

  const handleDeleteAccount = () => {
    // Logique de suppression du compte
    console.log('Suppression du compte demandée');
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-xl font-bold text-[#424242] mb-6">Notifications</h3>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#424242]">
                  {key === 'email' && 'Notifications par email'}
                  {key === 'sms' && 'Notifications par SMS'}
                  {key === 'push' && 'Notifications push'}
                  {key === 'marketing' && 'Emails marketing'}
                </p>
                <p className="text-sm text-gray-500">
                  {key === 'email' && 'Recevez des mises à jour par email'}
                  {key === 'sms' && 'Recevez des alertes par SMS'}
                  {key === 'push' && 'Recevez des notifications sur votre appareil'}
                  {key === 'marketing' && 'Recevez nos offres et nouveautés'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNotificationChange(key)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  value ? 'bg-[#4CAF50]' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: value ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Confidentialité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-xl font-bold text-[#424242] mb-6">Confidentialité</h3>
        
        <div className="space-y-4">
          {Object.entries(settings.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#424242]">
                  {key === 'profileVisible' && 'Profil visible'}
                  {key === 'orderHistory' && 'Historique des commandes visible'}
                  {key === 'dataSharing' && 'Partage de données avec des partenaires'}
                </p>
                <p className="text-sm text-gray-500">
                  {key === 'profileVisible' && 'Rendre votre profil visible aux autres utilisateurs'}
                  {key === 'orderHistory' && 'Permettre l\'affichage de votre historique'}
                  {key === 'dataSharing' && 'Partager vos données avec nos partenaires de confiance'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePrivacyChange(key)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  value ? 'bg-[#4CAF50]' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: value ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Préférences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-xl font-bold text-[#424242] mb-6">Préférences</h3>
        
        <div className="space-y-6">
          {/* Thème */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-3">Thème</label>
            <div className="flex gap-2">
              {['light', 'dark', 'auto'].map((theme) => (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePreferenceChange('theme', theme)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    settings.preferences.theme === theme
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme === 'light' && 'Clair'}
                  {theme === 'dark' && 'Sombre'}
                  {theme === 'auto' && 'Automatique'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Langue */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-3">Langue</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Devise */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-3">Devise</label>
            <select
              value={settings.preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
            >
              <option value="EUR">Euro ($)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre (£)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Moyens de paiement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-xl font-bold text-[#424242] mb-6">Moyens de paiement</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h12v2H6V8zm0 4h8v2H6v-2z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">**** **** **** 1234</p>
                <p className="text-sm text-gray-500">Expire le 12/25</p>
              </div>
            </div>
            <button className="text-red-500 hover:text-red-600 transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#4CAF50] text-white py-3 rounded-lg font-medium hover:bg-[#45a049] transition-colors duration-300"
          >
            Ajouter un moyen de paiement
          </motion.button>
        </div>
      </motion.div>

      {/* Zone de danger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-red-50 border border-red-200 rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-red-800 mb-4">Zone de danger</h3>
        <p className="text-red-700 mb-6">
          Une fois votre compte supprimé, toutes vos données seront définitivement perdues. 
          Cette action est irréversible.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
        >
          Supprimer mon compte
        </motion.button>
      </motion.div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-red-800 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-300"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
              >
                Supprimer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

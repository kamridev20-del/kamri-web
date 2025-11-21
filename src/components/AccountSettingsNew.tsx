'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

interface UserSettings {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    orderHistory: boolean;
    dataSharing: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AccountSettingsNew() {
  const { logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // États pour les moyens de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ [AccountSettings] Chargement des paramètres...');
      const response = await apiClient.getUserSettings();
      
      if (response.data) {
        console.log('✅ [AccountSettings] Paramètres chargés:', response.data);
        // L'API retourne { data: {...}, message: "..." }, on doit extraire data
        const settingsData = response.data.data || response.data;
        console.log('📋 [AccountSettings] Données extraites:', settingsData);
        setSettings(settingsData);
      } else {
        console.log('❌ [AccountSettings] Erreur:', response.error);
        // Créer des paramètres par défaut si erreur
        setSettings({
          id: '',
          userId: '',
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
          },
          privacy: {
            profileVisible: true,
            orderHistory: false,
            dataSharing: false,
          },
          preferences: {
            theme: 'light',
            language: 'fr',
            currency: 'EUR',
          },
          createdAt: '',
          updatedAt: '',
        });
      }
    } catch (error) {
      console.error('❌ [AccountSettings] Erreur lors du chargement:', error);
      // Paramètres par défaut en cas d'erreur
      setSettings({
        id: '',
        userId: '',
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false,
        },
        privacy: {
          profileVisible: true,
          orderHistory: false,
          dataSharing: false,
        },
        preferences: {
          theme: 'light',
          language: 'fr',
          currency: 'EUR',
        },
        createdAt: '',
        updatedAt: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (type: keyof UserSettings['notifications']) => {
    if (!settings || !settings.notifications) return;
    
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type],
      },
    });
  };

  const handlePrivacyChange = (type: keyof UserSettings['privacy']) => {
    if (!settings || !settings.privacy) return;
    
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [type]: !settings.privacy[type],
      },
    });
  };

  const handlePreferenceChange = (type: keyof UserSettings['preferences'], value: string) => {
    if (!settings || !settings.preferences) return;
    
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [type]: value,
      },
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      console.log('💾 [AccountSettings] Sauvegarde des paramètres...', settings);

      const response = await apiClient.updateUserSettings({
        notifications: settings.notifications,
        privacy: settings.privacy,
        preferences: settings.preferences,
      });

      if (response.data) {
        console.log('✅ [AccountSettings] Paramètres sauvegardés');
        setSettings(response.data);
        alert('Paramètres sauvegardés avec succès !');
      } else {
        console.log('❌ [AccountSettings] Erreur:', response.error);
        alert('Erreur lors de la sauvegarde: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [AccountSettings] Erreur:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeleting(true);
      console.log('🗑️ [AccountSettings] Suppression du compte...');

      const response = await apiClient.deleteUserAccount();

      if (response.data !== undefined) {
        console.log('✅ [AccountSettings] Compte supprimé');
        alert('Votre compte a été supprimé avec succès.');
        logout();
        window.location.href = '/';
      } else {
        console.log('❌ [AccountSettings] Erreur:', response.error);
        alert('Erreur lors de la suppression: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [AccountSettings] Erreur:', error);
      alert('Erreur lors de la suppression du compte');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fonctions pour les moyens de paiement
  const handleAddPayment = () => {
    console.log('💳 [AccountSettings] Ouverture du formulaire d\'ajout de moyen de paiement');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    try {
      console.log('💾 [AccountSettings] Sauvegarde du moyen de paiement:', paymentForm);
      
      // Pour l'instant, on simule l'ajout (pas d'API backend pour les moyens de paiement)
      const newPayment = {
        id: Date.now().toString(),
        cardNumber: paymentForm.cardNumber,
        expiryDate: paymentForm.expiryDate,
        cardholderName: paymentForm.cardholderName,
        isDefault: paymentForm.isDefault,
        createdAt: new Date().toISOString()
      };
      
      setPaymentMethods(prev => [...prev, newPayment]);
      setShowPaymentModal(false);
      setPaymentForm({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        isDefault: false
      });
      
      console.log('✅ [AccountSettings] Moyen de paiement ajouté');
      alert('Moyen de paiement ajouté avec succès');
    } catch (error) {
      console.error('❌ [AccountSettings] Erreur lors de l\'ajout du moyen de paiement:', error);
      alert('Impossible d\'ajouter le moyen de paiement');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de vos paramètres...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-red-600">Erreur lors du chargement des paramètres</p>
      </div>
    );
  }

  // Vérifier que les paramètres ont la bonne structure
  if (!settings.notifications || !settings.privacy || !settings.preferences) {
    console.log('⚠️ [AccountSettings] Structure des paramètres incomplète:', settings);
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-yellow-600">Structure des paramètres incorrecte, rechargement...</p>
        <button 
          onClick={loadSettings}
          className="mt-4 bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#45a049] transition-colors duration-300"
        >
          Recharger
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-2xl font-bold text-[#424242] mb-6">Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Notifications par email</h4>
              <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.email || false}
                onChange={() => handleNotificationChange('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Notifications SMS</h4>
              <p className="text-sm text-gray-600">Recevoir des notifications par SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.sms || false}
                onChange={() => handleNotificationChange('sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Notifications push</h4>
              <p className="text-sm text-gray-600">Recevoir des notifications push</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.push || false}
                onChange={() => handleNotificationChange('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Marketing</h4>
              <p className="text-sm text-gray-600">Recevoir des offres promotionnelles</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.marketing || false}
                onChange={() => handleNotificationChange('marketing')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Confidentialité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-2xl font-bold text-[#424242] mb-6">Confidentialité</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Profil visible</h4>
              <p className="text-sm text-gray-600">Rendre votre profil visible aux autres utilisateurs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy?.profileVisible || false}
                onChange={() => handlePrivacyChange('profileVisible')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Historique des commandes</h4>
              <p className="text-sm text-gray-600">Partager l'historique de vos commandes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy?.orderHistory || false}
                onChange={() => handlePrivacyChange('orderHistory')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#424242]">Partage de données</h4>
              <p className="text-sm text-gray-600">Autoriser le partage de données avec des partenaires</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy?.dataSharing || false}
                onChange={() => handlePrivacyChange('dataSharing')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Préférences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-2xl font-bold text-[#424242] mb-6">Préférences</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thème
            </label>
            <select
              value={settings.preferences?.theme || 'light'}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="auto">Automatique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Langue
            </label>
            <select
              value={settings.preferences?.language || 'fr'}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise
            </label>
            <select
              value={settings.preferences?.currency || 'EUR'}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="EUR">Euro ($)</option>
              <option value="USD">Dollar US ($)</option>
              <option value="GBP">Livre Sterling (£)</option>
              <option value="CAD">Dollar Canadien (C$)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </motion.button>
          
        </div>
      </motion.div>

      {/* Moyens de paiement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-2xl font-bold text-[#424242] mb-6">Moyens de paiement</h3>
        
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
            </div>
            <p className="text-gray-500 mb-2">Aucun moyen de paiement</p>
            <p className="text-sm text-gray-400">Ajoutez une carte pour faciliter vos achats</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((payment) => (
              <div key={payment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        **** **** **** {payment.cardNumber.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-500">Expire le {payment.expiryDate}</p>
                      {payment.isDefault && (
                        <span className="inline-block bg-[#4CAF50] text-white text-xs px-2 py-1 rounded-full mt-1">
                          Par défaut
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleAddPayment}
          className="w-full border-2 border-dashed border-[#4CAF50] rounded-xl p-4 text-[#4CAF50] font-semibold hover:bg-[#4CAF50] hover:text-white transition-colors duration-300 flex items-center justify-center space-x-2 mt-4"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          <span>Ajouter un moyen de paiement</span>
        </button>
      </motion.div>

      {/* Zone de danger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-red-50 rounded-2xl shadow-lg p-8 border border-red-200"
      >
        <h3 className="text-2xl font-bold text-red-600 mb-4">Zone de danger</h3>
        <p className="text-red-700 mb-6 leading-relaxed">
          Une fois votre compte supprimé, toutes vos données seront définitivement perdues. 
          Cette action est irréversible.
        </p>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>Supprimer mon compte</span>
        </button>
      </motion.div>

      {/* Modal d'ajout de moyen de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#424242]">Ajouter un moyen de paiement</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte *
                </label>
                <input
                  type="text"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du titulaire *
                </label>
                <input
                  type="text"
                  value={paymentForm.cardholderName}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="password"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefaultPayment"
                  checked={paymentForm.isDefault}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                />
                <label htmlFor="isDefaultPayment" className="ml-2 text-sm text-gray-700">
                  Définir comme moyen de paiement par défaut
                </label>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              >
                Annuler
              </button>
              <button 
                onClick={handleSavePayment}
                className="flex-1 bg-[#4CAF50] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#45a049] transition-colors duration-300"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
          >
            <h3 className="text-2xl font-bold text-red-600 mb-4">Supprimer le compte</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement supprimées.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

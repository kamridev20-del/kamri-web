'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, user, updateProfile, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await login(email.trim());
    
    if (result.success) {
      setSuccess('Connexion réussie !');
      setTimeout(() => {
        onClose();
        setEmail('');
        setSuccess('');
      }, 1000);
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    
    setIsLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile({ name: name.trim() });
    
    if (result.success) {
      setSuccess('Profil mis à jour !');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(result.error || 'Erreur de mise à jour');
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setName('');
    setError('');
    setSuccess('');
    setIsEditing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!isAuthenticated ? (
              // Formulaire de connexion
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#4CAF50] mb-2">
                    Connexion
                  </h2>
                  <p className="text-gray-600">
                    Entrez votre email pour vous connecter
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connexion...
                      </div>
                    ) : (
                      'Se connecter'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Pas encore de compte ? Votre compte sera créé automatiquement !
                  </p>
                </div>
              </div>
            ) : (
              // Profil utilisateur
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#4CAF50] mb-2">
                    Mon Profil
                  </h2>
                  <p className="text-gray-600">
                    Gérez vos informations personnelles
                  </p>
                </div>

                {!isEditing ? (
                  // Affichage du profil
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <p className="text-gray-900">
                        {user?.name || 'Non défini'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle
                      </label>
                      <p className="text-gray-900 capitalize">
                        {user?.role}
                      </p>
                    </div>

                    {success && (
                      <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl">
                        {success}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#45a049] transition-colors duration-200"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  // Formulaire d'édition
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={user?.name || 'Votre nom'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl">
                        {success}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isLoading || !name.trim()}
                        className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setName('');
                          setError('');
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
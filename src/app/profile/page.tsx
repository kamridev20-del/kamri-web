'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountSettingsNew from '../../components/AccountSettingsNew';
import AddressSectionNew from '../../components/AddressSectionNew';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import OrdersHistoryNew from '../../components/OrdersHistoryNew';
import PersonalInfo from '../../components/PersonalInfo';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Lire le paramètre 'tab' de l'URL et activer l'onglet correspondant
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['personal', 'addresses', 'orders', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0F8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Informations', icon: '👤' },
    { id: 'addresses', label: 'Adresses', icon: '🏠' },
    { id: 'orders', label: 'Commandes', icon: '📦' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Header de la page */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
              Mon profil
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              Gérez vos informations et suivez vos commandes en un clin d'œil
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#4CAF50] text-white shadow-lg'
                    : 'bg-white text-[#424242] hover:bg-[#E8F5E8] hover:text-[#4CAF50]'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'personal' && <PersonalInfo />}
          {activeTab === 'addresses' && <AddressSectionNew />}
          {activeTab === 'orders' && <OrdersHistoryNew />}
          {activeTab === 'settings' && <AccountSettingsNew />}
        </motion.div>
      </main>
      
      <HomeFooter />
    </div>
  );
}

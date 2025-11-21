'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle2, Globe, ArrowDown } from 'lucide-react';
import ContactForm from '../../components/ContactForm';
import ContactInfo from '../../components/ContactInfo';
import FAQSection from '../../components/FAQSection';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import SupportWidget from '../../components/SupportWidget';
import { apiClient } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

export default function ContactPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const toast = useToast();

  const handleFormSubmit = async (formData: any) => {
    try {
      // Envoi réel via API
      const response = await apiClient.sendContactMessage(formData);
      
      if (response.error) {
        toast?.error?.(response.error || 'Erreur lors de l\'envoi du message');
        return;
      }

      // Succès
      setTicketNumber(response.data?.ticketNumber || null);
      setShowSuccess(true);
      toast?.success?.('Message envoyé avec succès !');
      
      // Masquer le message de succès après 8 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setTicketNumber(null);
      }, 8000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      toast?.error?.(error.message || 'Erreur lors de l\'envoi du message');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Hero Section Améliorée */}
      <section 
        className="relative min-h-[500px] sm:min-h-[600px] bg-gradient-to-br from-[#EAF3EE] via-[#F5F9F6] to-[#FFFFFF] w-full overflow-hidden shadow-lg"
        aria-label="Section hero - Contactez-nous"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.1,
                },
              },
            }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4CAF50]/10 rounded-full border border-[#4CAF50]/20 mb-6"
            >
              <MessageCircle className="w-4 h-4 text-[#4CAF50]" />
              <span className="text-sm sm:text-base font-semibold text-[#4CAF50]">
                Support 24/7 disponible
              </span>
            </motion.div>

            {/* Titre */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A3C2E] mb-4 sm:mb-6 leading-tight"
            >
              Contactez-nous
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-[#4B6254] mb-8 sm:mb-12 max-w-3xl mx-auto"
            >
              Une question, un problème ou une suggestion ? Écrivez-nous, notre équipe vous répond sous 24h.
            </motion.p>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8"
            >
              <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-[#4CAF50] mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-[#1A3C2E]">24h</div>
                <div className="text-xs sm:text-sm text-[#4B6254]">Temps de réponse</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#4CAF50] mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-[#1A3C2E]">98%</div>
                <div className="text-xs sm:text-sm text-[#4B6254]">Satisfaction client</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-[#4CAF50] mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-[#1A3C2E]">7j/7</div>
                <div className="text-xs sm:text-sm text-[#4B6254]">Disponibilité</div>
              </div>
            </motion.div>

            {/* Points clés */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base text-[#4B6254] mb-8"
            >
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                <span>Réponse sous 24h</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                <span>Support multilingue</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                <span>Disponible 7j/7</span>
              </li>
            </motion.ul>

            {/* Bouton scroll */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onClick={() => {
                document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-[#4CAF50] hover:text-[#2E7D32] font-semibold text-sm sm:text-base group"
              aria-label="Aller au formulaire de contact"
            >
              <span>Remplir le formulaire</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>

        {/* Éléments décoratifs animés */}
        <motion.div
          className="absolute top-8 right-8 w-16 h-16 sm:w-20 sm:h-20 bg-[#4CAF50]/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1] as any,
          }}
        />
        <motion.div
          className="absolute bottom-8 left-8 w-24 h-24 sm:w-32 sm:h-32 bg-[#81C784]/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1] as any,
            delay: 1,
          }}
        />
      </section>

      {/* Section principale */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" id="contact-form">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Colonne gauche - Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContactForm onSubmit={handleFormSubmit} />
          </motion.div>

          {/* Colonne droite - Informations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ContactInfo />
          </motion.div>
        </div>
      </main>

      {/* Section FAQ */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <FAQSection />
          </motion.div>
        </div>
      </section>

      {/* Message de succès amélioré */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-[#4CAF50] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl z-50 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-sm sm:text-base mb-1">
                Message envoyé avec succès !
              </div>
              {ticketNumber && (
                <div className="text-xs sm:text-sm text-white/90">
                  Numéro de ticket: <span className="font-mono font-bold">{ticketNumber}</span>
                </div>
              )}
              <div className="text-xs sm:text-sm text-white/80 mt-1">
                Nous vous répondrons sous 24h
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Widget de support */}
      <SupportWidget />
      
      <HomeFooter />
    </div>
  );
}

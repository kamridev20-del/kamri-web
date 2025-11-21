'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, Star, TrendingUp, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomeHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as any,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as any,
      },
    },
  };

  return (
    <section 
      className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] bg-gradient-to-br from-[#EAF3EE] via-[#F5F9F6] to-[#FFFFFF] w-full overflow-hidden shadow-lg"
      aria-label="Section hero - Découvrez les tendances"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center"
        >
          {/* Contenu texte - Colonne gauche */}
          <div className="hero-content space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Badge promotionnel */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4CAF50]/10 rounded-full border border-[#4CAF50]/20 mb-4">
                <Sparkles className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-sm sm:text-base font-semibold text-[#4CAF50]">
                  Nouvelle collection 2025
                </span>
              </div>
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A3C2E] leading-tight tracking-tight"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Découvrez les{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#4CAF50]">tendances</span>
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-3 bg-[#4CAF50]/20 -z-0"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>{' '}
              du moment
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#4B6254] font-light leading-relaxed max-w-xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Collection exclusive de vêtements et accessoires de qualité supérieure
            </motion.p>

            {/* Points clés */}
            <motion.ul
              variants={itemVariants}
              className="space-y-2 sm:space-y-3 text-sm sm:text-base text-[#4B6254]"
            >
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                <span>Livraison gratuite à partir de 100$</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                <span>Retours gratuits sous 30 jours</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                <span>Paiement sécurisé</span>
              </li>
            </motion.ul>

            {/* Statistiques */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 sm:gap-6 pt-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[#1A3C2E]">5000+</div>
                  <div className="text-xs sm:text-sm text-[#4B6254]">Clients satisfaits</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[#1A3C2E]">4.8/5</div>
                  <div className="text-xs sm:text-sm text-[#4B6254]">Note moyenne</div>
                </div>
              </div>
            </motion.div>

            {/* Boutons CTA */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
            >
              <Link
                href="/products"
                className="group relative inline-flex items-center justify-center gap-2 bg-[#4CAF50] text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-[#2E7D32] transform hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="relative z-10">Explorer maintenant</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#66BB6A] to-[#4CAF50] opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <Link
                href="/promotions"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#4CAF50] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg border-2 border-[#4CAF50] shadow-sm hover:bg-[#E8F5E8] hover:shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Voir les promos
              </Link>
            </motion.div>

            {/* Badges de confiance */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4B6254]">
                <Shield className="w-4 h-4 text-[#4CAF50]" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4B6254]">
                <Truck className="w-4 h-4 text-[#4CAF50]" />
                <span>Livraison rapide</span>
              </div>
            </motion.div>
          </div>

          {/* Image - Colonne droite */}
          <motion.div
            variants={imageVariants}
            className="hero-image relative order-1 lg:order-2"
          >
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden rounded-2xl shadow-2xl group">
              {/* Image de modèle avec Next Image */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/modelo.png"
                  alt="Modèle KAMRI portant des vêtements de la collection"
                  fill
                  className={`object-contain transition-transform duration-700 group-hover:scale-105 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Placeholder blur */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] animate-pulse" />
                )}
              </div>

              {/* Overlay décoratif avec animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />

              {/* Effet de brillance au survol */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />

              {/* Badge flottant */}
              <motion.div
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1A3C2E]">
                    -30% sur tout
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Formes géométriques décoratives */}
            <motion.div
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#4CAF50]/10 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 bg-[#81C784]/10 rounded-full blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Éléments décoratifs animés en arrière-plan */}
      <motion.div
        className="absolute top-8 right-8 w-16 h-16 sm:w-20 sm:h-20 bg-[#4CAF50]/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
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
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Ligne décorative animée */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4CAF50]/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </section>
  );
}

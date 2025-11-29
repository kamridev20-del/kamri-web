'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, Star, TrendingUp, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Slides du carrousel hero complet (texte + image + background)
const HERO_SLIDES = [
  {
    id: 1,
    badge: 'Nouvelle collection 2025',
    title: 'Découvrez les',
    titleHighlight: 'tendances',
    titleEnd: 'du moment',
    subtitle: 'Collection exclusive de vêtements et accessoires de qualité supérieure',
    image: '/images/hero-slide-1.jpg',
    imageAlt: 'Modèle KAMRI portant des vêtements de la collection',
    background: '/images/hero-slide-1.jpg', // Image de background pour ce slide
    ctaPrimary: { text: 'Explorer maintenant', href: '/products' },
    ctaSecondary: { text: 'Voir les promos', href: '/promotions' },
  },
  {
    id: 2,
    badge: 'Bonjour Printemps',
    title: 'Les tendances de la',
    titleHighlight: 'nouvelle saison',
    titleEnd: '',
    subtitle: 'Du style graffiti au style graphique',
    image: '/images/hero-slide-2.jpg',
    imageAlt: 'Collection printemps 2025',
    background: '/images/hero-slide-2.jpg', // Image de background pour ce slide
    ctaPrimary: { text: 'Je personnalise', href: '/products' },
    ctaSecondary: { text: 'Je découvre', href: '/products' },
  },
  {
    id: 3,
    badge: 'Nouveautés',
    title: 'Style et',
    titleHighlight: 'élégance',
    titleEnd: 'au quotidien',
    subtitle: 'Découvrez notre sélection de produits tendance',
    image: '/images/hero-slide-3.jpg',
    imageAlt: 'Nouveautés tendances',
    background: '/images/hero-slide-3.jpg', // Image de background pour ce slide
    ctaPrimary: { text: 'Découvrir', href: '/products' },
    ctaSecondary: { text: 'En savoir plus', href: '/about' },
  },
];

export default function HomeHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-play du carrousel background (change toutes les 15 secondes)
  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HERO_SLIDES.length;
        return nextIndex;
      });
    }, 15000); // Change toutes les 15 secondes

    return () => {
      clearInterval(interval);
    };
  }, [isAutoPlaying]);

  // Auto-play du carrousel image (change toutes les 15 secondes, mais décalé de 7.5 secondes)
  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }

    let interval: NodeJS.Timeout | null = null;

    // Démarrer après 7.5 secondes pour être décalé du background
    const initialTimeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % HERO_SLIDES.length;
          return nextIndex;
        });
      }, 15000); // Change toutes les 15 secondes
    }, 7500); // Démarrer après 7.5 secondes

    return () => {
      clearTimeout(initialTimeout);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentBackgroundIndex(index);
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 20000);
  };

  const goToPrevious = () => {
    setCurrentBackgroundIndex((prevIndex) => 
      prevIndex === 0 ? HERO_SLIDES.length - 1 : prevIndex - 1
    );
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? HERO_SLIDES.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 20000);
  };

  const goToNext = () => {
    setCurrentBackgroundIndex((prevIndex) => 
      (prevIndex + 1) % HERO_SLIDES.length
    );
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % HERO_SLIDES.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 20000);
  };

  const currentBackgroundSlide = HERO_SLIDES[currentBackgroundIndex];
  const currentImageSlide = HERO_SLIDES[currentImageIndex];

  return (
    <section 
      className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] w-full overflow-hidden shadow-lg"
      aria-label="Section hero - Découvrez les tendances"
    >
      {/* Carrousel de backgrounds */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={`bg-${currentBackgroundSlide.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={currentBackgroundSlide.background}
              alt=""
              fill
              className="object-cover"
              priority={currentBackgroundIndex === 0}
              quality={90}
            />
            {/* Overlay pour assurer la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />
            {/* Fallback dégradé si l'image ne charge pas */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#EAF3EE] via-[#F5F9F6] to-[#FFFFFF] opacity-50" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 items-center">
          {/* Contenu texte - Colonne gauche (FIXE, pas dans le carrousel) */}
          <div className="hero-content space-y-2 sm:space-y-3 lg:space-y-4 order-2 lg:order-1">
              {/* Badge promotionnel */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4CAF50]/10 rounded-full border border-[#4CAF50]/20 mb-2">
                  <Sparkles className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm sm:text-base font-semibold text-[#4CAF50]">
                    Nouvelle collection 2025
                  </span>
                </div>
              </div>

              {/* Titre principal */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A3C2E] leading-tight tracking-tight"
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
              </h1>

              {/* Sous-titre */}
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl text-[#4B6254] font-light leading-relaxed max-w-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Collection exclusive de vêtements et accessoires de qualité supérieure
              </p>

              {/* Points clés */}
              <ul
                className="space-y-2 sm:space-y-3 text-sm sm:text-base text-[#4B6254]"
              >
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                  <span>Livraison gratuite </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                  <span>Retours gratuits sous 30 jours</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                  <span>Paiement sécurisé</span>
                </li>
              </ul>

              {/* Statistiques */}
              <div className="flex flex-wrap gap-4 sm:gap-6 pt-2">
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
              </div>

              {/* Boutons CTA */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
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
              </div>

              {/* Badges de confiance */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4B6254]">
                  <Shield className="w-4 h-4 text-[#4CAF50]" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4B6254]">
                  <Truck className="w-4 h-4 text-[#4CAF50]" />
                  <span>Livraison rapide</span>
                </div>
              </div>
            </div>

          {/* Image - Colonne droite (dans le carrousel) */}
          <div className="hero-image relative order-1 lg:order-2">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-md aspect-[2/3] h-[400px] sm:h-[480px] lg:h-[560px] xl:h-[600px] overflow-hidden rounded-2xl shadow-2xl">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={`img-${currentImageSlide.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 group"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={currentImageSlide.image}
                      alt={currentImageSlide.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      priority={currentImageIndex === 0}
                      onLoad={() => setImageLoaded(true)}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] animate-pulse" />
                    )}
                  </div>

                  {/* Overlay décoratif */}
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
                    className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg z-10"
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
                </motion.div>
              </AnimatePresence>
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
          </div>
        </div>

        {/* Indicateurs de points (dots) pour le carrousel hero */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentImageIndex
                  ? 'w-8 h-2 bg-[#4CAF50]'
                  : 'w-2 h-2 bg-[#4CAF50]/50 hover:bg-[#4CAF50]/75'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
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

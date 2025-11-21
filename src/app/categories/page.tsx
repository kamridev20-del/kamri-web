'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CategoryCard from '../../components/CategoryCard';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import PopularCategoriesSlider from '../../components/PopularCategoriesSlider';
import TrendingSection from '../../components/TrendingSection';
import { apiClient } from '../../lib/api';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface Product {
  id: string;
  category: {
    id: string;
    name: string;
  } | null;
}

// Utiliser les icônes et couleurs du backend
const getCategoryConfig = (category: any) => {
  return {
    icon: category.icon || '🛍️',
    color: category.color || '#4CAF50'
  };
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories depuis l'API
        const categoriesResponse = await apiClient.getCategories();
        console.log('🔍 [CATEGORIES] Response from API:', categoriesResponse);
        
        if (categoriesResponse.data) {
          // L'API backend retourne { data: categories, message: '...' }
          // Notre API client retourne { data: { data: categories, message: '...' } }
          const backendData = categoriesResponse.data.data || categoriesResponse.data;
          const categoriesList = Array.isArray(backendData) ? backendData : [];
          console.log('📂 [CATEGORIES] Categories list:', categoriesList);
          
          // Charger les produits pour compter par catégorie
          const productsResponse = await apiClient.getProducts();
          if (productsResponse.data) {
            // Même logique pour les produits
            const backendProductsData = productsResponse.data.data || productsResponse.data;
            const products = Array.isArray(backendProductsData) ? backendProductsData : [];
            
            // Enrichir les catégories avec le nombre de produits et la configuration
            const enrichedCategories = categoriesList.map(category => {
              const productCount = products.filter((product: Product) => 
                product.category?.name === category.name
              ).length;
              
              const config = getCategoryConfig(category);
              
              return {
                id: category.id,
                name: category.name,
                image: '/api/placeholder/300/200',
                count: productCount, // Afficher 0 si pas de produits
                color: config.color,
                icon: config.icon
              };
            });
            
            setCategories(enrichedCategories);
          } else {
            // Si pas de produits, afficher quand même les catégories avec 0 produits
            const enrichedCategories = categoriesList.map(category => {
              const config = getCategoryConfig(category);
              
              return {
                id: category.id,
                name: category.name,
                image: '/api/placeholder/300/200',
                count: 0,
                color: config.color,
                icon: config.icon
              };
            });
            
            setCategories(enrichedCategories);
          }
        } else {
          // Si pas de catégories, afficher un message
          console.log('⚠️ [CATEGORIES] No data in response');
          setCategories([]);
        }
      } catch (error) {
        console.error('❌ [CATEGORIES] Erreur lors du chargement des catégories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Hero Section - Amélioré */}
      <section 
        className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] bg-gradient-to-br from-[#EAF3EE] via-[#F5F9F6] to-[#FFFFFF] w-full overflow-hidden shadow-lg"
        aria-label="Section hero - Explorez nos catégories"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center"
          >
            {/* Contenu texte - Colonne gauche */}
            <div className="hero-content space-y-6 sm:space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4CAF50]/10 rounded-full border border-[#4CAF50]/20 mb-4">
                  <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm sm:text-base font-semibold text-[#4CAF50]">
                    {categories.length} catégories disponibles
                  </span>
                </div>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A3C2E] leading-tight tracking-tight"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Explorez nos{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#4CAF50]">catégories</span>
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-3 bg-[#4CAF50]/20 -z-0"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </span>
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#4B6254] font-light leading-relaxed max-w-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Découvrez une sélection soigneusement organisée de produits pour tous vos besoins
              </motion.p>

              {/* Points clés */}
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-2 sm:space-y-3 text-sm sm:text-base text-[#4B6254]"
              >
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                  <span>Organisé par type de produit</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                  <span>Navigation facile et intuitive</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                  <span>Recherche rapide et précise</span>
                </li>
              </motion.ul>

              {/* Statistiques */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-4 sm:gap-6 pt-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-[#1A3C2E]">
                      {categories.length}+
                    </div>
                    <div className="text-xs sm:text-sm text-[#4B6254]">Catégories</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-[#1A3C2E]">
                      {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}+
                    </div>
                    <div className="text-xs sm:text-sm text-[#4B6254]">Produits</div>
                  </div>
                </div>
              </motion.div>

              {/* Barre de recherche améliorée */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="max-w-md pt-2"
              >
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 pl-14 pr-4 border-2 border-[#4CAF50]/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl text-sm sm:text-base"
                    aria-label="Rechercher une catégorie"
                  />
                  <motion.div
                    className="absolute left-5 top-1/2 transform -translate-y-1/2"
                    animate={{ rotate: searchQuery ? 360 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </motion.div>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-[#4CAF50] transition-colors"
                      aria-label="Effacer la recherche"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </div>

                {/* Suggestions rapides */}
                {!searchQuery && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <span className="text-xs text-[#4B6254]">Populaires:</span>
                    {categories.slice(0, 3).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSearchQuery(cat.name)}
                        className="px-3 py-1 text-xs bg-[#E8F5E8] text-[#4CAF50] rounded-full hover:bg-[#4CAF50] hover:text-white transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Bouton scroll vers catégories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="pt-2"
              >
                <button
                  onClick={() => {
                    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-[#4CAF50] hover:text-[#2E7D32] font-semibold text-sm sm:text-base group"
                >
                  <span>Voir toutes les catégories</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
              </motion.div>
            </div>

            {/* Carrousel de catégories - Colonne droite */}
            <motion.div
              initial={{ opacity: 0, scale: 1.1, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-image relative order-1 lg:order-2"
            >
              <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden rounded-2xl shadow-2xl group">
                {/* Carrousel de catégories populaires */}
                {categories.length > 0 ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#4CAF50]/10 via-[#81C784]/15 to-[#4CAF50]/10 p-6 sm:p-8">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
                      {categories.slice(0, 4).map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center cursor-pointer hover:shadow-xl transition-all duration-300 group/item"
                        >
                          <motion.div
                            className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                          >
                            {category.icon || '🛍️'}
                          </motion.div>
                          <div className="text-xs sm:text-sm font-semibold text-[#4CAF50] mb-1">
                            {category.name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-[#4B6254]">
                            {category.count || 0} produit{(category.count || 0) > 1 ? 's' : ''}
                          </div>
                          {/* Effet de brillance au survol */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/item:opacity-100 rounded-xl"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#4CAF50]/10 to-[#81C784]/20 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-8">
                      {['👗', '📱', '🏠', '⚽'].map((icon, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center"
                        >
                          <div className="text-3xl mb-2">{icon}</div>
                          <div className="text-sm font-semibold text-[#4CAF50]">
                            {['Mode', 'Tech', 'Maison', 'Sport'][index]}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overlay décoratif avec animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Effet de brillance au survol */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
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
                  ease: [0.25, 0.1, 0.25, 1] as any,
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
                  ease: [0.25, 0.1, 0.25, 1] as any,
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

        {/* Ligne décorative animée */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4CAF50]/30 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Grille des catégories */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-[#424242] mb-8 text-center">
            Toutes les catégories
          </h2>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-[#424242] mb-2">
                Chargement des catégories...
              </h3>
              <p className="text-[#81C784]">
                Veuillez patienter
              </p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-[#424242] mb-2">
                Aucune catégorie trouvée
              </h3>
              <p className="text-[#81C784]">
                Les catégories seront disponibles bientôt
              </p>
            </div>
          )}
        </motion.section>

        {/* Catégories populaires - Slider */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-[#424242] mb-8 text-center">
            Catégories populaires
          </h2>
          <PopularCategoriesSlider categories={categories.slice(0, 6)} />
        </motion.section>

        {/* Section Tendances */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <TrendingSection />
        </motion.section>
      </main>
      
      <HomeFooter />
    </div>
  );
}
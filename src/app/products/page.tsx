'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Grid, List, X, SlidersHorizontal } from 'lucide-react';
import CategoryTabs from '../../components/CategoryTabs';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import ProductCard from '../../components/ProductCard';
import ProductFilters from '../../components/ProductFilters';
import { apiClient } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  badge: string | null;
  stock: number;
  supplier: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 20;

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories
        const categoriesResponse = await apiClient.getCategories();
        if (categoriesResponse.data) {
          const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }

        // Charger les produits
        const productsResponse = await apiClient.getProducts();
        if (productsResponse.data) {
          setProducts(productsResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    // Filtre par catégorie
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => 
        product.category?.id === selectedCategory
      );
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filtre par badges
    if (selectedBadges.length > 0) {
      filtered = filtered.filter(product => 
        product.badge && selectedBadges.includes(product.badge)
      );
    }

    // Tri
    switch (sortBy) {
      case 'prix_croissant':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'prix_decroissant':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nouveautes':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'note':
        // Tri par note (si disponible) ou par stock
        filtered.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // populaire
        filtered.sort((a, b) => b.stock - a.stock);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset à la page 1 lors du changement de filtres
  }, [products, selectedCategory, searchQuery, sortBy, priceRange, selectedBadges]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory('tous');
    setSearchQuery('');
    setPriceRange([0, 2000]);
    setSortBy('populaire');
    setSelectedBrands([]);
    setMinRating(0);
    setSelectedBadges([]);
  };

  // Obtenir les filtres actifs
  const activeFilters = [
    selectedCategory !== 'tous' && { type: 'category', label: categories.find(c => c.id === selectedCategory)?.name || 'Catégorie', value: selectedCategory },
    searchQuery && { type: 'search', label: 'Recherche', value: searchQuery },
    (priceRange[0] > 0 || priceRange[1] < 2000) && { type: 'price', label: 'Prix', value: `${priceRange[0]}$ - ${priceRange[1]}$` },
    selectedBadges.length > 0 && { type: 'badges', label: 'Badges', value: selectedBadges.join(', ') },
  ].filter(Boolean) as Array<{ type: string; label: string; value: string }>;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit, une marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-[#424242]"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar avec filtres */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedBadges={selectedBadges}
              setSelectedBadges={setSelectedBadges}
              resetFilters={resetFilters}
            />
          </div>

          {/* Filtres mobile - Modal */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#424242]">Filtres</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <ProductFilters
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    selectedBadges={selectedBadges}
                    setSelectedBadges={setSelectedBadges}
                    resetFilters={resetFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Catégories */}
            <CategoryTabs
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />

            {/* Barre d'outils */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-[#424242]">
                    {loading ? 'Chargement...' : `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} trouvé${filteredProducts.length > 1 ? 's' : ''}`}
                  </h2>
                  
                  {/* Filtres actifs */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((filter, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (filter.type === 'category') setSelectedCategory('tous');
                            if (filter.type === 'search') setSearchQuery('');
                            if (filter.type === 'price') setPriceRange([0, 2000]);
                            if (filter.type === 'badges') setSelectedBadges([]);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-[#E8F5E8] text-[#424242] rounded-full text-xs hover:bg-[#4CAF50] hover:text-white transition-colors"
                        >
                          <span>{filter.label}: {filter.value}</span>
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Toggle vue */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid' ? 'bg-[#4CAF50] text-white' : 'text-gray-600'
                      }`}
                      aria-label="Vue grille"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list' ? 'bg-[#4CAF50] text-white' : 'text-gray-600'
                      }`}
                      aria-label="Vue liste"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bouton filtres mobile */}
                  <button 
                    className="lg:hidden flex items-center gap-2 bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtres
                  </button>
                </div>
              </div>
            </div>

            {/* Résultats */}
            <div className="mt-6">

              {/* État de chargement */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⏳</div>
                  <h3 className="text-xl font-semibold text-[#424242] mb-2">
                    Chargement des produits...
                  </h3>
                  <p className="text-[#81C784]">
                    Veuillez patienter
                  </p>
                </div>
              ) : (
                <>
                  {/* Grille ou Liste de produits */}
                  <AnimatePresence mode="wait">
                  {viewMode === 'grid' ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                      style={{ overflow: 'visible' }}
                    >
                        {paginatedProducts.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ProductCard product={product} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {paginatedProducts.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Link href={`/product/${product.id}`}>
                              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex flex-col sm:flex-row gap-4 p-4">
                                  <div className="w-full sm:w-48 h-48 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                      <p className="text-xs text-[#81C784] font-medium mb-1">{product.supplier?.name || 'KAMRI'}</p>
                                      <h3 className="text-base font-semibold text-[#424242] mb-2">{product.name}</h3>
                                      <p className="text-sm text-gray-600 line-clamp-2">{product.category?.name}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-[#4CAF50]">{product.price.toFixed(2)}$</span>
                                        {product.originalPrice && (
                                          <span className="text-sm text-gray-400 line-through">{product.originalPrice.toFixed(2)}$</span>
                                        )}
                                      </div>
                                      <div className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-sm font-semibold">
                                        Voir détails
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Précédent
                      </button>
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-[#4CAF50] text-white'
                                  : 'bg-white border border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Suivant
                      </button>
                    </div>
                  )}

                  {/* Message si aucun produit */}
                  {filteredProducts.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16"
                    >
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-[#424242] mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-[#81C784] mb-4">
                        Essayez de modifier vos critères de recherche
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <HomeFooter />
    </div>
  );
}
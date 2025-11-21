'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Search, Grid, List, Trash2, ShoppingCart, X, Check } from 'lucide-react';
import Link from 'next/link';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import ProductCard from '../../components/ProductCard';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return image;
    } catch {
      return image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }
  
  return null;
};

export default function FavoritesPage() {
  const { wishlistItems, wishlistCount, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();
  
  // Alias pour compatibilité avec vérification de sécurité
  const favorites = Array.isArray(wishlistItems) ? wishlistItems : [];

  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast?.success?.('Produit retiré des favoris');
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      toast?.error?.('Erreur lors de la suppression');
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast?.success?.('Produit ajouté au panier !');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast?.error?.(error.message || 'Erreur lors de l\'ajout au panier');
    }
  };

  const handleToggleSelect = (productId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === sortedFavorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedFavorites.map(item => item.productId)));
    }
  };

  const handleBulkRemove = async () => {
    try {
      for (const productId of selectedItems) {
        await removeFromWishlist(productId);
      }
      setSelectedItems(new Set());
      toast?.success?.(`${selectedItems.size} produit(s) retiré(s) des favoris`);
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error);
      toast?.error?.('Erreur lors de la suppression');
    }
  };

  const handleBulkAddToCart = async () => {
    try {
      for (const productId of selectedItems) {
        await addToCart(productId, 1);
      }
      toast?.success?.(`${selectedItems.size} produit(s) ajouté(s) au panier !`);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout en masse:', error);
      toast?.error?.('Erreur lors de l\'ajout au panier');
    }
  };

  // Filtrage et tri avec vérification de sécurité
  const filteredFavorites = favorites.filter(item => {
    if (!item || !item.product) return false;
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.product.name.toLowerCase().includes(query) &&
          !(item.product.supplier?.name || '').toLowerCase().includes(query) &&
          !(item.product.category?.name || '').toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Filtres par statut
    if (filterBy === 'inStock') return (item.product as any).stock > 0;
    if (filterBy === 'onSale') return item.product.originalPrice && item.product.originalPrice > item.product.price;
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (!a || !b || !a.product || !b.product) return 0;
    if (sortBy === 'price') return a.product.price - b.product.price;
    if (sortBy === 'priceDesc') return b.product.price - a.product.price;
    if (sortBy === 'name') return a.product.name.localeCompare(b.product.name);
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedFavorites.length / productsPerPage);
  const paginatedFavorites = sortedFavorites.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      {/* Hero Section - Compact */}
      <section className="bg-gradient-to-br from-[#4CAF50] via-[#66BB6A] to-[#81C784] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Mes Favoris
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-3xl mx-auto">
              {loading ? 'Chargement...' : `${favorites.length} article(s) dans vos favoris`}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos favoris..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm text-[#424242]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filtres et tri - Compact */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-4 sticky top-8"
            >
              <h3 className="text-base font-semibold text-[#424242] mb-4">Filtres</h3>
              
              {/* Tri */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#424242] mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                >
                  <option value="date">Date d'ajout</option>
                  <option value="price">Prix croissant</option>
                  <option value="priceDesc">Prix décroissant</option>
                  <option value="name">Nom</option>
                </select>
              </div>

              {/* Filtres */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#424242] mb-2">Filtrer par</label>
                <div className="space-y-1.5">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="filter"
                      value="all"
                      checked={filterBy === 'all'}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="mr-2 w-3.5 h-3.5 text-[#4CAF50]"
                    />
                    <span className="text-xs">Tous</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="filter"
                      value="inStock"
                      checked={filterBy === 'inStock'}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="mr-2 w-3.5 h-3.5 text-[#4CAF50]"
                    />
                    <span className="text-xs">En stock</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="filter"
                      value="onSale"
                      checked={filterBy === 'onSale'}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="mr-2 w-3.5 h-3.5 text-[#4CAF50]"
                    />
                    <span className="text-xs">En promotion</span>
                  </label>
                </div>
              </div>

              {/* Statistiques */}
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium text-[#424242] mb-2">Statistiques</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold text-[#4CAF50]">{favorites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En stock:</span>
                    <span>{favorites.filter(item => item && item.product && (item.product as any).stock > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En promo:</span>
                    <span>{favorites.filter(item => item && item.product && item.product.originalPrice && item.product.originalPrice > item.product.price).length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Header avec options d'affichage et actions en masse */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-[#424242]">
                    {sortedFavorites.length} article(s) trouvé(s)
                  </h2>
                  
                  {/* Actions en masse */}
                  {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{selectedItems.size} sélectionné(s)</span>
                      <button
                        onClick={handleBulkAddToCart}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Ajouter au panier
                      </button>
                      <button
                        onClick={handleBulkRemove}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                      <button
                        onClick={() => setSelectedItems(new Set())}
                        className="p-1.5 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {selectedItems.size === sortedFavorites.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                  
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
                </div>
              </div>
            </motion.div>

            {/* Liste des favoris */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement de vos favoris...</p>
              </div>
            ) : sortedFavorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#424242] mb-2">Aucun favori</h3>
                <p className="text-sm text-gray-600 mb-4">Découvrez nos produits et ajoutez-les à vos favoris</p>
                <Link href="/products" className="inline-flex items-center px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-sm">
                  Voir nos produits
                </Link>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  {viewMode === 'grid' ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                    >
                      {paginatedFavorites.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          {/* Checkbox de sélection */}
                          <button
                            onClick={() => handleToggleSelect(item.productId)}
                            className={`absolute top-2 left-2 z-20 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              selectedItems.has(item.productId)
                                ? 'bg-[#4CAF50] border-[#4CAF50]'
                                : 'bg-white border-gray-300 hover:border-[#4CAF50]'
                            }`}
                          >
                            {selectedItems.has(item.productId) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <ProductCard product={{
                            ...item.product,
                            stock: (item.product as any).stock || 0,
                            badge: null,
                            brand: item.product.supplier?.name,
                            supplier: item.product.supplier,
                            category: item.product.category ? {
                              id: '',
                              name: item.product.category.name
                            } : undefined,
                            originalPrice: item.product.originalPrice || null,
                            image: item.product.image || null,
                          } as any} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {paginatedFavorites.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center gap-3 p-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleSelect(item.productId)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                selectedItems.has(item.productId)
                                  ? 'bg-[#4CAF50] border-[#4CAF50]'
                                  : 'border-gray-300 hover:border-[#4CAF50]'
                              }`}
                            >
                              {selectedItems.has(item.productId) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                            
                            {/* Image */}
                            <Link href={`/product/${item.product.id}`} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {(() => {
                                const imageUrl = getCleanImageUrl(item.product.image);
                                return imageUrl ? (
                                  <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                );
                              })()}
                            </Link>
                            
                            {/* Détails */}
                            <div className="flex-1 min-w-0">
                              <Link href={`/product/${item.product.id}`}>
                                <h3 className="text-sm font-semibold text-[#424242] mb-1 line-clamp-1 hover:text-[#4CAF50] transition-colors">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <p className="text-xs text-gray-500 mb-1">
                                {item.product.category?.name || 'Non catégorisé'} • {item.product.supplier?.name || 'N/A'}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-[#4CAF50]">{item.product.price.toFixed(2)}$</span>
                                {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                  <span className="text-xs text-gray-400 line-through">{item.product.originalPrice.toFixed(2)}$</span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  (item.product as any).stock > 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {(item.product as any).stock > 0 ? 'En stock' : 'Rupture'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {(item.product as any).stock > 0 && (
                                <button
                                  onClick={() => handleAddToCart(item.product.id)}
                                  className="px-3 py-1.5 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-xs flex items-center gap-1.5"
                                  title="Ajouter au panier"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  Panier
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveFromFavorites(item.productId)}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer des favoris"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
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
                            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                              currentPage === page
                                ? 'bg-[#4CAF50] text-white'
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-sm">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
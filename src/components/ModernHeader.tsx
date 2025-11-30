'use client';

import { Menu, Package, Search, Tag, X as XIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../contexts/LanguageContext';
import { useWishlist } from '../contexts/WishlistContext';
import { apiClient } from '../lib/api';
import AuthModal from './AuthModal';
import CountrySelector from './CountrySelector';
import CurrencySelector from './CurrencySelector';

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    category?: { name: string };
  }>;
  categories: Array<{
    id: string;
    name: string;
    nameEn?: string;
    icon?: string;
    imageUrl?: string;
    productCount: number;
  }>;
  totalProducts: number;
  totalCategories: number;
  popularSearches?: string[];
}

export default function ModernHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { t, language } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // État pour gérer la visibilité du header au scroll
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  // Log pour debug
  console.log('📊 [Header] wishlistCount:', wishlistCount, 'cartCount:', cartCount);

  // Charger les recherches populaires
  const loadPopularSearches = useCallback(async () => {
    try {
      const response = await apiClient.searchProducts('', 8, true, language as 'fr' | 'en');
      if (response.data && response.data.popularSearches) {
        setSearchResults({
          products: [],
          categories: [],
          totalProducts: 0,
          totalCategories: 0,
          popularSearches: response.data.popularSearches,
        } as SearchResult);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recherches populaires:', error);
    }
  }, []);

  // Recherche avec debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      // Si pas de query, charger les recherches populaires
      await loadPopularSearches();
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.searchProducts(query.trim(), 8, false, language as 'fr' | 'en');
      if (response.data) {
        setSearchResults(response.data);
        setShowSearchDropdown(true);
      } else {
        setSearchResults(null);
        setShowSearchDropdown(false);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults(null);
      setShowSearchDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, [loadPopularSearches]);

  // Debounce de la recherche
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else if (searchQuery.trim().length === 1) {
      // Si moins de 2 caractères (mais pas vide), ne rien afficher
      setSearchResults(null);
      setShowSearchDropdown(false);
    }
    // ✅ CORRECTION : Ne plus charger automatiquement les recherches populaires
    // Elles ne s'afficheront que lors du focus (onFocus)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer la soumission de la recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  }, [pathname]);

  // Gestion du scroll : cacher le header en scrollant vers le bas, le montrer en scrollant vers le haut
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si on est tout en haut, toujours afficher le header
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Si on scroll vers le bas (plus bas que la position précédente)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Cacher le header seulement si on a scrollé assez
        setIsHeaderVisible(false);
      } 
      // Si on scroll vers le haut
      else if (currentScrollY < lastScrollY) {
        // Montrer le header immédiatement
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle pour améliorer les performances
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  // Catégories avec traductions
  const categories = [
    { name: t('navigation.home'), href: '/', icon: '🏠' },
    { name: t('navigation.products'), href: '/products', icon: '🛍️' },
    { name: t('navigation.categories'), href: '/categories', icon: '📋' },
    { name: t('navigation.contact'), href: '/contact', icon: '📞' },
    { name: 'Promos', href: '/promotions', icon: '💸' },
  ];

  return (
    <>
      {/* Mini-bande promotionnelle - Toujours visible (sticky) */}
      <div className="sticky top-0 z-[9999] bg-gradient-to-r from-[#E8F5E8] to-[#F0F8F0] py-1.5 sm:py-2 px-2 sm:px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-center gap-1.5 sm:gap-3 lg:gap-6 text-[9px] sm:text-xs lg:text-sm text-[#424242] whitespace-nowrap overflow-x-auto">
          <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <span className="text-[10px] sm:text-sm">🚚</span>
            <span className="whitespace-nowrap">{t('promo_bar.free_shipping')}</span>
          </span>
          <span className="text-[#424242]/40 flex-shrink-0">|</span>
          <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <span className="text-[10px] sm:text-sm">🔄</span>
            <span className="hidden sm:inline whitespace-nowrap">{t('promo_bar.easy_returns')}</span>
            <span className="sm:hidden whitespace-nowrap">{t('promo_bar.returns')}</span>
          </span>
          <span className="text-[#424242]/40 flex-shrink-0">|</span>
          <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <span className="text-[10px] sm:text-sm">💬</span>
            <span className="hidden sm:inline whitespace-nowrap">{t('promo_bar.support_24_7')}</span>
            <span className="sm:hidden whitespace-nowrap">{t('promo_bar.support')}</span>
          </span>
        </div>
      </div>

      {/* Header principal - Se cache au scroll vers le bas, réapparaît au scroll vers le haut */}
      <header 
        ref={headerRef}
        className={`bg-white/95 backdrop-blur-md shadow-lg border-b border-[#E8F5E8] sticky top-[38px] sm:top-[42px] z-[9998] transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Ligne principale */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 lg:py-0 lg:h-20">
            {/* Menu hamburger mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-lg transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <img
                  src="/images/logo.png"
                  alt="KAMRI Logo"
                  className="h-12 sm:h-16 lg:h-20 w-auto transition-all duration-300 hover:scale-105"
                />
              </Link>
            </div>

            {/* Barre de recherche - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[#81C784]" />
                </div>
                <input
                  type="text"
                  placeholder={t('common.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length === 0) {
                      loadPopularSearches();
                    } else if (searchResults) {
                      setShowSearchDropdown(true);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-[#E8F5E8] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:bg-white transition-all duration-300 ease-in-out font-medium text-[#424242] placeholder-[#81C784] text-base"
                />
                
                {/* Dropdown de résultats */}
                {showSearchDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 z-[10000] max-h-[500px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin h-6 w-6 border-2 border-[#4CAF50] border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm">Recherche en cours...</p>
                      </div>
                    ) : searchResults ? (
                      <>
                        {/* Recherches populaires (quand la barre est vide) */}
                        {searchQuery.trim().length === 0 && searchResults.popularSearches && searchResults.popularSearches.length > 0 && (
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              Recherches populaires
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {searchResults.popularSearches.map((searchTerm, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSearchQuery(searchTerm);
                                    performSearch(searchTerm);
                                  }}
                                  className="px-3 py-1.5 bg-[#E8F5E8] text-[#424242] rounded-full text-sm hover:bg-[#4CAF50] hover:text-white transition-colors"
                                >
                                  {searchTerm}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Catégories */}
                        {searchResults.categories.length > 0 && (
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Catégories
                            </h3>
                            <div className="space-y-1">
                              {searchResults.categories.map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                                  onClick={() => {
                                    setShowSearchDropdown(false);
                                    setSearchQuery('');
                                  }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#E8F5E8] transition-colors group"
                                >
                                  {category.imageUrl ? (
                                    <img
                                      src={category.imageUrl}
                                      alt={category.name}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  ) : category.icon ? (
                                    <span className="text-2xl">{category.icon}</span>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F5E8] flex items-center justify-center">
                                      <Tag className="h-5 w-5 text-[#4CAF50]" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#424242] group-hover:text-[#4CAF50] truncate">
                                      {category.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Produits */}
                        {searchResults.products.length > 0 && (
                          <div className="p-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Produits
                            </h3>
                            <div className="space-y-1">
                              {searchResults.products.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/product/${product.id}`}
                                  onClick={() => {
                                    setShowSearchDropdown(false);
                                    setSearchQuery('');
                                  }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#E8F5E8] transition-colors group"
                                >
                                  <img
                                    src={product.image || product.images?.[0] || '/images/modelo.png'}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#424242] group-hover:text-[#4CAF50] truncate">
                                      {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-sm font-bold text-[#4CAF50]">
                                        {product.price.toFixed(2)}$
                                      </span>
                                      {product.category && (
                                        <span className="text-xs text-gray-500">
                                          • {product.category.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bouton "Voir tous les résultats" */}
                        {(searchResults.totalProducts > searchResults.products.length || searchResults.totalCategories > searchResults.categories.length) && (
                          <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                              onClick={() => {
                                setShowSearchDropdown(false);
                                setSearchQuery('');
                              }}
                              className="block w-full text-center py-2 px-4 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors font-medium text-sm"
                            >
                              Voir tous les résultats
                              {searchResults.totalProducts > 0 && (
                                <span className="ml-2 text-xs opacity-90">
                                  ({searchResults.totalProducts} produit{searchResults.totalProducts > 1 ? 's' : ''})
                                </span>
                              )}
                            </Link>
                          </div>
                        )}

                        {/* Message si aucun résultat (seulement si on a tapé quelque chose) */}
                        {searchQuery.trim().length >= 2 && searchResults.products.length === 0 && searchResults.categories.length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">Aucun résultat trouvé pour "{searchQuery}"</p>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </form>
            </div>

            {/* Bouton recherche mobile */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden p-2 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-lg transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Icônes d'action */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Sélecteur de devise - Caché visuellement mais fonctionnel */}
              <div className="hidden">
                <CurrencySelector />
              </div>
              
              {/* Sélecteur de pays et langue - Desktop seulement */}
              <div className="hidden sm:block">
                <CountrySelector />
              </div>

              {/* Favoris */}
              <Link href="/favorites" className="relative p-1.5 sm:p-2 lg:p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-5 w-5 sm:h-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#FF7043] text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Panier */}
              <Link href="/cart" className="relative p-1.5 sm:p-2 lg:p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-5 w-5 sm:h-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#4CAF50] text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Profil */}
              {isAuthenticated ? (
                <div className="relative z-[9999]" ref={menuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-1.5 sm:p-2 lg:p-3 text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base">
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'K'}
                    </div>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon profil
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Se déconnecter
                      </button>
                      
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="p-1.5 sm:p-2 lg:p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110"
                >
                  <svg className="h-5 w-5 sm:h-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Barre de recherche mobile */}
          {showMobileSearch && (
            <div className="lg:hidden pb-3">
              <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#81C784]" />
                </div>
                <input
                  type="text"
                  placeholder={t('common.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length === 0) {
                      loadPopularSearches();
                    } else if (searchResults) {
                      setShowSearchDropdown(true);
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#E8F5E8] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:bg-white transition-all duration-300 ease-in-out font-medium text-[#424242] placeholder-[#81C784] text-sm"
                />
                
                {/* Dropdown de résultats mobile */}
                {showSearchDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 z-[10000] max-h-[400px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin h-6 w-6 border-2 border-[#4CAF50] border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm">Recherche en cours...</p>
                      </div>
                    ) : searchResults ? (
                      <>
                        {/* Recherches populaires (quand la barre est vide) */}
                        {searchQuery.trim().length === 0 && searchResults.popularSearches && searchResults.popularSearches.length > 0 && (
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              Recherches populaires
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {searchResults.popularSearches.map((searchTerm, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSearchQuery(searchTerm);
                                    performSearch(searchTerm);
                                  }}
                                  className="px-3 py-1.5 bg-[#E8F5E8] text-[#424242] rounded-full text-sm hover:bg-[#4CAF50] hover:text-white transition-colors"
                                >
                                  {searchTerm}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Catégories */}
                        {searchResults.categories.length > 0 && (
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Catégories
                            </h3>
                            <div className="space-y-1">
                              {searchResults.categories.map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                                  onClick={() => {
                                    setShowSearchDropdown(false);
                                    setSearchQuery('');
                                    setShowMobileSearch(false);
                                  }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#E8F5E8] transition-colors group"
                                >
                                  {category.imageUrl ? (
                                    <img
                                      src={category.imageUrl}
                                      alt={category.name}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  ) : category.icon ? (
                                    <span className="text-2xl">{category.icon}</span>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F5E8] flex items-center justify-center">
                                      <Tag className="h-5 w-5 text-[#4CAF50]" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#424242] group-hover:text-[#4CAF50] truncate">
                                      {category.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Produits */}
                        {searchResults.products.length > 0 && (
                          <div className="p-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Produits
                            </h3>
                            <div className="space-y-1">
                              {searchResults.products.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/product/${product.id}`}
                                  onClick={() => {
                                    setShowSearchDropdown(false);
                                    setSearchQuery('');
                                    setShowMobileSearch(false);
                                  }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#E8F5E8] transition-colors group"
                                >
                                  <img
                                    src={product.image || product.images?.[0] || '/images/modelo.png'}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#424242] group-hover:text-[#4CAF50] truncate">
                                      {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-sm font-bold text-[#4CAF50]">
                                        {product.price.toFixed(2)}$
                                      </span>
                                      {product.category && (
                                        <span className="text-xs text-gray-500">
                                          • {product.category.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bouton "Voir tous les résultats" */}
                        {(searchResults.totalProducts > searchResults.products.length || searchResults.totalCategories > searchResults.categories.length) && (
                          <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                              onClick={() => {
                                setShowSearchDropdown(false);
                                setSearchQuery('');
                                setShowMobileSearch(false);
                              }}
                              className="block w-full text-center py-2 px-4 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors font-medium text-sm"
                            >
                              Voir tous les résultats
                              {searchResults.totalProducts > 0 && (
                                <span className="ml-2 text-xs opacity-90">
                                  ({searchResults.totalProducts} produit{searchResults.totalProducts > 1 ? 's' : ''})
                                </span>
                              )}
                            </Link>
                          </div>
                        )}

                        {/* Message si aucun résultat (seulement si on a tapé quelque chose) */}
                        {searchQuery.trim().length >= 2 && searchResults.products.length === 0 && searchResults.categories.length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">Aucun résultat trouvé pour "{searchQuery}"</p>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Menu mobile */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-[#E8F5E8] py-3">
              {/* Sélecteur de pays mobile */}
              <div className="mb-3 sm:hidden">
                <CountrySelector />
              </div>

              {/* Navigation des catégories mobile */}
              <nav className="flex flex-col gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                      pathname === category.href
                        ? 'bg-[#4CAF50] text-white'
                        : 'text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8]'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Navigation horizontale des catégories - Desktop */}
          <div className="hidden lg:block border-t border-[#E8F5E8] py-2 lg:py-3">
            <nav className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-1 lg:py-2 rounded-full font-medium transition-all duration-300 ease-in-out hover:scale-105 text-sm lg:text-base ${
                    pathname === category.href
                      ? 'bg-[#4CAF50] text-white shadow-lg'
                      : 'text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8]'
                  }`}
                >
                  <span className="text-sm lg:text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}

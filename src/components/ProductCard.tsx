import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import { motion } from 'framer-motion';
import { Check, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCompare } from '../contexts/CompareContext';
import { useGeo } from '../contexts/GeoContext';
import { useToast } from '../contexts/ToastContext';
import { useWishlist } from '../contexts/WishlistContext';
import { apiClient } from '../lib/api';
import QuickViewModal from './QuickViewModal';

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

// Fonction pour extraire toutes les images
const getAllImages = (image: string | string[] | null | undefined): string[] => {
  if (!image) return [];
  
  if (typeof image === 'string') {
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed)) {
        return parsed.filter((img): img is string => typeof img === 'string' && img.startsWith('http'));
      }
      return image.startsWith('http') ? [image] : [];
    } catch {
      return image.startsWith('http') ? [image] : [];
    }
  } else if (Array.isArray(image)) {
    return image.filter((img): img is string => typeof img === 'string' && img.startsWith('http'));
  }
  
  return [];
};

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  rating?: number;
  reviews?: number;
  badge: string | null;
  brand?: string;
  supplier?: {
    name: string;
  };
  isFreeShipping?: boolean;
  stock?: number;
  listedNum?: number;
  sales?: number;
  deliveryCycle?: string;
  source?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { country } = useGeo();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isShippable, setIsShippable] = useState<boolean | null>(null);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [viewersCount] = useState(Math.floor(Math.random() * 20) + 1); // Simulé pour l'instant
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Utilisation des couleurs d'étiquettes cohérentes
  const badgeConfig = getBadgeConfig(product.badge as any) || {
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
    icon: '🏷️',
    text: 'BADGE'
  };
  
  // Calcul du pourcentage de réduction pour les promos
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  // Extraire toutes les images
  const allImages = useMemo(() => getAllImages(product.image), [product.image]);
  const isBestseller = (product.sales || 0) > 50 || (product.listedNum || 0) > 500;
    
  // Vérifier la livraison uniquement si nécessaire (lazy check)
  // Ne pas vérifier automatiquement pour éviter trop de requêtes
  // La vérification se fera uniquement lors de l'ajout au panier si nécessaire

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;
    
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      toast?.error?.('Veuillez vous connecter pour ajouter au panier');
      return;
    }
    
    // Vérifier la livraison uniquement si c'est un produit CJ et que le pays est défini
    if (country?.countryCode && product.source === 'cj-dropshipping') {
      // Si on n'a pas encore vérifié, le faire maintenant
      if (isShippable === null) {
        setIsCheckingShipping(true);
        try {
          const response = await apiClient.checkProductShipping(product.id, country.countryCode);
          if (response.data) {
            setIsShippable(response.data.shippable);
            if (!response.data.shippable) {
              toast?.error?.(response.data.error || `Ce produit n'est pas livrable en ${country.countryName}`);
              setIsCheckingShipping(false);
              return;
            }
          }
        } catch (error) {
          console.error('Erreur vérification livraison:', error);
          // En cas d'erreur, considérer comme livrable (fallback)
          setIsShippable(true);
        } finally {
          setIsCheckingShipping(false);
        }
      } else if (isShippable === false) {
        toast?.error?.(`Ce produit n'est pas livrable en ${country.countryName}`);
        return;
      }
    }
    
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1);
      setShowSuccessAnimation(true);
      toast?.success?.('Produit ajouté au panier !');
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast?.error?.(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };


  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      toast?.success?.('Produit retiré de la comparaison');
    } else {
      if (!canAddMore) {
        toast?.error?.('Vous ne pouvez comparer que 3 produits maximum');
        return;
      }
      addToCompare(product);
      toast?.success?.('Produit ajouté à la comparaison');
    }
  };
  
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    if (isWishlistLoading) {
      console.log('⏳ Clic ignoré - action en cours...');
      return;
    }

    console.log('🔥 CŒUR CLIQUÉ !', { productId: product.id, productName: product.name });
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlistLoading(true);
    
    try {
      if (isInWishlist(product.id)) {
        console.log('📤 Suppression des favoris...', product.id);
        await removeFromWishlist(product.id);
        console.log('✅ Supprimé des favoris');
      } else {
        console.log('📥 Ajout aux favoris...', product.id);
        await addToWishlist(product.id);
        console.log('✅ Ajouté aux favoris');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la gestion des favoris:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-3xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 group cursor-pointer relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animation de succès */}
        {showSuccessAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-50 rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="bg-green-500 text-white rounded-full p-4"
            >
              <Check className="w-8 h-8" />
            </motion.div>
          </motion.div>
        )}

        {/* Actions rapides en haut */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {/* Favorite button */}
          <button 
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
              isInWishlist(product.id)
                ? 'bg-[#FF7043] text-white hover:bg-[#E64A19]'
                : 'bg-white/90 text-[#81C784] hover:bg-white hover:text-[#4CAF50]'
            } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isInWishlist(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg className="h-5 w-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick View button */}
          <button
            onClick={handleQuickView}
            className="p-2 bg-white/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white text-[#424242] opacity-0 group-hover:opacity-100"
            title="Aperçu rapide"
          >
            <Eye className="h-5 w-5" />
          </button>

          {/* Compare button */}
          <button
            onClick={handleToggleCompare}
            className={`p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
              isInCompare(product.id)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white/90 text-[#424242] hover:bg-white'
            }`}
            title={isInCompare(product.id) ? 'Retirer de la comparaison' : 'Comparer ce produit'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>

        </div>

        <Link href={`/product/${product.id}`}>
          {/* Image du produit avec galerie */}
          <div 
            className="h-40 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative overflow-hidden"
            onMouseEnter={() => allImages.length > 1 && setCurrentImageIndex(1)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          >
            {allImages.length > 0 && allImages[currentImageIndex || 0] ? (
              <Image
                src={allImages[currentImageIndex || 0]}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                priority={false}
                unoptimized={allImages[currentImageIndex || 0]?.includes('cjdropshipping.com')}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`${allImages.length > 0 ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
              <svg className="h-12 w-12 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Badge avec animation pour "nouveau" */}
            {product.badge && (
              <motion.div 
                className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-20"
                style={{ 
                  backgroundColor: badgeConfig.backgroundColor, 
                  color: badgeConfig.color 
                }}
                animate={product.badge === 'nouveau' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: product.badge === 'nouveau' ? Infinity : 0, duration: 2 }}
              >
                {product.badge === 'promo' && discountPercentage > 0 
                  ? formatDiscountPercentage(discountPercentage)
                  : `${badgeConfig.icon} ${badgeConfig.text}`
                }
              </motion.div>
            )}

            {/* Badge Bestseller */}
            {isBestseller && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-[10px] font-bold z-20 shadow-lg">
                ⭐ Bestseller
              </div>
            )}

            {/* Badge "Non livrable" */}
            {isShippable === false && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold z-20">
                🚫 Non livrable
              </div>
            )}

            {/* Compteur de vues */}
            {viewersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white rounded-full text-[10px] font-semibold z-20 backdrop-blur-sm"
              >
                👁️ {viewersCount} personnes regardent
              </motion.div>
            )}

            {/* Indicateur de galerie d'images */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white rounded-full text-[10px] font-semibold z-20 backdrop-blur-sm">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            )}

            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300 pointer-events-none" />
          </div>
      
      {/* Product info */}
      <div className="p-4">
        <div className="mb-1.5">
          <span className="text-[10px] text-[#9CA3AF] font-normal">{product.brand || product.supplier?.name || 'CJ Dropshipping'}</span>
        </div>
        
        {/* Tooltip informatif au survol */}
        <div className="group/tooltip relative">
          <h3 className="text-sm font-semibold text-[#424242] mb-2 line-clamp-2 group-hover:text-[#4CAF50] transition-colors cursor-help">
            {product.name}
          </h3>
          {/* Tooltip avec détails - Positionné en bas */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-40 p-1.5 bg-gray-900 text-white text-[9px] rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[100] pointer-events-none">
            {/* Flèche pointant vers le haut */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-transparent border-b-gray-900"></div>
            <div className="space-y-0.5 relative z-10">
              <p className="font-semibold line-clamp-1">{product.name}</p>
              {product.category && (
                <p className="text-gray-300 line-clamp-1">Cat: {product.category.name}</p>
              )}
              {product.stock !== undefined && (
                <p className="text-gray-300">Stock: {product.stock}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* ✅ NOUVEAUX INDICATEURS */}
        <div className="flex flex-wrap gap-1 mb-2">
          {/* Livraison gratuite */}
          {product.isFreeShipping && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32]">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              Livraison gratuite
            </span>
          )}
          
          {/* Stock faible */}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF3E0] text-[#F57C00]">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              Plus que {product.stock}
            </span>
          )}
          
          {/* Populaire (si + de 100 listings) */}
          {product.listedNum && product.listedNum > 100 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E3F2FD] text-[#1976D2]">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              🔥 Populaire
            </span>
          )}
          
          {/* Livraison rapide */}
          {product.deliveryCycle && parseInt(product.deliveryCycle.split('-')[0]) <= 5 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3E5F5] text-[#7B1FA2]">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              {product.deliveryCycle}j
            </span>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          {product.reviews && product.reviews > 0 ? (
            <>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-xs text-[#81C784] font-medium">
                ({product.reviews} avis)
              </span>
            </>
          ) : (
            <span className="text-xs text-[#9CA3AF] italic">
              Nouveau produit
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold text-[#4CAF50]">{product.price.toFixed(2)}$</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}$</p>
            )}
          </div>
          
          {/* Badge de réduction animé */}
          {product.originalPrice && product.originalPrice > product.price && (
            <motion.div 
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[#FF5722] to-[#F44336] shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </motion.span>
              <span className="text-[10px] text-[#9CA3AF] font-medium">
                Économisez {(product.originalPrice - product.price).toFixed(2)}$
              </span>
            </motion.div>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart || isShippable === false || isCheckingShipping}
          className={`w-full py-2 px-4 rounded-full text-sm font-semibold hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isShippable === false
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] hover:from-[#2E7D32] hover:to-[#4CAF50] text-white'
          }`}
          title={isShippable === false ? `Ce produit n'est pas livrable en ${country?.countryName || 'votre région'}` : ''}
        >
          {isCheckingShipping ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Vérification...</span>
            </>
          ) : isAddingToCart ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Ajout en cours...</span>
            </>
          ) : isShippable === false ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Non livrable</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Ajouter au panier</span>
            </>
          )}
        </button>
      </div>
      </Link>
    </motion.div>

    {/* Quick View Modal */}
    <QuickViewModal
      product={showQuickView ? product : null}
      isOpen={showQuickView}
      onClose={() => setShowQuickView(false)}
      onAddToCart={(e) => handleAddToCart(e || ({} as React.MouseEvent))}
    />
    </>
  );
}

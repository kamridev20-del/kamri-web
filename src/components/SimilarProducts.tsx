'use client';

import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

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

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
  };
  type?: 'mode' | 'tech';
  rating?: number;
  reviews?: number;
  badge?: string;
  brand?: string;
  supplier?: {
    name: string;
  };
  description?: string;
  sizes?: string[] | null;
  colors?: string[];
  specifications?: Record<string, string> | null;
  inStock?: boolean;
  stockCount?: number;
  stock: number;
  status: string;
}

interface SimilarProductsProps {
  products: Product[];
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      toast?.success?.('Produit ajouté au panier !');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast?.error?.(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[#424242] mb-3">Produits similaires</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {products.map((product) => {
          const badgeConfig = getBadgeConfig(product.badge as any);
          const discountPercentage = product.originalPrice 
            ? calculateDiscountPercentage(product.originalPrice, product.price)
            : 0;
          
          return (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 group relative">
                {/* Image */}
                <div className="h-36 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative">
                  {(() => {
                    const imageUrl = getCleanImageUrl(product.image);
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none';
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null;
                  })()}
                  <div className={`${getCleanImageUrl(product.image) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                    <svg className="h-10 w-10 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Badge */}
                  {product.badge && badgeConfig && (
                    <div 
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ 
                        backgroundColor: badgeConfig.backgroundColor, 
                        color: badgeConfig.color 
                      }}
                    >
                      {product.badge === 'promo' && discountPercentage > 0 
                        ? formatDiscountPercentage(discountPercentage)
                        : badgeConfig.icon
                      }
                    </div>
                  )}
                </div>
              
              {/* Product info */}
              <div className="p-3">
                <p className="text-xs text-[#81C784] font-medium mb-1">{product.brand || product.supplier?.name || 'KAMRI'}</p>
                <h3 className="text-sm font-semibold text-[#424242] mb-1.5 line-clamp-2">{product.name}</h3>
                
                {/* Rating */}
                {product.rating && product.reviews && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    <span className="text-[10px] text-[#81C784]">({product.reviews})</span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#4CAF50]">{product.price.toFixed(2)}$</span>
                    {product.originalPrice && (
                      <span className="text-xs text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}$</span>
                    )}
                  </div>
                  
                  {/* Bouton d'ajout au panier */}
                  <button
                    onClick={(e) => handleAddToCart(e, product.id)}
                    disabled={addingToCart === product.id}
                    className="p-1.5 bg-[#4CAF50] text-white rounded-full hover:bg-[#2E7D32] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Ajouter au panier"
                  >
                    {addingToCart === product.id ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
);
}
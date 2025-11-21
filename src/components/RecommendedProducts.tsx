'use client';

import Link from 'next/link';
import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  badge: string | null;
  brand?: string;
  supplier?: {
    name: string;
  };
  rating?: number;
  reviews?: number;
}

interface RecommendedProductsProps {
  products?: Product[];
  title?: string;
}

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
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

export default function RecommendedProducts({ products = [], title = 'Vous pourriez aussi aimer' }: RecommendedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#424242] mb-3">{title}</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((product) => {
          const badgeConfig = getBadgeConfig(product.badge as any);
          const discountPercentage = product.originalPrice 
            ? calculateDiscountPercentage(product.originalPrice, product.price)
            : 0;
          
          const imageUrl = getCleanImageUrl(product.image);
          
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-32 bg-gray-100 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Badge */}
                {product.badge && badgeConfig && (
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold"
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
              <div className="p-2.5">
                <p className="text-[10px] text-[#81C784] font-medium mb-0.5 line-clamp-1">
                  {product.brand || product.supplier?.name || 'KAMRI'}
                </p>
                <h3 className="text-xs font-semibold text-[#424242] mb-1.5 line-clamp-2 min-h-[2rem]">
                  {product.name}
                </h3>
                
                {/* Rating */}
                {product.rating && product.reviews && (
                  <div className="flex items-center gap-0.5 mb-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-2.5 h-2.5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">({product.reviews})</span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#4CAF50]">
                    {product.price.toFixed(2)}$
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {product.originalPrice.toFixed(2)}$
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

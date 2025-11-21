'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  description?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  category?: {
    name: string;
  } | null;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (e?: React.MouseEvent) => void | Promise<void>;
}

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) return null;

  const images = typeof product.image === 'string' 
    ? (() => {
        try {
          const parsed = JSON.parse(product.image);
          return Array.isArray(parsed) ? parsed : [product.image];
        } catch {
          return [product.image];
        }
      })()
    : Array.isArray(product.image) ? product.image : [product.image];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[#424242]">Aperçu rapide</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {images[selectedImage] && (
                      <Image
                        src={images[selectedImage]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                            selectedImage === idx ? 'border-[#4CAF50]' : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">{product.category?.name || 'Produit'}</span>
                    <h3 className="text-2xl font-bold text-[#424242] mt-1">{product.name}</h3>
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews || 0} avis)</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#4CAF50]">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-xl text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-gray-600 line-clamp-4">{product.description}</p>
                  )}

                  {product.stock !== undefined && (
                    <div className="text-sm text-gray-600">
                      Stock: <span className="font-semibold">{product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {onAddToCart && (
                      <button
                        onClick={onAddToCart}
                        className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors"
                      >
                        Ajouter au panier
                      </button>
                    )}
                    <Link
                      href={`/product/${product.id}`}
                      onClick={onClose}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


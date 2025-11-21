'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '../contexts/CompareContext';
import { useRouter } from 'next/navigation';

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (compareItems.length === 0) return null;

  const handleCompare = () => {
    // Rediriger vers une page de comparaison (à créer)
    router.push('/compare');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#4CAF50] p-4 min-w-[400px] max-w-[90vw]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span className="font-semibold text-[#424242]">
                {compareItems.length} produit{compareItems.length > 1 ? 's' : ''} à comparer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#45a049] transition-colors flex items-center gap-2"
              >
                Comparer
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={clearCompare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Tout effacer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {compareItems.map((product) => {
              const imageUrl = typeof product.image === 'string' 
                ? (() => {
                    try {
                      const parsed = JSON.parse(product.image);
                      return Array.isArray(parsed) ? parsed[0] : product.image;
                    } catch {
                      return product.image;
                    }
                  })()
                : Array.isArray(product.image) ? product.image[0] : null;

              return (
                <div key={product.id} className="flex-shrink-0 relative group">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-1 text-xs text-center text-gray-600 line-clamp-1 max-w-[80px]">
                    {product.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


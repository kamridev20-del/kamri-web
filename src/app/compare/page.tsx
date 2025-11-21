'use client';

import { motion } from 'framer-motion';
import { X, ShoppingCart, Eye, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '../../contexts/CompareContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernHeader from '../../components/ModernHeader';
import HomeFooter from '../../components/HomeFooter';
import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';

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

// Fonction pour obtenir la valeur d'une propriété avec fallback
const getProperty = (product: any, key: string): string | number | null => {
  if (!product) return null;
  
  // Essayer différentes variantes de la clé
  const variants = [
    key,
    key.toLowerCase(),
    key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
  ];
  
  for (const variant of variants) {
    if (product[variant] !== undefined && product[variant] !== null) {
      return product[variant];
    }
  }
  
  return null;
};

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast?.error?.('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    try {
      await addToCart(productId, 1);
      toast?.success?.('Produit ajouté au panier !');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast?.error?.(error.message || 'Erreur lors de l\'ajout au panier');
    }
  };

  const handleRemoveProduct = (productId: string) => {
    removeFromCompare(productId);
    toast?.success?.('Produit retiré de la comparaison');
  };

  // Si aucun produit à comparer
  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#424242] mb-3">Aucun produit à comparer</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits à la comparaison pour les comparer côte à côte</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voir les produits
            </Link>
          </motion.div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // Propriétés à comparer
  const comparisonProperties = [
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'name', label: 'Nom', type: 'text' },
    { key: 'price', label: 'Prix', type: 'price' },
    { key: 'originalPrice', label: 'Prix original', type: 'price' },
    { key: 'rating', label: 'Note', type: 'rating' },
    { key: 'reviews', label: 'Avis', type: 'number' },
    { key: 'stock', label: 'Stock', type: 'stock' },
    { key: 'category', label: 'Catégorie', type: 'text' },
    { key: 'brand', label: 'Marque', type: 'text' },
    { key: 'supplier', label: 'Fournisseur', type: 'text' },
    { key: 'isFreeShipping', label: 'Livraison gratuite', type: 'boolean' },
    { key: 'deliveryCycle', label: 'Délai de livraison', type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4CAF50] via-[#66BB6A] to-[#81C784] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Comparaison de produits
              </h1>
              <p className="text-sm sm:text-base text-white/90">
                Comparez {compareItems.length} produit{compareItems.length > 1 ? 's' : ''} côte à côte
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
              <button
                onClick={clearCompare}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Tout effacer
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tableau de comparaison */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    Caractéristiques
                  </th>
                  {compareItems.map((product, index) => (
                    <th
                      key={product.id}
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase min-w-[250px] relative"
                    >
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Retirer de la comparaison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-6">
                        <div className="relative w-32 h-32 mx-auto mb-3 bg-gray-100 rounded-lg overflow-hidden">
                          {(() => {
                            const imageUrl = getCleanImageUrl(product.image);
                            return imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="128px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            );
                          })()}
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          className="text-sm font-semibold text-[#424242] hover:text-[#4CAF50] transition-colors line-clamp-2 mb-2 block"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonProperties.map((prop, propIndex) => {
                  // Ignorer l'image car elle est déjà dans le header
                  if (prop.key === 'image') return null;

                  return (
                    <tr key={prop.key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[#424242] sticky left-0 bg-white z-10">
                        {prop.label}
                      </td>
                      {compareItems.map((product) => {
                        const value = getProperty(product, prop.key);
                        
                        return (
                          <td key={product.id} className="px-4 py-3 text-center text-sm">
                            {(() => {
                              switch (prop.type) {
                                case 'price':
                                  if (prop.key === 'price') {
                                    return (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-base font-bold text-[#4CAF50]">
                                          {product.price?.toFixed(2) || 'N/A'}$
                                        </span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                          <>
                                            <span className="text-xs text-gray-400 line-through">
                                              {product.originalPrice.toFixed(2)}$
                                            </span>
                                            <span className="text-xs bg-[#E8F5E8] text-[#4CAF50] px-2 py-0.5 rounded-full">
                                              {formatDiscountPercentage(
                                                calculateDiscountPercentage(product.originalPrice, product.price)
                                              )}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    );
                                  } else {
                                    return value ? `${value}$` : 'N/A';
                                  }

                                case 'rating':
                                  const rating = product.rating || 0;
                                  return (
                                    <div className="flex items-center justify-center gap-1">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <svg
                                            key={i}
                                            className={`w-3.5 h-3.5 ${
                                              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
                                    </div>
                                  );

                                case 'stock':
                                  const stock = product.stock || 0;
                                  return (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        stock > 0
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {stock > 0 ? `${stock} en stock` : 'Rupture'}
                                    </span>
                                  );

                                case 'boolean':
                                  const boolValue = value === true || value === 'true' || value === 1;
                                  return boolValue ? (
                                    <CheckCircle2 className="w-5 h-5 text-[#4CAF50] mx-auto" />
                                  ) : (
                                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                                  );

                                case 'text':
                                  if (prop.key === 'category') {
                                    return product.category?.name || 'N/A';
                                  }
                                  if (prop.key === 'supplier') {
                                    return (product as any).supplier?.name || product.supplier?.name || 'N/A';
                                  }
                                  if (prop.key === 'brand') {
                                    return (product as any).brand || product.brand || (product as any).supplier?.name || product.supplier?.name || 'N/A';
                                  }
                                  if (prop.key === 'deliveryCycle') {
                                    return (product as any).deliveryCycle || product.deliveryCycle || 'N/A';
                                  }
                                  return value ? String(value) : 'N/A';

                                case 'number':
                                  return value ? value.toLocaleString() : '0';

                                default:
                                  return value ? String(value) : 'N/A';
                              }
                            })()}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Actions */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-[#424242] sticky left-0 bg-gray-50 z-10">
                    Actions
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="px-4 py-4">
                      <div className="flex flex-col gap-2 items-center">
                        <Link
                          href={`/product/${product.id}`}
                          className="w-full px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir détails
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={!product.stock || product.stock === 0}
                          className="w-full px-4 py-2 bg-white border-2 border-[#4CAF50] text-[#4CAF50] rounded-lg hover:bg-[#E8F5E8] transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Ajouter au panier
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé de comparaison */}
        {compareItems.length > 1 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-[#424242] mb-2">Meilleur prix</h3>
              {(() => {
                const cheapest = compareItems.reduce((prev, current) =>
                  (current.price || 0) < (prev.price || 0) ? current : prev
                );
                return (
                  <div>
                    <p className="text-lg font-bold text-[#4CAF50]">{cheapest.price?.toFixed(2)}$</p>
                    <p className="text-xs text-gray-600 mt-1">{cheapest.name}</p>
                  </div>
                );
              })()}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-[#424242] mb-2">Meilleure note</h3>
              {(() => {
                const bestRated = compareItems.reduce((prev, current) =>
                  (current.rating || 0) > (prev.rating || 0) ? current : prev
                );
                return (
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(bestRated.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{(bestRated.rating || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{bestRated.name}</p>
                  </div>
                );
              })()}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-[#424242] mb-2">En stock</h3>
              {(() => {
                const inStock = compareItems.filter(p => (p.stock || 0) > 0);
                return (
                  <div>
                    <p className="text-lg font-bold text-[#4CAF50]">{inStock.length}</p>
                    <p className="text-xs text-gray-600 mt-1">sur {compareItems.length} produit(s)</p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}


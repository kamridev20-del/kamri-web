
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Product } from '../lib/api';
import ProductCard from './ProductCard';

// Skeleton loader pour les cartes produits
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        
        {/* Badges skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        
        {/* Price skeleton */}
        <div className="h-8 bg-gray-200 rounded w-24 mb-3"></div>
        
        {/* Button skeleton */}
        <div className="h-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const { products, isLoading, error } = useApp();
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [rotationIndex, setRotationIndex] = useState(0);

  // S'assurer que products est toujours un tableau (mémorisé pour éviter les re-rendus)
  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // Limiter à 50 produits et rotation toutes les 2 minutes
  useEffect(() => {
    // Si pas de produits, réinitialiser
    if (safeProducts.length === 0) {
      setDisplayedProducts([]);
      setRotationIndex(0);
      return;
    }

    const PRODUCTS_TO_SHOW = 50;
    const ROTATION_INTERVAL = 2 * 60 * 1000; // 2 minutes en millisecondes

    // Calculer le nombre de "pages" de 50 produits
    const totalPages = Math.ceil(safeProducts.length / PRODUCTS_TO_SHOW);
    
    // Si moins de 50 produits, afficher tous
    if (totalPages <= 1) {
      setDisplayedProducts(safeProducts.slice(0, PRODUCTS_TO_SHOW));
      setRotationIndex(0);
      return;
    }
    
    // Fonction pour obtenir les produits à afficher pour une page donnée
    const getProductsForPage = (pageIndex: number) => {
      const safeIndex = pageIndex % totalPages;
      const startIndex = safeIndex * PRODUCTS_TO_SHOW;
      const endIndex = startIndex + PRODUCTS_TO_SHOW;
      return safeProducts.slice(startIndex, endIndex);
    };

    // Initialiser avec la première page
    setDisplayedProducts(getProductsForPage(0));
    setRotationIndex(0);

    // Configurer l'intervalle de rotation
    const intervalId = setInterval(() => {
      setRotationIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % totalPages;
        setDisplayedProducts(getProductsForPage(newIndex));
        return newIndex;
      });
    }, ROTATION_INTERVAL);

    // Nettoyage
    return () => {
      clearInterval(intervalId);
    };
  }, [safeProducts]);

  if (isLoading) {
    return (
      <div className="py-20 px-6 bg-[#E8F5E8]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#424242] mb-3 tracking-tight font-['Inter']">
              Nos produits
            </h2>
            <p className="text-base text-[#81C784] font-light font-['Inter']">
              Chargement des produits...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-6 bg-[#E8F5E8]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight font-['Inter']">
              Nos produits
            </h2>
            <p className="text-base text-red-500 font-light font-['Inter']">
              Erreur: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-6 bg-[#E8F5E8]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight font-['Inter']">
            Nos produits
          </h2>
          <p className="text-xl text-[#81C784] font-light font-['Inter']">
            Découvrez notre sélection exclusive ({displayedProducts.length} produits sur {safeProducts.length})
          </p>
        </div>
        
        {displayedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base text-gray-500">Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

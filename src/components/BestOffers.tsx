'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import ProductCard from './ProductCard';

export default function BestOffers() {
  const [bestOffers, setBestOffers] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBestOffers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts();
        if (response.data) {
          // L'API backend retourne { data: products, message: '...' }
          // Notre API client retourne { data: { data: products, message: '...' } }
          const backendData = (response.data as any).data || response.data;
          const products = Array.isArray(backendData) ? backendData : [];
          
          // Stocker le nombre total de produits
          setTotalProducts(products.length);
          
          // Filtrer les produits avec les meilleures offres (badge promo ou prix réduit)
          const offers = products
            .filter((product: any) => 
              product.badge === 'promo' || 
              (product.originalPrice && product.originalPrice > product.price)
            )
            .slice(0, 6); // Limiter à 6 produits
          setBestOffers(offers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des meilleures offres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBestOffers();
  }, []);

  return (
    <div className="py-20 px-6 bg-[#E8F5E8]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight">
            Meilleures Offres
          </h2>
          <p className="text-xl text-[#81C784] font-light">
            Découvrez nos promotions exclusives
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {bestOffers.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>

        {/* Bouton Voir Plus - Affiché uniquement si au moins 50 produits */}
        {bestOffers.length > 0 && totalProducts >= 50 && (
          <div className="flex justify-center mt-12">
            <a
              href="/promotions"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E53935] to-[#EF5350] text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>Voir toutes les promos</span>
              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

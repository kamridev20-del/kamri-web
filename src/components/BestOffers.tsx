'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import ProductCard from './ProductCard';

export default function BestOffers() {
  const [bestOffers, setBestOffers] = useState<any[]>([]);
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
      </div>
    </div>
  );
}

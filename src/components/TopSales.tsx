'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import ProductCard from './ProductCard';

export default function TopSales() {
  const [topSales, setTopSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopSales = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts();
        if (response.data) {
          // L'API backend retourne { data: products, message: '...' }
          // Notre API client retourne { data: { data: products, message: '...' } }
          const backendData = (response.data as any).data || response.data;
          const products = Array.isArray(backendData) ? backendData : [];
          
          // Filtrer les produits avec badge 'top-ventes' ou les plus vendus
          const topProducts = products
            .filter((product: any) => 
              product.badge === 'top-ventes' || 
              product.sales > 0
            )
            .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
            .slice(0, 6); // Limiter à 6 produits
          setTopSales(topProducts);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des top ventes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopSales();
  }, []);

  return (
    <div className="py-20 px-6 bg-[#E8F5E8]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight">
            Top Ventes
          </h2>
          <p className="text-xl text-[#81C784] font-light">
            Nos produits les plus vendus
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {topSales.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </div>
  );
}
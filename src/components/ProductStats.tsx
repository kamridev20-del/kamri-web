'use client';

import { Eye, ShoppingCart, TrendingUp } from 'lucide-react';

interface ProductStatsProps {
  views?: number;
  sales?: number;
  listedNum?: number;
}

export default function ProductStats({ views, sales, listedNum }: ProductStatsProps) {
  // Simuler des vues si non disponibles
  const displayViews = views || Math.floor(Math.random() * 500) + 100;
  const displaySales = sales || 0;
  const isBestseller = (sales || 0) > 50 || (listedNum || 0) > 500;

  return (
    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
      {displayViews > 0 && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Eye className="w-3.5 h-3.5 text-[#81C784]" />
          <span>{displayViews.toLocaleString()} vues</span>
        </div>
      )}
      
      {displaySales > 0 && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <ShoppingCart className="w-3.5 h-3.5 text-[#4CAF50]" />
          <span>{displaySales.toLocaleString()} ventes</span>
        </div>
      )}
      
      {isBestseller && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>Bestseller</span>
        </div>
      )}
    </div>
  );
}


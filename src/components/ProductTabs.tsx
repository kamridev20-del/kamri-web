'use client';

import { useState } from 'react';
import ProductReviews from './ProductReviews';

interface ProductTabsProps {
  description?: string;
  specifications?: Record<string, string> | null;
  deliveryCycle?: string;
  reviews?: number;
  rating?: number;
  cjProductId?: string | null;
  productId: string;
}

export default function ProductTabs({ 
  description, 
  specifications, 
  deliveryCycle,
  reviews,
  rating,
  cjProductId,
  productId
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>('description');

  const tabs = [
    { id: 'description' as const, label: 'Description', icon: '📝' },
    { id: 'specifications' as const, label: 'Spécifications', icon: '⚙️' },
    { id: 'shipping' as const, label: 'Livraison', icon: '🚚' },
    { id: 'reviews' as const, label: `Avis (${reviews || 0})`, icon: '⭐' },
  ];

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#4CAF50] border-b-2 border-[#4CAF50] bg-[#F0FDF4]'
                  : 'text-gray-600 hover:text-[#4CAF50] hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            {description ? (
              <div className="text-sm text-[#424242] leading-relaxed whitespace-pre-line">
                {description}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune description disponible pour ce produit.</p>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div>
            {specifications && Object.keys(specifications).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-[#81C784] font-medium">{key}:</span>
                    <span className="text-[#424242] font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune spécification disponible pour ce produit.</p>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#E8F5E8] rounded-lg">
              <h4 className="text-sm font-semibold text-[#424242] mb-1.5 flex items-center gap-1.5">
                <span className="text-base">🚚</span> Délai de livraison
              </h4>
              <p className="text-sm text-[#424242]">
                {deliveryCycle 
                  ? `Livraison estimée : ${deliveryCycle} jours ouvrés`
                  : 'Livraison standard : 7-15 jours ouvrés'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mb-1.5">📦</div>
                <h5 className="text-sm font-semibold text-[#424242] mb-1">Livraison gratuite</h5>
                <p className="text-xs text-gray-600">Sur commandes de plus de 50$</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mb-1.5">🔄</div>
                <h5 className="text-sm font-semibold text-[#424242] mb-1">Retour gratuit</h5>
                <p className="text-xs text-gray-600">Sous 30 jours</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mb-1.5">🛡️</div>
                <h5 className="text-sm font-semibold text-[#424242] mb-1">Garantie</h5>
                <p className="text-xs text-gray-600">1 an sur tous les produits</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews
            cjProductId={cjProductId}
            productId={productId}
            currentRating={rating}
            currentReviewsCount={reviews}
          />
        )}
      </div>
    </div>
  );
}


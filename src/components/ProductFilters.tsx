'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedBadges?: string[];
  setSelectedBadges?: (badges: string[]) => void;
  resetFilters?: () => void;
}

export default function ProductFilters({ 
  priceRange, 
  setPriceRange, 
  sortBy, 
  setSortBy,
  showFilters,
  setShowFilters,
  selectedBadges = [],
  setSelectedBadges,
  resetFilters
}: ProductFiltersProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    sort: true,
    price: true,
    badges: true,
    brands: false,
    rating: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sortOptions = [
    { value: 'populaire', label: 'Plus populaire', icon: '🔥' },
    { value: 'nouveautes', label: 'Nouveautés', icon: '✨' },
    { value: 'prix_croissant', label: 'Prix croissant', icon: '⬆️' },
    { value: 'prix_decroissant', label: 'Prix décroissant', icon: '⬇️' },
    { value: 'note', label: 'Mieux notés', icon: '⭐' },
  ];

  const brands = ['KAMRI', 'TechBrand', 'GameTech', 'Luxury', 'HomeStyle'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#424242]">Filtres</h3>
        {resetFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>
      
      {/* Tri - Compact */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between text-sm font-medium text-[#424242] mb-2"
        >
          <span>Trier par</span>
          {openSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.sort && (
          <div className="space-y-1.5">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                  sortBy === option.value
                    ? 'bg-[#4CAF50] text-white'
                    : 'bg-gray-50 text-[#424242] hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prix - Compact avec validation */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-sm font-medium text-[#424242] mb-2"
        >
          <span>Prix</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.price && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max={priceRange[1]}
                  placeholder="Min"
                  value={priceRange[0] === 0 ? '' : priceRange[0]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(priceRange[1], Number(e.target.value) || 0));
                    setPriceRange([value, priceRange[1]]);
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) < 0) {
                      setPriceRange([0, priceRange[1]]);
                    }
                  }}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4CAF50] text-[#424242]"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">$</span>
              </div>
              <span className="text-xs text-gray-400 px-1">-</span>
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="number"
                  min={priceRange[0]}
                  placeholder="Max"
                  value={priceRange[1] === 2000 ? '' : priceRange[1]}
                  onChange={(e) => {
                    const value = Math.max(priceRange[0], Number(e.target.value) || 2000);
                    setPriceRange([priceRange[0], value]);
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) < priceRange[0]) {
                      setPriceRange([priceRange[0], 2000]);
                    }
                  }}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4CAF50] text-[#424242]"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">$</span>
              </div>
            </div>
            <div className="text-xs text-[#81C784] text-center">
              {priceRange[0]}$ - {priceRange[1]}$
            </div>
          </div>
        )}
      </div>

      {/* Marques - Collapsible */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between text-sm font-medium text-[#424242] mb-2"
        >
          <span>Marques</span>
          {openSections.brands ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.brands && (
          <div className="space-y-1.5">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 text-[#4CAF50] bg-gray-100 border-gray-300 rounded focus:ring-[#4CAF50] focus:ring-1"
                />
                <span className="ml-2 text-xs text-[#424242]">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Évaluation - Collapsible */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-sm font-medium text-[#424242] mb-2"
        >
          <span>Note minimum</span>
          {openSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.rating && (
          <div className="space-y-1.5">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer py-1">
                <input
                  type="radio"
                  name="rating"
                  className="w-3.5 h-3.5 text-[#4CAF50] bg-gray-100 border-gray-300 focus:ring-[#4CAF50] focus:ring-1"
                />
                <div className="ml-2 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3 w-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs text-[#424242]">et plus</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filtres rapides - Badges - Compact */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection('badges')}
          className="w-full flex items-center justify-between text-sm font-medium text-[#424242] mb-2"
        >
          <span>Filtres rapides</span>
          {openSections.badges ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.badges && (
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'promo', label: 'Promotions', icon: '🔥' },
              { value: 'nouveau', label: 'Nouveautés', icon: '✨' },
              { value: 'bestseller', label: 'Bestsellers', icon: '⭐' },
            ].map((badge) => (
              <button
                key={badge.value}
                onClick={() => {
                  if (setSelectedBadges) {
                    if (selectedBadges.includes(badge.value)) {
                      setSelectedBadges(selectedBadges.filter(b => b !== badge.value));
                    } else {
                      setSelectedBadges([...selectedBadges, badge.value]);
                    }
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedBadges.includes(badge.value)
                    ? 'bg-[#4CAF50] text-white'
                    : 'bg-gray-100 text-[#424242] hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{badge.icon}</span>
                {badge.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bouton réinitialiser */}
      {resetFilters && (
        <button 
          onClick={resetFilters}
          className="w-full bg-[#E8F5E8] text-[#424242] py-2 px-4 rounded-lg hover:bg-[#4CAF50] hover:text-white transition-all duration-300"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

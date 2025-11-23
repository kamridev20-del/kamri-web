'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import ModernHeader from '../../components/ModernHeader';
import HomeFooter from '../../components/HomeFooter';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';
import { Tag, Package, Search as SearchIcon } from 'lucide-react';
import Image from 'next/image';

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    images?: string[];
    category?: { name: string };
    badge?: string;
    stock: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    nameEn?: string;
    icon?: string;
    imageUrl?: string;
    productCount: number;
  }>;
  totalProducts: number;
  totalCategories: number;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!query || query.trim().length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.searchProducts(query.trim(), 50);
        if (response.data) {
          setResults(response.data);
        } else {
          setError(response.error || 'Erreur lors de la recherche');
        }
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error('Erreur recherche:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (!query || query.trim().length < 2) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#424242] mb-2">
              Rechercher des produits
            </h1>
            <p className="text-gray-600">
              Entrez au moins 2 caractères pour commencer votre recherche
            </p>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-500 mb-4">❌</div>
            <h1 className="text-2xl font-bold text-[#424242] mb-2">Erreur</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de recherche */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#424242] mb-2">
            Résultats de recherche pour "{query}"
          </h1>
          {results && (
            <p className="text-gray-600">
              {results.totalProducts} produit{results.totalProducts > 1 ? 's' : ''} trouvé{results.totalProducts > 1 ? 's' : ''}
              {results.totalCategories > 0 && (
                <> • {results.totalCategories} catégorie{results.totalCategories > 1 ? 's' : ''}</>
              )}
            </p>
          )}
        </div>

        {/* Catégories */}
        {results && results.categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#424242] mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#4CAF50]" />
              Catégories ({results.totalCategories})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative h-32 sm:h-40 bg-[#E8F5E8] flex items-center justify-center">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : category.icon ? (
                      <span className="text-5xl">{category.icon}</span>
                    ) : (
                      <Tag className="h-12 w-12 text-[#4CAF50]" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#424242] group-hover:text-[#4CAF50] transition-colors mb-1 line-clamp-2">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Produits */}
        {results && results.products.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-[#424242] mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#4CAF50]" />
              Produits ({results.totalProducts})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {results.products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        ) : results && results.products.length === 0 && results.categories.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#424242] mb-2">
              Aucun résultat trouvé
            </h2>
            <p className="text-gray-600 mb-6">
              Nous n'avons trouvé aucun produit ou catégorie correspondant à "{query}"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors font-medium"
              >
                Voir tous les produits
              </Link>
              <Link
                href="/categories"
                className="px-6 py-3 bg-white text-[#4CAF50] border-2 border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] transition-colors font-medium"
              >
                Voir toutes les catégories
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <HomeFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
        <HomeFooter />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}


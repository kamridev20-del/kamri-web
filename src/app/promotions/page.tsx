'use client';

import { useEffect, useState } from 'react';
import CategoryTabs from '../../components/CategoryTabs';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import ProductCard from '../../components/ProductCard';
import ProductFilters from '../../components/ProductFilters';
import { apiClient } from '../../lib/api';


interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  badge: string | null;
  stock: number;
  supplier: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories
        const categoriesResponse = await apiClient.getCategories();
        if (categoriesResponse.data) {
          const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }

        // Charger les produits
        const productsResponse = await apiClient.getProducts();
        if (productsResponse.data) {
          setProducts(productsResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrage des produits - SEULEMENT les produits en promotion
  useEffect(() => {
    let filtered = products.filter(product => 
      product.badge === 'promo' || product.originalPrice && product.originalPrice > product.price
    );

    // Filtre par catégorie
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => 
        product.category?.id === selectedCategory
      );
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Tri
    switch (sortBy) {
      case 'prix_croissant':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'prix_decroissant':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nouveautes':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default: // populaire
        filtered.sort((a, b) => b.stock - a.stock);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#424242] mb-8 text-center">🔥 Promotions</h1>

        <div className="flex gap-8">
          {/* Sidebar avec filtres */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ProductFilters
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Catégories */}
            <CategoryTabs
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />

            {/* Résultats */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#424242]">
                  {loading ? 'Chargement...' : `${filteredProducts.length} produits en promotion trouvés`}
                </h2>
                <button 
                  className="lg:hidden bg-[#4CAF50] text-white px-4 py-2 rounded-lg"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtres
                </button>
              </div>

              {/* État de chargement */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⏳</div>
                  <h3 className="text-xl font-semibold text-[#424242] mb-2">
                    Chargement des promotions...
                  </h3>
                  <p className="text-[#81C784]">
                    Veuillez patienter
                  </p>
                </div>
              ) : (
                <>
                  {/* Grille de produits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Message si aucun produit */}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">🔍</div>
                      <h2 className="text-2xl font-bold text-[#424242] mb-2">
                        Aucune promotion trouvée
                      </h2>
                      <p className="text-lg text-[#81C784]">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomeFooter from '../../../components/HomeFooter';
import ModernHeader from '../../../components/ModernHeader';
import { apiClient, Category, Product } from '../../../lib/api';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        
        // Décoder le slug pour gérer les caractères spéciaux
        const decodedSlug = decodeURIComponent(slug);
        
        // Charger toutes les catégories pour trouver celle correspondant au slug
        const categoriesResponse = await apiClient.getCategories();
        console.log('🔍 [CATEGORY-SLUG] Response from API:', categoriesResponse);
        
        if (categoriesResponse.data) {
          // L'API backend retourne { data: categories, message: '...' }
          // Notre API client retourne { data: { data: categories, message: '...' } }
          const backendData = (categoriesResponse.data as any)?.data || categoriesResponse.data;
          const categories = Array.isArray(backendData) ? backendData : [];
          console.log('📂 [CATEGORY-SLUG] Categories list:', categories);
          
          // Debug: Afficher les catégories et le slug
          console.log('🔍 Slug recherché (encodé):', slug);
          console.log('🔍 Slug recherché (décodé):', decodedSlug);
          console.log('📂 Catégories disponibles:', categories.map(cat => ({
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/\s+/g, '-')
          })));
          
          // Trouver la catégorie par slug (nom en minuscules)
          const foundCategory = categories.find(cat => 
            cat.name.toLowerCase().replace(/\s+/g, '-') === decodedSlug
          );
          
          console.log('✅ Catégorie trouvée:', foundCategory);
          
          if (foundCategory) {
            setCategory(foundCategory);
            
            // Charger les produits de cette catégorie (limité à 6 pour la page d'accueil)
            const productsResponse = await apiClient.getProducts();
            if (productsResponse.data) {
              // Même logique pour les produits
              const backendProductsData = (productsResponse.data as any)?.data || productsResponse.data;
              const products = Array.isArray(backendProductsData) ? backendProductsData : [];
              const categoryProducts = products.filter((product) => 
                product.category?.name === foundCategory.name
              );
              setFeaturedProducts(categoryProducts.slice(0, 6));
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la catégorie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-semibold text-[#424242]">Chargement...</h2>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-[#424242] mb-2">Catégorie non trouvée</h2>
            <p className="text-[#81C784] mb-6">Cette catégorie n'existe pas.</p>
            <Link 
              href="/categories" 
              className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg hover:bg-[#45a049] transition-colors"
            >
              Retour aux catégories
            </Link>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-[#4CAF50] hover:text-[#45a049]">Accueil</Link>
            <span className="text-gray-400">→</span>
            <Link href="/categories" className="text-[#4CAF50] hover:text-[#45a049]">Catégories</Link>
            <span className="text-gray-400">→</span>
            <span className="text-gray-600">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A3C2E] mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-[#4B6254] mb-8 max-w-2xl mx-auto">
              Découvrez notre sélection de produits {category.name.toLowerCase()} soigneusement choisis pour vous
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-[#4CAF50]">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span className="font-semibold">{featuredProducts.length} produits</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Qualité garantie</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Produits en vedette */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#424242]">
                Produits en vedette
              </h2>
              <Link 
                href={`/categories/${slug}/products`}
                className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg hover:bg-[#45a049] transition-colors flex items-center space-x-2"
              >
                <span>Voir tous les produits</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                          🛍️
                        </div>
                      )}
                      {product.badge && (
                        <div className="absolute top-3 left-3 bg-[#4CAF50] text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {product.badge}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[#424242] mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {product.supplier?.name || 'Fournisseur inconnu'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-[#4CAF50]">
                            {product.price.toFixed(2)}$
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.originalPrice.toFixed(2)}$
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {product.stock} en stock
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-[#4CAF50] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à explorer {category.name} ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Découvrez tous nos produits {category.name.toLowerCase()} avec des prix imbattables
            </p>
            <Link 
              href={`/categories/${slug}/products`}
              className="bg-white text-[#4CAF50] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Voir tous les produits</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      <HomeFooter />
    </div>
  );
}

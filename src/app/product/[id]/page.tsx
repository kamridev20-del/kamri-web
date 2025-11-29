'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomeFooter from '../../../components/HomeFooter';
import ModernHeader from '../../../components/ModernHeader';
import ProductImageGallery from '../../../components/ProductImageGallery';
import ProductInfo from '../../../components/ProductInfo';
import SimilarProducts from '../../../components/SimilarProducts';
import ProductTabs from '../../../components/ProductTabs';
import ProductBreadcrumbs from '../../../components/ProductBreadcrumbs';
import ProductShareButtons from '../../../components/ProductShareButtons';
import ProductStats from '../../../components/ProductStats';
import ProductFAQ from '../../../components/ProductFAQ';
import RecommendedProducts from '../../../components/RecommendedProducts';
import { apiClient } from '../../../lib/api';
import { useTranslation } from '../../../contexts/LanguageContext';


interface ProductVariant {
  id: string;
  productId: string;
  cjVariantId: string | null;
  name: string | null;
  sku: string | null;
  price: number | null;
  weight: number | null;
  dimensions: string | null;
  image: string | null;
  status: string | null;
  properties: string | null;
  stock: number | null;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[]; // Array de strings pour les URLs d'images
  category?: {
    id: string;
    name: string;
  };
  type?: 'mode' | 'tech';
  rating?: number;
  reviews?: number;
  badge?: string;
  brand?: string;
  supplier?: {
    name: string;
  };
  description?: string;
  sizes?: string[] | null;
  colors?: string[];
  specifications?: Record<string, string> | null;
  inStock?: boolean;
  stockCount?: number;
  stock: number;
  status: string;
  sales?: number;
  listedNum?: number;
  deliveryCycle?: string;
  isFreeShipping?: boolean;
  productVideo?: string | any; // ✅ Vidéo du produit (peut être string JSON ou objet)
  // ✅ AJOUT : Support des variants CJ
  productVariants?: ProductVariant[];
  variants?: string; // JSON string des variants CJ
  cjMapping?: {
    cjProductId: string;
  } | null;
}

// Fonction pour récupérer des produits similaires
function getSimilarProducts(allProducts: Product[], category: string, currentId: string): Product[] {
  return allProducts
    .filter(product => product.category?.name === category && product.id !== currentId)
    .slice(0, 4);
}

// Fonction pour récupérer des produits recommandés (différents de la catégorie)
function getRecommendedProducts(allProducts: Product[], currentId: string, limit: number = 5): Product[] {
  return allProducts
    .filter(product => product.id !== currentId)
    .sort(() => Math.random() - 0.5) // Mélanger aléatoirement
    .slice(0, limit);
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const { language } = useTranslation(); // ✅ Utiliser le contexte de langue
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantImage, setVariantImage] = useState<string | null>(null); // ✅ Image du variant sélectionné

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // Charger le produit spécifique
        const productResponse = await apiClient.getProduct(productId, language as 'fr' | 'en');
        console.log('🔍 [ProductDetail] Response from API:', productResponse);
        
        if (productResponse.data) {
          // L'API backend retourne { data: product, message: '...' }
          // Notre API client retourne { data: { data: product, message: '...' } }
          const backendData = (productResponse.data as any)?.data || productResponse.data;
          console.log('📦 [ProductDetail] Product data:', backendData);
          setProduct(backendData);
          
          // Charger tous les produits pour les produits similaires
          const productsResponse = await apiClient.getProducts(language as 'fr' | 'en');
          if (productsResponse.data) {
            // Même logique pour les produits - gérer les deux formats de réponse
            const backendProductsData = (productsResponse.data as any)?.data || productsResponse.data;
            const products = Array.isArray(backendProductsData) ? backendProductsData : [];
            setAllProducts(products);
            
            // Trouver des produits similaires
            const similar = getSimilarProducts(
              products, 
              backendData.category?.name || '', 
              productId
            );
            setSimilarProducts(similar);
            
            // Trouver des produits recommandés
            const recommended = getRecommendedProducts(products, productId, 5);
            setRecommendedProducts(recommended);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProductData();
    }
  }, [productId, language]); // ✅ Recharger quand la langue ou le produit change

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-[#424242] mb-2">Produit non trouvé</h1>
            <p className="text-[#81C784]">Le produit que vous recherchez n'existe pas.</p>
          </div>
        </div>
      </div>
    );
  }

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <ProductBreadcrumbs 
          category={product.category}
          productName={product.name}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galerie d'images */}
          <ProductImageGallery 
            images={product.images || [product.image || '/images/modelo.png']}
            mainImage={product.image || '/images/modelo.png'}
            productName={product.name}
            variantImage={variantImage} // ✅ Passer l'image du variant
            videos={[]} // Vidéos désactivées - IDs CJ non convertibles en URLs
          />
          
          {/* Informations produit */}
          <div>
            <ProductInfo 
              product={product}
              onVariantChange={(variant, image) => {
                setVariantImage(image); // ✅ Mettre à jour l'image
              }}
            />
            
            {/* ✅ BADGES DE CONFIANCE - Cards iconiques */}
            <div className="grid grid-cols-4 gap-1.5 my-3">
              <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-[#4CAF50] mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] font-semibold text-gray-700">Stock</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-[#2196F3] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="text-[9px] font-semibold text-gray-700">Retour</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-[#FFC107] mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] font-semibold text-gray-700">30j</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-[#9C27B0] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[9px] font-semibold text-gray-700">Sécu</span>
              </div>
            </div>
            
            {/* Stats (vues, ventes) */}
            <ProductStats 
              views={undefined}
              sales={product.sales}
              listedNum={product.listedNum}
            />
            
            {/* Share Buttons */}
            <ProductShareButtons 
              productName={product.name}
              productUrl={productUrl}
            />
          </div>
        </div>
        
        {/* Section Description/Avis + FAQ en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabs pour Description et Avis */}
          <div>
            <ProductTabs
              description={product.description}
              specifications={product.specifications}
              deliveryCycle={product.deliveryCycle}
              reviews={product.reviews}
              rating={product.rating}
              cjProductId={(product as any).cjMapping?.cjProductId || null}
              productId={product.id}
            />
          </div>
          
          {/* FAQ */}
          <div>
            <ProductFAQ />
          </div>
        </div>
        
        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <SimilarProducts products={similarProducts} />
          </div>
        )}
        
        {/* Produits recommandés */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <RecommendedProducts products={recommendedProducts} />
        )}
      </div>
      
      <HomeFooter />
    </div>
  );
}

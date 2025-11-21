'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { apiClient } from '../lib/api';

export default function BestOffers() {
  const [bestOffers, setBestOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      console.log('✅ Produit ajouté au panier:', productId);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout au panier:', error);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      await addToWishlist(productId);
      console.log('✅ Produit ajouté aux favoris:', productId);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout aux favoris:', error);
    }
  };

  useEffect(() => {
    const loadBestOffers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts();
        if (response.data) {
          // L'API backend retourne { data: products, message: '...' }
          // Notre API client retourne { data: { data: products, message: '...' } }
          const backendData = response.data.data || response.data;
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

  interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    badge?: string;
  }

  interface ProductCardProps {
    product: Product;
  }

  function ProductCard({ product }: ProductCardProps) {
    return (
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
        {/* Image avec lien vers détail */}
        <a href={`/product/${product.id}`} className="block">
          <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF7043] text-white rounded-full text-xs font-bold">
                {product.badge}
              </div>
            )}
            
            {/* Bouton Favoris */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToWishlist(product.id);
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
                isInWishlist(product.id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <svg className="h-5 w-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </a>
        
        {/* Product info */}
        <div className="p-6">
          <a href={`/product/${product.id}`} className="block">
            <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-1 hover:text-[#4CAF50] transition-colors">{product.name}</h3>
          </a>
          <div className="flex items-center gap-2 mb-6">
            <p className="text-2xl font-bold text-[#4CAF50]">{product.price.toFixed(2)}$</p>
            {product.originalPrice && (
              <p className="text-lg text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}$</p>
            )}
          </div>
          
          <button 
            onClick={() => handleAddToCart(product.id)}
            className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-full font-bold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            Ajouter au panier
          </button>
        </div>
      </div>
    );
  }

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {bestOffers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

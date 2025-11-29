'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from '../lib/api';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  variantDetails?: {
    color?: string;
    size?: string;
    [key: string]: any;
  } | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    stock: number;
    category?: {
      name: string;
    };
    supplier?: {
      name: string;
    };
    images?: Array<{ url: string; alt?: string }>;
  };
  variant?: {
    id: string;
    name: string | null;
    properties: string | null;
  } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, variantId?: string, variantDetails?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
  userId: string | null;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children, userId }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Ref pour accéder à cartItems sans créer de dépendance
  const cartItemsRef = useRef<CartItem[]>([]);

  // Mettre à jour la ref quand cartItems change
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const cartCount = useMemo(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const refreshCart = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getCart();
      if (response.data) {
        const items = Array.isArray(response.data) ? response.data : [];
        console.log('🛒 [CartContext] Panier reçu:', items.length, 'articles');
        items.forEach((item, index) => {
          console.log(`🛒 [CartContext] Article ${index + 1}:`, {
            id: item.id,
            productId: item.productId,
            productName: item.product?.name,
            variantId: item.variantId,
            variantDetails: item.variantDetails,
            hasVariantDetails: !!item.variantDetails,
            variantDetailsKeys: item.variantDetails ? Object.keys(item.variantDetails) : []
          });
        });
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string, variantDetails?: any) => {
    if (!userId) {
      console.error('❌ [CartContext] Impossible d\'ajouter au panier: utilisateur non connecté');
      throw new Error('Vous devez être connecté pour ajouter au panier');
    }
    
    try {
      console.log('🛒 [CartContext] Ajout au panier:', { 
        productId, 
        quantity, 
        variantId, 
        variantDetails,
        variantDetailsType: typeof variantDetails,
        variantDetailsKeys: variantDetails ? Object.keys(variantDetails) : [],
        userId 
      });
      const response = await apiClient.addToCart(productId, quantity, variantId, variantDetails);
      if (response.error) {
        throw new Error(response.error);
      }
      console.log('✅ [CartContext] Produit ajouté avec succès, réponse:', {
        data: response.data,
        hasVariantDetails: !!response.data?.variantDetails,
        variantDetails: response.data?.variantDetails
      });
      await refreshCart();
    } catch (error) {
      console.error('❌ [CartContext] Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  }, [userId, refreshCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!userId) return;
    
    try {
      await apiClient.removeFromCart(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  }, [userId, refreshCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!userId) return;
    
    try {
      // Pour l'instant, on supprime et on rajoute avec la nouvelle quantité
      // TODO: Créer un endpoint PATCH pour mettre à jour la quantité
      await apiClient.removeFromCart(itemId);
      if (quantity > 0) {
        // Utiliser la ref pour accéder à cartItems sans dépendance
        const item = cartItemsRef.current.find(i => i.id === itemId);
        if (item) {
          await apiClient.addToCart(item.productId, quantity);
        }
      }
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  }, [userId, refreshCart]); // ✅ Fix: retiré cartItems des dépendances, utilise cartItemsRef.current

  const clearCart = useCallback(async () => {
    if (!userId) return;
    
    try {
      await apiClient.clearCart();
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      throw error;
    }
  }, [userId, refreshCart]);

  useEffect(() => {
    if (userId) {
      console.log('🚀 [CartProvider] Initialisation avec userId:', userId);
      refreshCart();
    } else {
      console.log('ℹ️ [CartProvider] Aucun userId, panier vide');
      setCartItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // refreshCart est stable grâce à useCallback, pas besoin de le mettre dans les dépendances

  const value: CartContextType = useMemo(() => ({
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  }), [cartItems, cartCount, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

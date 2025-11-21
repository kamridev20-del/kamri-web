'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, Category, Product } from '../lib/api';

interface AppContextType {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const response = await apiClient.getProducts();
      if (response.data) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement des produits');
      }
    } catch (error) {
      setError('Erreur lors du chargement des produits');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement des catégories');
      }
    } catch (error) {
      setError('Erreur lors du chargement des catégories');
    }
  };

  const refreshProducts = async () => {
    setIsLoading(true);
    setError(null);
    await loadProducts();
    setIsLoading(false);
  };

  const refreshCategories = async () => {
    setIsLoading(true);
    setError(null);
    await loadCategories();
    setIsLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        loadProducts(),
        loadCategories()
      ]);
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  const value = {
    products,
    categories,
    isLoading,
    error,
    refreshProducts,
    refreshCategories,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

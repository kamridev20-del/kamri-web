'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  rating?: number;
  reviews?: number;
  stock?: number;
  category?: {
    id?: string;
    name: string;
  } | null;
  brand?: string;
  supplier?: {
    name: string;
  };
  isFreeShipping?: boolean;
  deliveryCycle?: string;
  badge?: string | null;
  sales?: number;
  listedNum?: number;
  description?: string;
  [key: string]: any; // Pour permettre d'autres propriétés
}

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  const addToCompare = useCallback((product: Product) => {
    setCompareItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev; // Déjà dans la comparaison
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev; // Limite atteinte
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: string) => {
      return compareItems.some((p) => p.id === productId);
    },
    [compareItems]
  );

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const canAddMore = compareItems.length < MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    // Retourner des valeurs par défaut si le provider n'est pas monté
    return {
      compareItems: [],
      addToCompare: () => {},
      removeFromCompare: () => {},
      isInCompare: () => false,
      clearCompare: () => {},
      canAddMore: true,
    };
  }
  return context;
}


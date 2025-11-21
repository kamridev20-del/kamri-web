'use client';

import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import CompareBar from './CompareBar';

interface ConnectedProvidersProps {
  children: React.ReactNode;
}

export default function ConnectedProviders({ children }: ConnectedProvidersProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userId = useMemo(() => user?.id || null, [user?.id]);

  // Logs seulement si les valeurs changent réellement
  React.useEffect(() => {
    console.log('🔗 [ConnectedProviders] user:', user);
    console.log('🔗 [ConnectedProviders] isAuthenticated:', isAuthenticated);
    console.log('🔗 [ConnectedProviders] isLoading:', isLoading);
    console.log('🔗 [ConnectedProviders] userId:', userId);
  }, [user, isAuthenticated, isLoading, userId]);

  // Attendre que l'auth soit initialisée
  if (isLoading) {
    return (
      <CartProvider userId={null}>
        <WishlistProvider userId={null}>
          {children}
          <CompareBar />
        </WishlistProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider userId={userId}>
      <WishlistProvider userId={userId}>
        {children}
        <CompareBar />
      </WishlistProvider>
    </CartProvider>
  );
}

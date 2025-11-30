'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGeo } from '../contexts/GeoContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../lib/api';

/**
 * Composant pour tracker les visites sur le site
 * Enregistre automatiquement chaque visite avec les informations géographiques
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const { country } = useGeo();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Ne tracker que les pages publiques (pas /admin, /api, etc.)
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
      return;
    }

    // Éviter de tracker la même page plusieurs fois
    if (lastTrackedPath.current === pathname) {
      return;
    }

    // Attendre que le pays soit détecté avant de tracker
    if (!country?.countryCode) {
      return;
    }

    // Tracker la visite de manière asynchrone (ne pas bloquer le chargement)
    const trackVisit = async () => {
      try {
        await apiClient.trackVisit({
          countryCode: country.countryCode,
          countryName: country.countryName,
          path: pathname || '/',
          language: language || 'fr',
          isAuthenticated: isAuthenticated && !!user,
        });

        lastTrackedPath.current = pathname;
      } catch (error) {
        // Ne pas bloquer l'application si le tracking échoue
        console.warn('⚠️ [VisitTracker] Erreur tracking visite:', error);
      }
    };

    // Délai pour ne pas ralentir le chargement initial
    const timeoutId = setTimeout(trackVisit, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, country, language, isAuthenticated, user]);

  return null; // Ce composant ne rend rien
}


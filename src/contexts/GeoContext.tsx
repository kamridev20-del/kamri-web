'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';

interface GeoLocation {
  countryCode: string;
  countryName: string;
  currency?: string; // Code devise depuis l'API (ex: USD, EUR, XAF)
  source: 'ipapi' | 'manual' | 'address';
}

interface GeoContextType {
  country: GeoLocation | null;
  loading: boolean;
  setCountry: (countryCode: string) => Promise<void>;
  detectCountry: () => Promise<void>;
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

export const useGeo = () => {
  const context = useContext(GeoContext);
  if (!context) {
    throw new Error('useGeo must be used within a GeoProvider');
  }
  return context;
};

interface GeoProviderProps {
  children: React.ReactNode;
}

export const GeoProvider: React.FC<GeoProviderProps> = ({ children }) => {
  const [country, setCountryState] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);

  // Détecter le pays depuis l'IP
  const detectCountry = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🌍 [GeoContext] Détection automatique du pays...');

      const response = await apiClient.detectCountry();
      
      if (response.error) {
        console.warn('⚠️ [GeoContext] Erreur détection:', response.error);
        // Fallback : utiliser FR par défaut
        const fallback: GeoLocation = {
          countryCode: 'FR',
          countryName: 'France',
          source: 'manual',
        };
        setCountryState(fallback);
        localStorage.setItem('user_country', JSON.stringify(fallback));
        setLoading(false);
        return;
      }

      if (response.data) {
        // Valider que source est l'un des types autorisés
        const validSource = (response.data.source === 'ipapi' || 
                            response.data.source === 'manual' || 
                            response.data.source === 'address') 
                            ? response.data.source 
                            : 'ipapi';
        
        const geoData: GeoLocation = {
          countryCode: response.data.countryCode,
          countryName: response.data.countryName || response.data.countryCode,
          currency: response.data.currency, // Devise depuis l'API si disponible
          source: validSource,
        };

        setCountryState(geoData);
        localStorage.setItem('user_country', JSON.stringify(geoData));
        console.log('✅ [GeoContext] Pays détecté:', geoData);
      }
    } catch (error) {
      console.error('❌ [GeoContext] Erreur détection pays:', error);
      // Fallback : utiliser FR par défaut
      const fallback: GeoLocation = {
        countryCode: 'FR',
        countryName: 'France',
        source: 'manual',
      };
      setCountryState(fallback);
      localStorage.setItem('user_country', JSON.stringify(fallback));
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger le pays depuis localStorage au démarrage
  useEffect(() => {
    const loadStoredCountry = () => {
      try {
        const stored = localStorage.getItem('user_country');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Vérifier si le pays stocké a été défini manuellement ou automatiquement
          // Si c'était automatique, on redétecte pour être sûr
          if (parsed.source === 'manual') {
            // Pays défini manuellement, on le garde
            setCountryState(parsed);
            setLoading(false);
            console.log('🌍 [GeoContext] Pays chargé depuis localStorage (manuel):', parsed);
            return true;
          } else {
            // Pays détecté automatiquement précédemment, on redétecte pour être à jour
            console.log('🌍 [GeoContext] Pays précédemment détecté, nouvelle détection...');
            localStorage.removeItem('user_country'); // Supprimer l'ancien pour forcer la détection
            return false;
          }
        }
      } catch (error) {
        console.error('❌ [GeoContext] Erreur chargement pays:', error);
      }
      return false;
    };

    // Essayer de charger depuis localStorage
    if (!loadStoredCountry()) {
      // Sinon, détecter automatiquement
      detectCountry();
    }
  }, [detectCountry]);

  // Définir manuellement le pays
  const setCountry = useCallback(async (countryCode: string) => {
    try {
      setLoading(true);
      console.log('🌍 [GeoContext] Définition manuelle du pays:', countryCode);

      const response = await apiClient.setCountry(countryCode);
      
      if (response.error) {
        console.error('❌ [GeoContext] Erreur définition pays:', response.error);
        return;
      }

      if (response.data) {
        const geoData: GeoLocation = {
          countryCode: response.data.countryCode,
          countryName: response.data.countryName,
          source: 'manual',
        };

        setCountryState(geoData);
        localStorage.setItem('user_country', JSON.stringify(geoData));
        console.log('✅ [GeoContext] Pays défini:', geoData);
      }
    } catch (error) {
      console.error('❌ [GeoContext] Erreur définition pays:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: GeoContextType = useMemo(() => ({
    country,
    loading,
    setCountry,
    detectCountry,
  }), [country, loading, setCountry, detectCountry]);

  return (
    <GeoContext.Provider value={value}>
      {children}
    </GeoContext.Provider>
  );
};


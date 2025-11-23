'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import { useGeo } from './GeoContext';

// ✅ Mapping pays → devise (identique au backend)
const countryToCurrency: Record<string, string> = {
  // Europe
  FR: 'EUR',
  BE: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  GR: 'EUR',
  FI: 'EUR',
  LU: 'EUR',
  
  // Afrique - FCFA
  CM: 'XAF',
  TD: 'XAF',
  CF: 'XAF',
  CG: 'XAF',
  GA: 'XAF',
  GQ: 'XAF',
  
  SN: 'XOF',
  CI: 'XOF',
  BF: 'XOF',
  ML: 'XOF',
  NE: 'XOF',
  TG: 'XOF',
  BJ: 'XOF',
  GW: 'XOF',
  
  // Amérique
  US: 'USD',
  CA: 'CAD',
  MX: 'MXN',
  BR: 'BRL',
  
  // Asie
  CN: 'CNY',
  JP: 'JPY',
  KR: 'KRW',
  IN: 'INR',
  TH: 'THB',
  VN: 'VND',
  
  // Autres
  GB: 'GBP',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  RU: 'RUB',
};

interface CurrencyContextType {
  currency: string;
  rates: Record<string, number>;
  loading: boolean;
  setCurrency: (currency: string) => void;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (priceUSD: number) => string;
  getCurrencyFromCountry: (countryCode: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { country } = useGeo();
  const [currency, setCurrencyState] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1.0 });
  const [loading, setLoading] = useState(true);

  // Obtenir la devise d'un pays
  const getCurrencyFromCountry = useCallback((countryCode: string): string => {
    return countryToCurrency[countryCode.toUpperCase()] || 'USD';
  }, []);

  // Charger les taux de change
  const loadExchangeRates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getExchangeRates();
      if (response.data && response.data.rates) {
        setRates(response.data.rates);
        console.log('✅ [CurrencyContext] Taux de change chargés:', response.data.rates);
      }
    } catch (error) {
      console.error('❌ [CurrencyContext] Erreur chargement taux:', error);
      // Fallback : USD = 1.0
      setRates({ USD: 1.0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Déterminer la devise automatiquement selon le pays
  useEffect(() => {
    if (country?.countryCode) {
      // Priorité 1 : Devise depuis l'API ipapi.com (si disponible)
      // Priorité 2 : Mapping manuel pays → devise
      // Priorité 3 : USD par défaut
      const detectedCurrency = country.currency || getCurrencyFromCountry(country.countryCode);
      
      // Charger la devise depuis localStorage ou utiliser la détection
      const storedCurrency = localStorage.getItem('user_currency');
      if (storedCurrency) {
        setCurrencyState(storedCurrency);
      } else {
        setCurrencyState(detectedCurrency);
        localStorage.setItem('user_currency', detectedCurrency);
      }
      
      console.log('🌍 [CurrencyContext] Devise détectée:', detectedCurrency, 'pour pays:', country.countryCode, country.currency ? '(depuis API)' : '(depuis mapping)');
    }
  }, [country, getCurrencyFromCountry]);

  // Charger les taux de change au démarrage
  useEffect(() => {
    loadExchangeRates();
    
    // Recharger les taux toutes les heures (en cas de mise à jour)
    const interval = setInterval(() => {
      loadExchangeRates();
    }, 3600000); // 1 heure

    return () => clearInterval(interval);
  }, [loadExchangeRates]);

  // Convertir un prix USD vers la devise actuelle
  const convertPrice = useCallback((priceUSD: number): number => {
    if (currency === 'USD' || !rates[currency]) {
      return priceUSD;
    }
    return priceUSD * rates[currency];
  }, [currency, rates]);

  // Formater un prix selon la devise
  const formatPrice = useCallback((priceUSD: number): string => {
    const convertedPrice = convertPrice(priceUSD);
    
    try {
      const locale = getLocaleFromCurrency(currency);
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedPrice);
    } catch (error) {
      // Fallback simple
      return `${convertedPrice.toFixed(2)} ${currency}`;
    }
  }, [currency, convertPrice]);

  // Obtenir la locale selon la devise
  const getLocaleFromCurrency = (currency: string): string => {
    const localeMap: Record<string, string> = {
      USD: 'en-US',
      EUR: 'fr-FR',
      GBP: 'en-GB',
      CNY: 'zh-CN',
      JPY: 'ja-JP',
      CAD: 'en-CA',
      AUD: 'en-AU',
      XAF: 'fr-FR',
      XOF: 'fr-FR',
    };
    return localeMap[currency] || 'en-US';
  };

  // Définir manuellement la devise
  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('user_currency', newCurrency);
    console.log('💰 [CurrencyContext] Devise changée:', newCurrency);
  }, []);

  const value: CurrencyContextType = useMemo(() => ({
    currency,
    rates,
    loading,
    setCurrency,
    convertPrice,
    formatPrice,
    getCurrencyFromCountry,
  }), [currency, rates, loading, setCurrency, convertPrice, formatPrice, getCurrencyFromCountry]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};


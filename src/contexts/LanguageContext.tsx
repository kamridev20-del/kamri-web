'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';

type Language = 'fr' | 'en';

type Translations = typeof frTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fonction utilitaire pour obtenir une valeur imbriquée depuis un objet
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Retourne la clé si la traduction n'existe pas
    }
  }
  
  return typeof value === 'string' ? value : path;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // ✅ Détection automatique de la langue avec ordre de priorité
  const detectLanguage = (): Language => {
    // 1. Vérifier localStorage (préférence utilisateur sauvegardée)
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage === 'fr' || savedLanguage === 'en') {
        return savedLanguage;
      }
    }

    // 2. Vérifier la langue du navigateur
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language || (navigator as any).userLanguage;
      if (browserLang.startsWith('fr')) {
        return 'fr';
      }
      if (browserLang.startsWith('en')) {
        return 'en';
      }
    }

    // 3. Fallback par défaut
    return 'fr';
  };

  const [language, setLanguageState] = useState<Language>(() => {
    // Initialiser avec la langue détectée
    if (typeof window !== 'undefined') {
      return detectLanguage();
    }
    return 'fr';
  });

  // Charger les traductions selon la langue
  const translations = language === 'fr' ? frTranslations : enTranslations;

  // Fonction pour changer la langue
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // Fonction de traduction avec support des paramètres
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(translations, key);
    
    // Remplacer les paramètres dans la traduction
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const paramValue = String(params[paramKey]);
        // Remplacer {paramKey} dans la traduction
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      });
    }
    
    return translation;
  };

  // ✅ Détecter la langue au montage si pas de préférence sauvegardée
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (!savedLanguage) {
        const detected = detectLanguage();
        setLanguageState(detected);
        localStorage.setItem('language', detected);
      }
    }
  }, []);

  // ✅ Mettre à jour l'attribut lang du HTML
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook alias pour useTranslation (plus court)
export function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
}


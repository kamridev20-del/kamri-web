'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110"
      title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
      aria-label={language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <Globe className="h-5 w-5" />
      <span className="font-medium text-sm">
        {language === 'fr' ? 'FR' : 'EN'}
      </span>
    </button>
  );
}

// Version avec menu déroulant (alternative)
export function LanguageSelectorDropdown() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out"
        aria-label="Select language"
      >
        <Globe className="h-5 w-5" />
        <span className="font-medium text-sm">
          {language === 'fr' ? 'FR' : 'EN'}
        </span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button
          onClick={() => setLanguage('fr')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E8F5E8] rounded-t-lg ${
            language === 'fr' ? 'text-[#4CAF50] font-semibold' : 'text-[#424242]'
          }`}
        >
          🇫🇷 Français
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E8F5E8] rounded-b-lg ${
            language === 'en' ? 'text-[#4CAF50] font-semibold' : 'text-[#424242]'
          }`}
        >
          🇬🇧 English
        </button>
      </div>
    </div>
  );
}


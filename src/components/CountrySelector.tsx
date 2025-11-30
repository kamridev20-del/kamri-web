'use client';

import { Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useGeo } from '../contexts/GeoContext';
import { useLanguage } from '../contexts/LanguageContext';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dollar US' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (XAF)' },
  { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (XOF)' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinois' },
  { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
  { code: 'CAD', symbol: '$', name: 'Dollar Canadien' },
  { code: 'AUD', symbol: '$', name: 'Dollar Australien' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonais' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc Suisse' },
] as const;

const COUNTRIES = [
  { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
  { code: 'AU', name: 'Australie', flag: '🇦🇺' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'BG', name: 'Bulgarie', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CF', name: 'République centrafricaine', flag: '🇨🇫' },
  { code: 'CN', name: 'Chine', flag: '🇨🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'HR', name: 'Croatie', flag: '🇭🇷' },
  { code: 'CY', name: 'Chypre', flag: '🇨🇾' },
  { code: 'CZ', name: 'République tchèque', flag: '🇨🇿' },
  { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonie', flag: '🇪🇪' },
  { code: 'FI', name: 'Finlande', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
  { code: 'GQ', name: 'Guinée équatoriale', flag: '🇬🇶' },
  { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼' },
  { code: 'HU', name: 'Hongrie', flag: '🇭🇺' },
  { code: 'IS', name: 'Islande', flag: '🇮🇸' },
  { code: 'IN', name: 'Inde', flag: '🇮🇳' },
  { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'JP', name: 'Japon', flag: '🇯🇵' },
  { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
  { code: 'LV', name: 'Lettonie', flag: '🇱🇻' },
  { code: 'LT', name: 'Lituanie', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MT', name: 'Malte', flag: '🇲🇹' },
  { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  { code: 'NO', name: 'Norvège', flag: '🇳🇴' },
  { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Roumanie', flag: '🇷🇴' },
  { code: 'RU', name: 'Russie', flag: '🇷🇺' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'SK', name: 'Slovaquie', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovénie', flag: '🇸🇮' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'SE', name: 'Suède', flag: '🇸🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'TD', name: 'Tchad', flag: '🇹🇩' },
  { code: 'TH', name: 'Thaïlande', flag: '🇹🇭' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export default function CountrySelector() {
  const { country, setCountry, loading } = useGeo();
  const { currency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showHoverDropdown, setShowHoverDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trouver le symbole de la devise actuelle
  const currentCurrencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES.find(c => c.code === 'EUR');
  const currencySymbol = currentCurrencyInfo?.symbol || '€';

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectCountry = async (countryCode: string) => {
    await setCountry(countryCode);
    setIsOpen(false);
  };

  const currentCountry = COUNTRIES.find(c => c.code === country?.countryCode) || COUNTRIES[0];

  // Gérer le hover avec un délai
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowHoverDropdown(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverDropdown(false);
    }, 200); // Délai de 200ms avant de fermer
  };

  // Ouvrir le modal complet
  const handleOpenFullModal = () => {
    setShowHoverDropdown(false);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-lg transition-all duration-200"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-lg">{currentCountry.flag}</span>
        <span className="hidden md:inline text-xs font-medium">{currentCountry.code}</span>
      </button>

      {/* Dropdown au survol - Style Temu */}
      {showHoverDropdown && !isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          style={{ zIndex: 9999 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Section Langue */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Langue</p>
            <div className="space-y-1">
              <button
                onClick={() => setLanguage('fr')}
                className="w-full flex items-center gap-1.5 text-left hover:bg-[#E8F5E8] rounded px-1 py-0.5 transition-colors"
              >
                <input
                  type="radio"
                  checked={language === 'fr'}
                  readOnly
                  className="w-3 h-3 text-[#4CAF50] focus:ring-[#4CAF50]"
                />
                <span className={`text-xs ${language === 'fr' ? 'text-[#4CAF50] font-semibold' : 'text-gray-700'}`}>
                  🇫🇷 Français
                </span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className="w-full flex items-center gap-1.5 text-left hover:bg-[#E8F5E8] rounded px-1 py-0.5 transition-colors"
              >
                <input
                  type="radio"
                  checked={language === 'en'}
                  readOnly
                  className="w-3 h-3 text-[#4CAF50] focus:ring-[#4CAF50]"
                />
                <span className={`text-xs ${language === 'en' ? 'text-[#4CAF50] font-semibold' : 'text-gray-700'}`}>
                  🇬🇧 English
                </span>
              </button>
            </div>
          </div>

          {/* Section Devise */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Devise</p>
            <p className="text-xs text-gray-700">{currency}: {currencySymbol}</p>
          </div>

          {/* Message pays détecté */}
          <div className="px-3 py-2 bg-[#F0FDF4]">
            <div className="flex items-start gap-1.5">
              <span className="text-xl">{currentCountry.flag}</span>
              <div>
                <p className="text-[10px] text-gray-600">
                  Shopping sur
                </p>
                <p className="text-xs font-semibold text-[#4CAF50]">
                  KAMRI {currentCountry.name}
                </p>
              </div>
            </div>
          </div>

          {/* Bouton changer de pays */}
          <div className="px-3 py-2">
            <button
              onClick={handleOpenFullModal}
              className="w-full px-3 py-1.5 text-xs bg-white border-2 border-[#4CAF50] text-[#4CAF50] rounded-lg font-semibold hover:bg-[#4CAF50] hover:text-white transition-all duration-200"
            >
              Changer de pays/région
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 max-h-80 overflow-y-auto" style={{ zIndex: 9999 }}>
          {/* Section Langue */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Langue</p>
            <div className="space-y-1">
              <button
                onClick={() => setLanguage('fr')}
                className="w-full flex items-center gap-1.5 text-left hover:bg-[#E8F5E8] rounded px-1 py-0.5 transition-colors"
              >
                <input
                  type="radio"
                  checked={language === 'fr'}
                  readOnly
                  className="w-3 h-3 text-[#4CAF50] focus:ring-[#4CAF50]"
                />
                <span className={`text-xs ${language === 'fr' ? 'text-[#4CAF50] font-semibold' : 'text-gray-700'}`}>
                  🇫🇷 Français
                </span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className="w-full flex items-center gap-1.5 text-left hover:bg-[#E8F5E8] rounded px-1 py-0.5 transition-colors"
              >
                <input
                  type="radio"
                  checked={language === 'en'}
                  readOnly
                  className="w-3 h-3 text-[#4CAF50] focus:ring-[#4CAF50]"
                />
                <span className={`text-xs ${language === 'en' ? 'text-[#4CAF50] font-semibold' : 'text-gray-700'}`}>
                  🇬🇧 English
                </span>
              </button>
            </div>
          </div>

          {/* Section Devise */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Devise</p>
            <p className="text-xs text-gray-700">{currency}: {currencySymbol}</p>
          </div>

          <div className="px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
            <p className="text-[10px] font-semibold text-gray-500 uppercase">Sélectionner le pays</p>
          </div>
          <div className="py-0.5">
            {COUNTRIES.map((countryOption) => (
              <button
                key={countryOption.code}
                onClick={() => handleSelectCountry(countryOption.code)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#E8F5E8] transition-colors ${
                  country?.countryCode === countryOption.code
                    ? 'bg-[#E8F5E8] text-[#4CAF50] font-semibold'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-base">{countryOption.flag}</span>
                <span className="flex-1 text-left">{countryOption.name}</span>
                {country?.countryCode === countryOption.code && (
                  <svg className="w-3 h-3 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


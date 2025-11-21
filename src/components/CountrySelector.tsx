'use client';

import { useState, useRef, useEffect } from 'react';
import { useGeo } from '../contexts/GeoContext';
import { Globe } from 'lucide-react';

const COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australie', flag: '🇦🇺' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'SE', name: 'Suède', flag: '🇸🇪' },
  { code: 'NO', name: 'Norvège', flag: '🇳🇴' },
  { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlande', flag: '🇫🇮' },
  { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
  { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
  { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
  { code: 'CZ', name: 'République tchèque', flag: '🇨🇿' },
  { code: 'HU', name: 'Hongrie', flag: '🇭🇺' },
  { code: 'RO', name: 'Roumanie', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgarie', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatie', flag: '🇭🇷' },
  { code: 'SK', name: 'Slovaquie', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovénie', flag: '🇸🇮' },
  { code: 'EE', name: 'Estonie', flag: '🇪🇪' },
  { code: 'LV', name: 'Lettonie', flag: '🇱🇻' },
  { code: 'LT', name: 'Lituanie', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', name: 'Malte', flag: '🇲🇹' },
  { code: 'CY', name: 'Chypre', flag: '🇨🇾' },
  { code: 'IS', name: 'Islande', flag: '🇮🇸' },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'RU', name: 'Russie', flag: '🇷🇺' },
  { code: 'CN', name: 'Chine', flag: '🇨🇳' },
  { code: 'JP', name: 'Japon', flag: '🇯🇵' },
  { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
  { code: 'IN', name: 'Inde', flag: '🇮🇳' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
];

export default function CountrySelector() {
  const { country, setCountry, loading } = useGeo();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-lg transition-all duration-200"
        title={`Pays de livraison: ${currentCountry.name}`}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-lg">{currentCountry.flag}</span>
        <span className="hidden md:inline text-xs font-medium">{currentCountry.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Sélectionner le pays</p>
          </div>
          <div className="py-1">
            {COUNTRIES.map((countryOption) => (
              <button
                key={countryOption.code}
                onClick={() => handleSelectCountry(countryOption.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#E8F5E8] transition-colors ${
                  country?.countryCode === countryOption.code
                    ? 'bg-[#E8F5E8] text-[#4CAF50] font-semibold'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{countryOption.flag}</span>
                <span className="flex-1 text-left">{countryOption.name}</span>
                {country?.countryCode === countryOption.code && (
                  <svg className="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
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


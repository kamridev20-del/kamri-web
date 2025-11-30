'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { ChevronDown } from 'lucide-react';

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

export default function CurrencySelector() {
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[#E8F5E8] transition-colors text-sm font-medium text-[#424242]"
        title="Changer la devise"
      >
        <span className="text-xs sm:text-sm">{currentCurrency.symbol}</span>
        <span className="hidden sm:inline text-xs">{currentCurrency.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[10000] max-h-[300px] overflow-y-auto">
          {CURRENCIES.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                currency === curr.code
                  ? 'bg-[#E8F5E8] text-[#4CAF50] font-semibold'
                  : 'text-[#424242] hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{curr.code}</div>
                  <div className="text-xs text-gray-500">{curr.name}</div>
                </div>
                <span className="text-xs">{curr.symbol}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}






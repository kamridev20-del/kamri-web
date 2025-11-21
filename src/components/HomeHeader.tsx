
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HomeHeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function HomeHeader({ searchQuery, setSearchQuery }: HomeHeaderProps) {
  const pathname = usePathname();
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-[#E8F5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <img
                src="/images/logo.png"
                alt="KAMRI Logo"
                className="h-16 w-auto transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ maxWidth: '240px', height: '64px' }}
              />
            </Link>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery?.(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#E8F5E8] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:bg-white transition-all duration-300 ease-in-out font-medium text-[#424242] placeholder-[#81C784]"
              />
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className={`font-medium transition-all duration-300 ease-in-out hover:scale-105 ${
                pathname === '/' 
                  ? 'text-[#4CAF50] font-semibold border-b-2 border-[#4CAF50] pb-1' 
                  : 'text-[#81C784] hover:text-[#4CAF50]'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href="/products"
              className={`font-medium transition-all duration-300 ease-in-out hover:scale-105 ${
                pathname === '/products' 
                  ? 'text-[#4CAF50] font-semibold border-b-2 border-[#4CAF50] pb-1' 
                  : 'text-[#81C784] hover:text-[#4CAF50]'
              }`}
            >
              Produits
            </Link>
            <Link 
              href="/categories"
              className="text-[#81C784] hover:text-[#4CAF50] font-medium transition-all duration-300 ease-in-out hover:scale-105"
            >
              Catégories
            </Link>
            <Link 
              href="/contact"
              className="text-[#81C784] hover:text-[#4CAF50] font-medium transition-all duration-300 ease-in-out hover:scale-105"
            >
              Contact
            </Link>
          </nav>

          {/* Icônes de navigation */}
          <div className="flex items-center space-x-4">
            <button className="p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="relative p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface ProductBreadcrumbsProps {
  category?: {
    id: string;
    name: string;
  } | null;
  productName: string;
}

export default function ProductBreadcrumbs({ category, productName }: ProductBreadcrumbsProps) {
  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5 text-xs">
        <li>
          <Link 
            href="/" 
            className="text-[#81C784] hover:text-[#4CAF50] transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </Link>
        </li>
        
        {category && (
          <>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </li>
            <li>
              <Link 
                href={`/categories/${category.id}`}
                className="text-[#81C784] hover:text-[#4CAF50] transition-colors"
              >
                {category.name}
              </Link>
            </li>
          </>
        )}
        
        <li>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </li>
        <li className="text-[#424242] font-medium truncate max-w-xs" title={productName}>
          {productName}
        </li>
      </ol>
    </nav>
  );
}


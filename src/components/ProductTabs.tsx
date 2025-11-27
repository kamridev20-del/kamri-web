'use client';

import { useState } from 'react';
import ProductReviews from './ProductReviews';

// ✅ Fonction pour formatter la description de manière structurée
function formatDescription(description: string) {
  // Patterns de sections principales
  const sectionTitles = [
    'Description du produit',
    'Matériel',
    'Material',
    'Produit Attributs',
    'Product Attributes',
    'Paquet Taille',
    'Package Size',
    'Overview',
    'Product information',
    'Product Information',
    'Packing list',
    'Packing List',
    'Product Image',
    'Features',
    'Specifications'
  ];

  // Parser les attributs du type "Type: value"
  const parseAttributes = (text: string) => {
    // Détecter les patterns comme "Type: value" ou "Material: value"
    const attributePattern = /([A-Za-z\s]+):\s*([^\n\r:]+?)(?=\s*[A-Z][a-z]+:|$)/g;
    const matches = [...text.matchAll(attributePattern)];
    
    if (matches.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-2">
          {matches.map((match, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-xs font-semibold text-[#4CAF50] min-w-[120px]">{match[1].trim()}</span>
              <span className="text-xs text-[#424242]">{match[2].trim()}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // Sinon afficher tel quel
    return <p className="text-sm text-[#424242] leading-relaxed whitespace-pre-line">{text}</p>;
  };

  // Diviser en sections
  let sections: { title?: string; content: string }[] = [];
  let currentSection = { title: undefined as string | undefined, content: '' };

  const lines = description.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Vérifier si c'est un titre de section
    const isTitle = sectionTitles.some(title => 
      trimmedLine.toLowerCase() === title.toLowerCase() ||
      trimmedLine.toLowerCase().startsWith(title.toLowerCase() + ':')
    );
    
    if (isTitle && trimmedLine) {
      // Sauvegarder la section précédente
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }
      // Commencer une nouvelle section
      currentSection = { 
        title: trimmedLine.replace(':', ''), 
        content: '' 
      };
    } else if (trimmedLine) {
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
  }
  
  // Ajouter la dernière section
  if (currentSection.content.trim() || currentSection.title) {
    sections.push(currentSection);
  }

  // Si aucune section détectée, traiter comme texte simple avec parsing d'attributs
  if (sections.length === 0 || (sections.length === 1 && !sections[0].title)) {
    return parseAttributes(description);
  }

  // Render des sections
  return (
    <>
      {sections.map((section, idx) => (
        <div key={idx} className="mb-4">
          {section.title && (
            <h3 className="text-sm font-bold text-[#2E7D32] mb-2 pb-1 border-b border-gray-200">
              {section.title}
            </h3>
          )}
          <div>
            {parseAttributes(section.content)}
          </div>
        </div>
      ))}
    </>
  );
}

interface ProductTabsProps {
  description?: string;
  specifications?: Record<string, string> | null;
  deliveryCycle?: string;
  reviews?: number;
  rating?: number;
  cjProductId?: string | null;
  productId: string;
}

export default function ProductTabs({ 
  description, 
  specifications, 
  deliveryCycle,
  reviews,
  rating,
  cjProductId,
  productId
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>('description');

  const tabs = [
    { id: 'description' as const, label: 'Description', icon: '📝' },
    { id: 'specifications' as const, label: 'Spécifications', icon: '⚙️' },
    { id: 'shipping' as const, label: 'Livraison', icon: '🚚' },
    { id: 'reviews' as const, label: `Avis (${reviews || 0})`, icon: '⭐' },
  ];

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#4CAF50] border-b-2 border-[#4CAF50] bg-[#F0FDF4]'
                  : 'text-gray-600 hover:text-[#4CAF50] hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            {description ? (
              <div className="space-y-4">
                {formatDescription(description)}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune description disponible pour ce produit.</p>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div>
            {specifications && Object.keys(specifications).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-[#81C784] font-medium">{key}:</span>
                    <span className="text-[#424242] font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune spécification disponible pour ce produit.</p>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#E8F5E8] rounded-lg">
              <h4 className="text-sm font-semibold text-[#424242] mb-1.5 flex items-center gap-1.5">
                <span className="text-base">🚚</span> Délai de livraison
              </h4>
              <p className="text-sm text-[#424242]">
                {deliveryCycle 
                  ? `Livraison estimée : ${deliveryCycle} jours ouvrés`
                  : 'Livraison standard : 7-15 jours ouvrés'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mb-1.5">📦</div>
                <h5 className="text-sm font-semibold text-[#424242] mb-1">Livraison gratuite</h5>
                <p className="text-xs text-gray-600">Sur commandes de plus de 50$</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mb-1.5">🔄</div>
                <h5 className="text-sm font-semibold text-[#424242] mb-1">Retour gratuit</h5>
                <p className="text-xs text-gray-600">Sous 30 jours</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mb-1.5">🛡️</div>
                <h5 className="text-sm font-semibold text-[#424242] mb-1">Garantie</h5>
                <p className="text-xs text-gray-600">1 an sur tous les produits</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews
            cjProductId={cjProductId}
            productId={productId}
            currentRating={rating}
            currentReviewsCount={reviews}
          />
        )}
      </div>
    </div>
  );
}


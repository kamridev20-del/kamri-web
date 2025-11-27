'use client';

import { useState } from 'react';
import ProductReviews from './ProductReviews';

// ✅ Fonction pour formatter la description de manière structurée
function formatDescription(description: string) {
  // Nettoyer le markdown avant tout traitement
  let cleanedDescription = description
    .replace(/#{1,6}\s*/g, '') // Supprimer les ## titre markdown
    .replace(/\*\*/g, '') // Supprimer les ** bold markdown
    .replace(/^\s*-\s+/gm, '• ') // Remplacer - par des bullets •
    .replace(/\n{3,}/g, '\n\n') // Réduire multiples sauts de ligne
    .trim();
  
  // Améliorer le pattern pour capturer TOUS les attributs
  // Pattern amélioré : capture "Mot(s) clé: valeur" jusqu'au prochain pattern ou fin
  const attributePattern = /([A-Z][A-Za-z\s\-\/]*?):\s*([^:\n]+?)(?=\s+[A-Z][A-Za-z\s\-\/]*?:|$)/gi;
  const matches = [...cleanedDescription.matchAll(attributePattern)];
  
  if (matches.length >= 3) { // Au moins 3 attributs détectés
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {matches.map((match, idx) => {
          const key = match[1].trim();
          const value = match[2].trim();
          
          // Ignorer si la clé ou valeur est vide ou trop courte
          if (!key || !value || key.length < 2 || value.length < 1) return null;
          
          return (
            <div key={idx} className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg">
              <span className="text-xs font-semibold text-[#4CAF50]">{key}</span>
              <span className="text-xs text-[#424242]">{value}</span>
            </div>
          );
        }).filter(Boolean)}
      </div>
    );
  }
  
  // Fallback : Afficher le texte avec formatage amélioré
  const lines = cleanedDescription
    .split(/\n+/) // Séparer par retours à la ligne existants
    .filter(line => line.trim()); // Supprimer lignes vides
  
  // Si pas de retours à la ligne, essayer de détecter les phrases
  if (lines.length === 1) {
    const sentences = cleanedDescription
      .replace(/([.!?:])\s+([A-Z])/g, '$1\n\n$2') // Séparer phrases avec majuscule
      .replace(/([a-z])([A-Z][a-z])/g, '$1\n$2') // Séparer mots collés
      .split(/\n+/)
      .filter(s => s.trim() && s.length > 10); // Garder phrases significatives
    
    return (
      <div className="space-y-2">
        {sentences.map((sentence, idx) => {
          const trimmedSentence = sentence.trim();
          const isBullet = /^[•⚠️📏💡🎯✅❌]/.test(trimmedSentence);
          
          return (
            <p 
              key={idx} 
              className={`text-sm text-[#424242] leading-relaxed ${isBullet ? 'ml-2' : ''}`}
            >
              {trimmedSentence}
            </p>
          );
        })}
      </div>
    );
  }
  
  // Sinon afficher les lignes telles quelles
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        // Détecter si c'est une ligne de liste (commence par • ou emoji)
        const isBullet = /^[•⚠️📏💡🎯✅❌]/.test(trimmedLine);
        
        return (
          <p 
            key={idx} 
            className={`text-sm text-[#424242] leading-relaxed ${isBullet ? 'ml-2' : ''}`}
          >
            {trimmedLine}
          </p>
        );
      })}
    </div>
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
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const tabs = [
    { id: 'description' as const, label: 'Description', icon: '📝' },
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


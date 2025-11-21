'use client';

import { useState } from 'react';
import ProductImageLightbox from './ProductImageLightbox';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return image;
    } catch {
      return image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }
  
  return null;
};

interface ProductImageGalleryProps {
  images: string[];
  mainImage: string;
  productName: string;
  variantImage?: string | null; // ✅ Image du variant sélectionné
}

export default function ProductImageGallery({ images, mainImage, productName, variantImage }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // ✅ Utiliser l'image du variant si disponible, sinon les images du produit
  const displayImages = variantImage ? [variantImage, ...images] : images;

  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="space-y-2">
      {/* Image principale */}
      <div className="relative aspect-square bg-[#E8F5E8] rounded-lg overflow-hidden shadow-md group max-h-[400px]">
        {(() => {
          const imageUrl = getCleanImageUrl(displayImages[selectedImage]);
          return imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={productName}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                onClick={() => setIsLightboxOpen(true)}
                onError={(e) => {
                  console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
            </>
          ) : null;
        })()}
        <div className={`${getCleanImageUrl(displayImages[selectedImage]) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
          <svg className="h-12 w-12 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Bouton zoom (pour web) */}
        <button 
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Zoom"
        >
          <svg className="h-4 w-4 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
      </div>

      {/* Lightbox */}
      <ProductImageLightbox
        images={displayImages.filter(img => getCleanImageUrl(img)).map(img => getCleanImageUrl(img)!)}
        currentIndex={selectedImage}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        productName={productName}
      />

      {/* Miniatures */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {displayImages.map((image, index) => {
          const imageUrl = getCleanImageUrl(image);
          return (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === index
                  ? 'border-[#4CAF50] shadow-md'
                  : 'border-gray-200 hover:border-[#81C784]'
              }`}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('❌ Erreur de chargement d\'image miniature:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gray-100`}>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

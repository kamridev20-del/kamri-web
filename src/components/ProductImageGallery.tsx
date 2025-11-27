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

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ProductImageGalleryProps {
  images: string[];
  mainImage: string;
  productName: string;
  variantImage?: string | null; // ✅ Image du variant sélectionné
  videos?: string[]; // ✅ Vidéos du produit
}

export default function ProductImageGallery({ images, mainImage, productName, variantImage, videos = [] }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  console.log('🖼️ [ProductImageGallery] Props reçues:');
  console.log('   - images:', images.length);
  console.log('   - videos:', videos);
  console.log('   - videos length:', videos.length);
  
  // ✅ Combiner vidéos et images : vidéos en premier
  const allMedia: MediaItem[] = [
    ...videos.map(url => ({ type: 'video' as const, url })),
    ...(variantImage ? [{ type: 'image' as const, url: variantImage }] : []),
    ...images.map(url => ({ type: 'image' as const, url }))
  ];
  
  console.log('🖼️ [ProductImageGallery] allMedia:', allMedia.length, 'items');
  console.log('🖼️ [ProductImageGallery] Premier item:', allMedia[0]);
  
  const displayImages = allMedia.filter(m => m.type === 'image').map(m => m.url);

  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const currentMedia = allMedia[selectedImage];

  return (
    <div className="space-y-2">
      {/* Image ou Vidéo principale */}
      <div className="relative aspect-square bg-[#E8F5E8] rounded-lg overflow-hidden shadow-md group max-h-[400px]">
        {currentMedia && currentMedia.type === 'video' ? (
          /* Affichage vidéo */
          <video
            key={currentMedia.url}
            controls
            autoPlay
            className="w-full h-full object-cover"
            poster={images[0] || mainImage}
          >
            <source src={currentMedia.url} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        ) : (
          /* Affichage image */
          <>
            {(() => {
              const imageUrl = currentMedia ? getCleanImageUrl(currentMedia.url) : null;
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
            <div className={`${currentMedia && getCleanImageUrl(currentMedia.url) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
              <svg className="h-12 w-12 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </>
        )}
        
        {/* Bouton zoom (pour web) - seulement pour les images */}
        {currentMedia && currentMedia.type === 'image' && (
          <button 
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Zoom"
          >
            <svg className="h-4 w-4 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        )}
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

      {/* Miniatures - Vidéos en premier, puis images */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {allMedia.map((media, index) => {
          const isVideo = media.type === 'video';
          const imageUrl = !isVideo ? getCleanImageUrl(media.url) : null;
          
          return (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === index
                  ? 'border-[#4CAF50] shadow-md'
                  : 'border-gray-200 hover:border-[#81C784]'
              }`}
            >
              {isVideo ? (
                /* Miniature vidéo avec icône play */
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video 
                    src={media.url} 
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              ) : imageUrl ? (
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
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

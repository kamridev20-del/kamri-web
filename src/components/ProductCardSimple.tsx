import Link from 'next/link';

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

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  rating?: number;
  reviews?: number;
  badge: string | null;
  brand?: string;
  supplier?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCardSimple({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer relative">
      <Link href={`/product/${product.id}`}>
        {/* Image du produit */}
        <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative overflow-hidden">
          {(() => {
            const imageUrl = getCleanImageUrl(product.image);
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null;
          })()}
          <div className={`${getCleanImageUrl(product.image) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
            <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-[#4CAF50] text-white">
              {product.badge}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-6">
          <div className="mb-2">
            <span className="text-sm text-[#81C784] font-medium">
              {product.brand || product.supplier?.name || 'N/A'}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-2xl font-bold text-[#4CAF50]">
              {product.price.toFixed(2)}$
            </p>
            {product.originalPrice && (
              <p className="text-lg text-[#9CA3AF] line-through">
                {product.originalPrice.toFixed(2)}$
              </p>
            )}
          </div>

          <div className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-full font-bold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Voir détails
          </div>
        </div>
      </Link>
    </div>
  );
}

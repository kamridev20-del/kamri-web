'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useGeo } from '../contexts/GeoContext';
import { apiClient, Product } from '../lib/api';

// ✅ Utiliser les MÊMES interfaces que ProductInfo.tsx
interface ProductVariant {
  id: string;
  productId: string;
  cjVariantId: string | null;
  name: string | null;
  sku: string | null;
  price: number | null;
  weight: number | null;
  dimensions: string | null;
  image: string | null;
  status: string | null;
  properties: string | null;
  stock: number | null;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductWithVariants extends Product {
  productVariants?: ProductVariant[];
  variants?: string; // JSON string des variants CJ
}

interface AddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => void;
}

// Fonction pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
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

// Fonction pour extraire toutes les images
const getAllImages = (image: string | string[] | null | undefined): string[] => {
  if (!image) return [];
  
  if (typeof image === 'string') {
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed)) {
        return parsed.filter((img): img is string => typeof img === 'string' && img.startsWith('http'));
      }
      return image.startsWith('http') ? [image] : [];
    } catch {
      return image.startsWith('http') ? [image] : [];
    }
  } else if (Array.isArray(image)) {
    return image.filter((img): img is string => typeof img === 'string' && img.startsWith('http'));
  }
  
  return [];
};

export default function AddToCartModal({ product, isOpen, onClose, onAddToCart }: AddToCartModalProps) {
  const { addToCart } = useCart();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { country } = useGeo();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [isShippable, setIsShippable] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [productDetails, setProductDetails] = useState<ProductWithVariants | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Charger les détails complets du produit avec variants
  useEffect(() => {
    if (isOpen && product) {
      const loadProductDetails = async () => {
        try {
          const response = await apiClient.getProduct(product.id);
          if (response.data) {
            const fullProduct = response.data as any;
            // Gérer les deux formats de réponse possibles
            const backendData = fullProduct?.data || fullProduct;
            setProductDetails(backendData);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des détails du produit:', error);
          setProductDetails(product as ProductWithVariants);
        }
      };
      
      loadProductDetails();
    }
  }, [isOpen, product]);

  // Réinitialiser les sélections quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedColor(null);
      setSelectedSize(null);
      setSelectedVariant(null);
      setIsShippable(null);
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  // ✅ Utiliser la MÊME logique que ProductInfo.tsx pour extraire les variants
  const availableVariants = useMemo(() => {
    const productToUse = productDetails || product;
    if (!productToUse) return [];
    
    if ((productToUse as ProductWithVariants).productVariants && (productToUse as ProductWithVariants).productVariants!.length > 0) {
      return (productToUse as ProductWithVariants).productVariants!.filter(v => v.isActive !== false);
    }
    
    // Fallback : parser le champ JSON variants
    if ((productToUse as ProductWithVariants).variants && typeof (productToUse as ProductWithVariants).variants === 'string') {
      try {
        const parsed = JSON.parse((productToUse as ProductWithVariants).variants!);
        if (Array.isArray(parsed)) {
          return parsed.map((v: any, idx: number) => ({
            id: `variant-${idx}-${v.vid || idx}`,
            productId: productToUse.id,
            cjVariantId: String(v.vid || v.variantId || ''),
            name: v.variantNameEn || v.variantName || v.name || `Variant ${idx + 1}`,
            sku: v.variantSku || v.sku || '',
            price: parseFloat(v.variantSellPrice || v.variantPrice || v.price || v.sellPrice || 0),
            stock: parseInt(v.variantStock || v.stock || 0, 10),
            weight: parseFloat(v.variantWeight || v.weight || 0),
            dimensions: typeof v.variantDimensions === 'string' ? v.variantDimensions : JSON.stringify(v.variantDimensions || {}),
            image: v.variantImage || v.image || '',
            status: v.status || 'active',
            properties: typeof v.variantProperties === 'string' ? v.variantProperties : (v.variantKey || JSON.stringify(v.variantProperties || {})),
            isActive: v.isActive !== false,
            lastSyncAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error('Erreur parsing variants JSON:', e);
      }
    }
    
    return [];
  }, [productDetails, product]);

  // ✅ Utiliser la MÊME logique que ProductInfo.tsx pour extraire les couleurs
  const availableColors = useMemo(() => {
    const colorsMap = new Map<string, { name: string; image: string; count: number }>();
    
    availableVariants.forEach((variant, idx) => {
      let color = '';
      
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              if (typeof props === 'string') {
                const zoneMatch = props.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
                color = zoneMatch ? zoneMatch[1].trim() : props.split(/[-\s]/)[0];
              } else if (props.value1) {
                color = props.value1;
              } else if (props.key) {
                color = String(props.key).split(/[-\s]/)[0];
              }
            } catch {
              const zoneMatch = variant.properties.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
              if (zoneMatch) {
                color = zoneMatch[1].trim();
              } else {
                color = variant.properties.split(/[-\s]/)[0];
              }
            }
          } else {
            const props = variant.properties as any;
            if (props?.value1) {
              color = props.value1;
            } else if (props?.key) {
              color = String(props.key).split(/[-\s]/)[0];
            }
          }
        } catch (e) {
          console.warn('Erreur parsing color:', e);
        }
      }
      
      if (!color && variant.name) {
        const nameMatch = variant.name.match(/^([A-Za-z]+)/);
        if (nameMatch) {
          color = nameMatch[1];
        }
      }
      
      if (color) {
        const colorLower = color.toLowerCase();
        const knownColors = ['black', 'white', 'brown', 'gray', 'grey', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'orange', 'khaki', 'beige', 'navy', 'tan', 'burgundy', 'wine', 'ivory', 'cream', 'gold', 'silver', 'platinum'];
        
        if (knownColors.includes(colorLower)) {
          const existing = colorsMap.get(colorLower);
          if (existing) {
            existing.count++;
          } else {
            colorsMap.set(colorLower, {
              name: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
              image: variant.image || '',
              count: 1
            });
          }
        }
      }
    });
    
    return Array.from(colorsMap.values());
  }, [availableVariants]);

  // ✅ Utiliser la MÊME logique que ProductInfo.tsx pour extraire les tailles
  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    
    availableVariants.forEach(variant => {
      let size = '';
      
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              if (typeof props === 'string') {
                const sizeMatch = props.match(/[-\s]([A-Z0-9]+)$/i);
                if (sizeMatch) {
                  size = sizeMatch[1];
                }
              } else if (props.value2) {
                size = props.value2;
              } else if (props.key) {
                const sizeMatch = String(props.key).match(/[-\s]([A-Z0-9]+)$/i);
                if (sizeMatch) {
                  size = sizeMatch[1];
                }
              }
            } catch {
              const sizeMatch = variant.properties.match(/[-\s]([A-Z0-9]+)$/i);
              if (sizeMatch) {
                size = sizeMatch[1];
              }
            }
          } else {
            const props = variant.properties as any;
            if (props?.value2) {
              size = props.value2;
            } else if (props?.key) {
              const sizeMatch = String(props.key).match(/[-\s]([A-Z0-9]+)$/i);
              if (sizeMatch) {
                size = sizeMatch[1];
              }
            }
          }
        } catch (e) {
          console.warn('Erreur parsing size:', e);
        }
      }
      
      if (size) {
        sizesSet.add(size);
      }
    });
    
    return Array.from(sizesSet).sort((a, b) => {
      const sizeOrder: { [key: string]: number } = {
        'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'XXXL': 7
      };
      const aOrder = sizeOrder[a.toUpperCase()] || 999;
      const bOrder = sizeOrder[b.toUpperCase()] || 999;
      if (aOrder !== 999 && bOrder !== 999) {
        return aOrder - bOrder;
      }
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.localeCompare(b);
    });
  }, [availableVariants]);

  // ✅ Utiliser la MÊME logique que ProductInfo.tsx pour trouver le variant correspondant
  useEffect(() => {
    if (!selectedColor && !selectedSize) {
      setSelectedVariant(null);
      return;
    }
    
    const matchingVariant = availableVariants.find(variant => {
      let variantColor = '';
      let variantSize = '';
      
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              if (typeof props === 'string') {
                const zoneMatch = props.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
                variantColor = zoneMatch ? zoneMatch[1].trim() : props.split(/[-\s]/)[0];
                const sizeMatch = props.match(/[-\s]([A-Z0-9]+)$/i);
                if (sizeMatch) {
                  variantSize = sizeMatch[1];
                }
              } else {
                variantColor = props.value1 || '';
                variantSize = props.value2 || '';
              }
            } catch {
              const zoneMatch = variant.properties.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
              if (zoneMatch) {
                variantColor = zoneMatch[1].trim();
              }
              const sizeMatch = variant.properties.match(/[-\s]([A-Z0-9]+)$/i);
              if (sizeMatch) {
                variantSize = sizeMatch[1];
              }
            }
          } else {
            const props = variant.properties as any;
            variantColor = props?.value1 || '';
            variantSize = props?.value2 || '';
          }
        } catch (e) {
          console.warn('Erreur parsing variant:', e);
        }
      }
      
      // ✅ Utiliser la MÊME logique que ProductInfo.tsx
      const colorMatch = !selectedColor || variantColor.toLowerCase() === selectedColor.toLowerCase();
      const sizeMatch = !selectedSize || variantSize.toUpperCase() === selectedSize.toUpperCase();
      
      return colorMatch && sizeMatch && (variant.stock || 0) > 0;
    });
    
    setSelectedVariant(matchingVariant || null);
    
    // Debug: Log pour vérifier le matching
    if (isOpen && (selectedColor || selectedSize)) {
      console.log('🔍 [AddToCartModal] Matching variant:', {
        selectedColor,
        selectedSize,
        availableVariants: availableVariants.length,
        matchingVariant: matchingVariant?.id || null,
        matchingVariantStock: matchingVariant?.stock || null
      });
    }
  }, [selectedColor, selectedSize, availableVariants, availableColors.length, availableSizes.length, isOpen]);

  // ✅ Sélectionner automatiquement la première couleur et taille disponibles (comme ProductInfo)
  useEffect(() => {
    if (isOpen && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].name);
    }
  }, [isOpen, availableColors, selectedColor]);

  useEffect(() => {
    if (isOpen && availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [isOpen, availableSizes, selectedSize]);

  // ✅ Utiliser les MÊMES noms de variables que ProductInfo.tsx
  const displayPrice = selectedVariant?.price || (productDetails?.price || product?.price || 0);
  const displayStock = selectedVariant?.stock ?? (productDetails?.stock ?? product?.stock ?? 0);
  const displayImage = selectedVariant?.image || productDetails?.image || product?.image;

  // Debug: Log pour vérifier l'état
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 [AddToCartModal] État:', {
        availableVariants: availableVariants.length,
        availableColors: availableColors.length,
        availableSizes: availableSizes.length,
        selectedColor,
        selectedSize,
        selectedVariant: selectedVariant?.id,
        displayStock,
        isShippable,
        isCheckingShipping,
        buttonDisabled: isAddingToCart || displayStock <= 0 || isShippable === false || isCheckingShipping || (availableVariants.length > 0 && !selectedVariant)
      });
    }
  }, [isOpen, availableVariants.length, availableColors.length, availableSizes.length, selectedColor, selectedSize, selectedVariant, displayStock, isShippable, isCheckingShipping, isAddingToCart]);

  // Debug: Log pour vérifier l'état
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 [AddToCartModal] État:', {
        availableVariants: availableVariants.length,
        selectedColor,
        selectedSize,
        selectedVariant: selectedVariant?.id,
        displayStock,
        isShippable,
        isCheckingShipping
      });
    }
  }, [isOpen, availableVariants.length, selectedColor, selectedSize, selectedVariant, displayStock, isShippable, isCheckingShipping]);

  // ✅ Construire la liste des images : image du variant en premier, puis images du produit (comme ProductImageGallery)
  const allImages = useMemo(() => {
    const images: string[] = [];
    const productToUse = productDetails || product;
    
    // Si un variant est sélectionné et a une image, l'ajouter en premier
    if (selectedVariant?.image) {
      images.push(selectedVariant.image);
    }
    
    // Ajouter les images du produit (depuis product.images ou product.image)
    const productImages = (productToUse as any)?.images;
    if (productImages && Array.isArray(productImages)) {
      productImages.forEach((img: string) => {
        if (img && img !== selectedVariant?.image && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // Essayer aussi product.image (peut être un JSON array)
    const mainImage = productToUse?.image;
    if (mainImage) {
      try {
        const parsed = JSON.parse(mainImage);
        if (Array.isArray(parsed)) {
          parsed.forEach((img: string) => {
            if (img && img !== selectedVariant?.image && !images.includes(img)) {
              images.push(img);
            }
          });
        } else if (typeof parsed === 'string' && parsed !== selectedVariant?.image && !images.includes(parsed)) {
          images.push(parsed);
        }
      } catch {
        // Ce n'est pas du JSON, c'est une string simple
        if (mainImage !== selectedVariant?.image && !images.includes(mainImage)) {
          images.push(mainImage);
        }
      }
    }
    
    // Si aucune image, utiliser displayImage
    if (images.length === 0 && displayImage) {
      images.push(displayImage);
    }
    
    return images.filter(Boolean);
  }, [selectedVariant, productDetails, product, displayImage]);

  // Mettre à jour l'index de l'image quand displayImage change
  useEffect(() => {
    if (selectedVariant?.image) {
      const variantImageIndex = allImages.findIndex(img => getCleanImageUrl(img) === selectedVariant?.image);
      if (variantImageIndex >= 0) {
        setCurrentImageIndex(variantImageIndex);
      }
    }
  }, [selectedVariant, allImages]);

  // Vérifier la livraison
  useEffect(() => {
    if (isOpen && product && country?.countryCode && product.source === 'cj-dropshipping') {
      setIsCheckingShipping(true);
      apiClient.checkProductShipping(product.id, country.countryCode)
        .then(response => {
          if (response.data) {
            setIsShippable(response.data.shippable);
          } else {
            setIsShippable(true);
          }
        })
        .catch(() => {
          setIsShippable(true);
        })
        .finally(() => {
          setIsCheckingShipping(false);
        });
    } else {
      setIsShippable(true);
    }
  }, [isOpen, product, country]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast?.error?.('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    // Si des variants existent, vérifier qu'un variant est sélectionné (comme ProductInfo)
    if (availableVariants.length > 0 && !selectedVariant) {
      toast?.error?.('Veuillez sélectionner une couleur et une taille');
      return;
    }

    if (displayStock <= 0) {
      toast?.error?.('Ce produit est en rupture de stock');
      return;
    }

    if (isShippable === false) {
      toast?.error?.(`Ce produit n'est pas livrable en ${country?.countryName || 'votre région'}`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product!.id, quantity, selectedVariant?.id);
      toast?.success?.(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier !`);
      onAddToCart?.();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast?.error?.(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= displayStock) {
      setQuantity(newQuantity);
    }
  };

  if (!isOpen || !product) return null;

  const productToDisplay = productDetails || product;
  const mainImage = allImages[currentImageIndex] || displayImage || getCleanImageUrl(productToDisplay.image);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[#424242]">Ajouter au panier</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-2">
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={productToDisplay.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${mainImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                  <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              {/* Miniatures si plusieurs images */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => {
                    const imageUrl = getCleanImageUrl(img);
                    return imageUrl ? (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx ? 'border-[#4CAF50] shadow-md' : 'border-gray-200 hover:border-[#81C784]'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${productToDisplay.name} - Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </button>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">{productToDisplay.brand || productToDisplay.supplier?.name || 'KAMRI'}</p>
                <h3 className="text-lg font-bold text-[#424242] mb-2">{productToDisplay.name}</h3>
                
                {/* Prix - utilise displayPrice */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#4CAF50]">{displayPrice.toFixed(2)}$</span>
                  {productToDisplay.originalPrice && productToDisplay.originalPrice > displayPrice && (
                    <span className="text-sm text-gray-400 line-through">{productToDisplay.originalPrice.toFixed(2)}$</span>
                  )}
                  {selectedVariant && selectedVariant.sku && (
                    <span className="text-xs text-gray-500 ml-2">SKU: {selectedVariant.sku}</span>
                  )}
                </div>
              </div>

              {/* Sélection de couleur - utilise availableColors (comme ProductInfo) */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#424242] mb-1.5">Couleur</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availableColors.map((colorData) => (
                      <button
                        key={colorData.name}
                        onClick={() => setSelectedColor(colorData.name)}
                        className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
                          selectedColor === colorData.name
                            ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32] font-semibold'
                            : 'border-gray-300 hover:border-[#4CAF50] text-[#424242]'
                        }`}
                      >
                        {colorData.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélection de taille - utilise availableSizes (comme ProductInfo) */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#424242] mb-1.5">Taille</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((size) => {
                      // Vérifier si cette taille est disponible pour la couleur sélectionnée
                      const isAvailable = availableVariants.some(v => {
                        let variantColor = '';
                        let variantSize = '';
                        
                        if (v.properties) {
                          try {
                            if (typeof v.properties === 'string') {
                              try {
                                const props = JSON.parse(v.properties);
                                if (typeof props === 'string') {
                                  const zoneMatch = props.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
                                  variantColor = zoneMatch ? zoneMatch[1].trim() : props.split(/[-\s]/)[0];
                                  const sizeMatch = props.match(/[-\s]([A-Z0-9]+)$/i);
                                  if (sizeMatch) {
                                    variantSize = sizeMatch[1];
                                  }
                                } else {
                                  variantColor = props.value1 || '';
                                  variantSize = props.value2 || '';
                                }
                              } catch {
                                const zoneMatch = v.properties.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
                                if (zoneMatch) {
                                  variantColor = zoneMatch[1].trim();
                                }
                                const sizeMatch = v.properties.match(/[-\s]([A-Z0-9]+)$/i);
                                if (sizeMatch) {
                                  variantSize = sizeMatch[1];
                                }
                              }
                            } else {
                              const props = v.properties as any;
                              variantColor = props?.value1 || '';
                              variantSize = props?.value2 || '';
                            }
                          } catch (e) {
                            // Ignorer
                          }
                        }
                        
                        const colorMatch = selectedColor ? variantColor.toLowerCase() === selectedColor.toLowerCase() : true;
                        const sizeMatch = variantSize.toUpperCase() === size.toUpperCase();
                        
                        return colorMatch && sizeMatch && (v.stock || 0) > 0;
                      });
                      
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
                            selectedSize === size
                              ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32] font-semibold'
                              : isAvailable
                              ? 'border-gray-300 hover:border-[#4CAF50] text-[#424242]'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <label className="block text-sm font-semibold text-[#424242] mb-2">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= displayStock}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500">Stock disponible: {displayStock}</span>
                </div>
              </div>

              {/* Stock - utilise displayStock */}
              <div className={`flex items-center gap-2 text-sm ${displayStock > 0 ? 'text-[#4CAF50]' : 'text-red-600'}`}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  {displayStock > 0 ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
                <span className="font-medium">
                  {displayStock > 0 ? `${displayStock} en stock` : 'Rupture de stock'}
                </span>
              </div>

              {/* Info variant sélectionné */}
              {selectedVariant && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                  <p><span className="font-semibold">Variant sélectionné:</span> {selectedVariant.name || `${selectedColor} - ${selectedSize}`}</p>
                  {selectedVariant.sku && <p><span className="font-semibold">SKU:</span> {selectedVariant.sku}</p>}
                </div>
              )}

              {/* Informations supplémentaires */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                {productToDisplay.deliveryCycle && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Livraison:</span>
                    <span className="font-medium">{productToDisplay.deliveryCycle} jours</span>
                  </div>
                )}
                {productToDisplay.isFreeShipping && (
                  <div className="flex items-center gap-2 text-[#4CAF50]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                    <span>Livraison gratuite</span>
                  </div>
                )}
                {isShippable === false && (
                  <div className="text-red-500 text-sm">
                    ⚠️ Ce produit n'est pas livrable en {country?.countryName || 'votre région'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-lg font-bold text-[#424242]">
            Total: <span className="text-[#4CAF50]">{(displayPrice * quantity).toFixed(2)}$</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAddToCart}
              disabled={
                isAddingToCart || 
                displayStock <= 0 || 
                isShippable === false || 
                isCheckingShipping || 
                (availableVariants.length > 0 && !selectedVariant)
              }
              className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                isAddingToCart 
                  ? 'Ajout en cours...' 
                  : displayStock <= 0 
                    ? 'Rupture de stock' 
                    : isShippable === false
                    ? `Ce produit n'est pas livrable en ${country?.countryName || 'votre région'}`
                    : availableVariants.length > 0 && !selectedVariant
                    ? 'Veuillez sélectionner toutes les options'
                    : 'Ajouter au panier'
              }
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Ajout...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Ajouter au panier
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

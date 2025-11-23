'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useGeo } from '../contexts/GeoContext';
import { apiClient, Product } from '../lib/api';

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
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Charger les détails complets du produit avec variants
  useEffect(() => {
    if (isOpen && product) {
      const loadProductDetails = async () => {
        try {
          const response = await apiClient.getProduct(product.id);
          if (response.data) {
            const fullProduct = response.data as any;
            setProductDetails(fullProduct);
            
            // Extraire les variants
            if (fullProduct.productVariants && Array.isArray(fullProduct.productVariants)) {
              setAvailableVariants(fullProduct.productVariants.filter((v: ProductVariant) => v.isActive !== false));
            } else if (fullProduct.variants && typeof fullProduct.variants === 'string') {
              try {
                const parsed = JSON.parse(fullProduct.variants);
                if (Array.isArray(parsed)) {
                  const variants = parsed.map((v: any, idx: number) => ({
                    id: `variant-${idx}-${v.vid || idx}`,
                    productId: fullProduct.id,
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
                  }));
                  setAvailableVariants(variants);
                }
              } catch (e) {
                console.error('Erreur parsing variants:', e);
                setAvailableVariants([]);
              }
            } else {
              setAvailableVariants([]);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des détails du produit:', error);
          setProductDetails(product);
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

  // Extraire les couleurs disponibles
  const availableColors = useMemo(() => {
    const colorsMap = new Map<string, { name: string; image: string; count: number }>();
    
    availableVariants.forEach((variant) => {
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

  // Extraire les tailles disponibles
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

  // Trouver le variant correspondant à la couleur et taille sélectionnées
  useEffect(() => {
    if (availableVariants.length > 0 && (selectedColor || selectedSize)) {
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
        
        const colorMatch = selectedColor ? variantColor.toLowerCase() === selectedColor.toLowerCase() : true;
        const sizeMatch = selectedSize ? variantSize === selectedSize : true;
        
        return colorMatch && sizeMatch && (variant.stock || 0) > 0;
      });
      
      setSelectedVariant(matchingVariant || null);
    } else if (availableVariants.length === 0) {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, availableVariants]);

  // Calculer le prix et le stock affichés
  const displayPrice = useMemo(() => {
    if (selectedVariant && selectedVariant.price && selectedVariant.price > 0) {
      return selectedVariant.price;
    }
    return productDetails?.price || product?.price || 0;
  }, [selectedVariant, productDetails, product]);

  const displayStock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stock || 0;
    }
    // Si pas de variants, utiliser le stock du produit
    if (availableVariants.length === 0) {
      return productDetails?.stock || product?.stock || 0;
    }
    // Si des variants existent mais aucun n'est sélectionné, retourner 0
    return 0;
  }, [selectedVariant, productDetails, product, availableVariants.length]);

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

    // Si des variants existent, vérifier qu'un variant est sélectionné
    if (availableVariants.length > 0) {
      if (!selectedVariant) {
        if (!selectedColor && availableColors.length > 0) {
          toast?.error?.('Veuillez sélectionner une couleur');
          return;
        }
        if (!selectedSize && availableSizes.length > 0) {
          toast?.error?.('Veuillez sélectionner une taille');
          return;
        }
        toast?.error?.('Veuillez sélectionner toutes les options');
        return;
      }
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
  const allImages = getAllImages(productToDisplay.image);
  const mainImage = getCleanImageUrl(productToDisplay.image);

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
                  <Image
                    src={mainImage}
                    alt={productToDisplay.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={mainImage?.includes('cjdropshipping.com')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Miniatures si plusieurs images */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === idx ? 'border-[#4CAF50]' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${productToDisplay.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized={img?.includes('cjdropshipping.com')}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">{productToDisplay.brand || productToDisplay.supplier?.name || 'KAMRI'}</p>
                <h3 className="text-lg font-bold text-[#424242] mb-2">{productToDisplay.name}</h3>
                
                {/* Prix */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#4CAF50]">{displayPrice.toFixed(2)}$</span>
                  {productToDisplay.originalPrice && productToDisplay.originalPrice > displayPrice && (
                    <span className="text-sm text-gray-400 line-through">{productToDisplay.originalPrice.toFixed(2)}$</span>
                  )}
                </div>
              </div>

              {/* Sélection de couleur */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#424242] mb-2">
                    Couleur {selectedColor ? `: ${selectedColor}` : ''}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedColor === color.name
                            ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                            : 'border-gray-300 hover:border-[#4CAF50]'
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélection de taille */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#424242] mb-2">
                    Taille {selectedSize ? `: ${selectedSize}` : ''}
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                              variantColor = v.properties.value1 || '';
                              variantSize = v.properties.value2 || '';
                            }
                          } catch (e) {
                            // Ignorer
                          }
                        }
                        
                        const colorMatch = selectedColor ? variantColor.toLowerCase() === selectedColor.toLowerCase() : true;
                        const sizeMatch = variantSize === size;
                        
                        return colorMatch && sizeMatch && (v.stock || 0) > 0;
                      });
                      
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedSize === size
                              ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                              : isAvailable
                              ? 'border-gray-300 hover:border-[#4CAF50]'
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
              disabled={isAddingToCart || displayStock <= 0 || isShippable === false || isCheckingShipping || (availableVariants.length > 0 && !selectedVariant)}
              className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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


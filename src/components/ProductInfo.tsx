'use client';

import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useGeo } from '../contexts/GeoContext';
import { apiClient } from '../lib/api';

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

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
  };
  type?: 'mode' | 'tech';
  rating?: number;
  reviews?: number;
  badge?: string;
  brand?: string;
  supplier?: {
    name: string;
  };
  description?: string;
  sizes?: string[] | null;
  colors?: string[];
  specifications?: Record<string, string> | null;
  inStock?: boolean;
  stockCount?: number;
  stock: number;
  status: string;
  deliveryCycle?: string;
  isFreeShipping?: boolean;
  // ✅ AJOUT : Support des variants CJ
  productVariants?: ProductVariant[];
  variants?: string; // JSON string des variants CJ
}

interface ProductInfoProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant | null, image: string | null) => void;
}

export default function ProductInfo({ product, onVariantChange }: ProductInfoProps) {
  const { addToCart } = useCart();
  const toast = useToast();
  const { country } = useGeo();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isShippable, setIsShippable] = useState<boolean | null>(null);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);

  // ✅ Extraire les variants disponibles (productVariants ou variants JSON)
  const availableVariants = useMemo(() => {
    if (product.productVariants && product.productVariants.length > 0) {
      return product.productVariants.filter(v => v.isActive !== false);
    }
    
    // Fallback : parser le champ JSON variants
    if (product.variants && typeof product.variants === 'string') {
      try {
        const parsed = JSON.parse(product.variants);
        if (Array.isArray(parsed)) {
          return parsed.map((v: any, idx: number) => ({
            id: `variant-${idx}-${v.vid || idx}`,
            productId: product.id,
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
  }, [product]);

  // ✅ Extraire les couleurs uniques depuis les variants
  const availableColors = useMemo(() => {
    console.log('🔍 DEBUG: Total variants disponibles:', availableVariants.length);
    console.log('🔍 DEBUG: Premiers variants:', availableVariants.slice(0, 3));
    
    const colorsMap = new Map<string, { name: string; image: string; count: number }>();
    
    availableVariants.forEach((variant, idx) => {
      let color = '';
      
      if (idx < 2) {
        console.log(`🔍 DEBUG Variant ${idx}:`, {
          name: variant.name,
          properties: variant.properties,
          sku: variant.sku
        });
      }
      
      // Extraire depuis properties (JSON ou string)
      if (variant.properties) {
        try {
          // Si c'est déjà une string simple comme "Purple-S" ou "Black-M"
          if (typeof variant.properties === 'string') {
            // Essayer de parser comme JSON d'abord
            try {
              const props = JSON.parse(variant.properties);
              
              if (typeof props === 'string') {
                // C'était une string JSON comme '"Purple-S"'
                const zoneMatch = props.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
                color = zoneMatch ? zoneMatch[1].trim() : props.split(/[-\s]/)[0];
              } else if (props.value1) {
                color = props.value1;
              } else if (props.key) {
                color = String(props.key).split(/[-\s]/)[0];
              }
            } catch {
              // Ce n'est pas du JSON, c'est une string directe
              // Format: "Purple-S", "Black-M", "Black Zone2-S"
              const zoneMatch = variant.properties.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
              if (zoneMatch) {
                color = zoneMatch[1].trim();
              } else {
                // Fallback simple
                color = variant.properties.split(/[-\s]/)[0];
              }
            }
          } else {
            // C'est un objet
            const props = variant.properties;
            if (props.value1) {
              color = props.value1;
            } else if (props.key) {
              color = String(props.key).split(/[-\s]/)[0];
            }
          }
        } catch (e) {
          console.warn('Erreur parsing properties:', e);
        }
      }
      
      // Fallback : extraire du nom
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

  // ✅ Extraire les tailles uniques depuis les variants
  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    
    availableVariants.forEach(variant => {
      let size = '';
      
      // Extraire depuis properties
      if (variant.properties) {
        try {
          // Si c'est une string simple comme "Purple-S" ou "Black-M"
          if (typeof variant.properties === 'string') {
            // Essayer de parser comme JSON d'abord
            try {
              const props = JSON.parse(variant.properties);
              
              if (typeof props === 'string') {
                // Pattern : "Purple-S", "Black Zone2-S" → taille = "S"
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
              // Ce n'est pas du JSON, c'est une string directe
              // Format: "Purple-S", "Black-M", "Black Zone2-S"
              const sizeMatch = variant.properties.match(/[-\s]([A-Z0-9]+)$/i);
              if (sizeMatch) {
                size = sizeMatch[1];
              }
            }
          } else {
            // C'est un objet
            const props = variant.properties;
            if (props.value2) {
              size = props.value2;
            } else if (props.key) {
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
        sizesSet.add(size.toUpperCase());
      }
    });
    
    // Trier les tailles dans un ordre logique
    const sizesArray = Array.from(sizesSet);
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL', '6XL'];
    
    return sizesArray.sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Tri numérique pour les tailles comme "35", "36", etc.
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      return a.localeCompare(b);
    });
  }, [availableVariants]);

  // ✅ Sélectionner automatiquement la première couleur et taille disponibles
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      console.log('🎨 Auto-sélection de la première couleur:', availableColors[0].name);
      setSelectedColor(availableColors[0].name);
    }
  }, [availableColors]);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      console.log('📏 Auto-sélection de la première taille:', availableSizes[0]);
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes]);

  // ✅ Trouver le variant correspondant à la sélection couleur + taille
  useEffect(() => {
    console.log('🔍 Recherche variant pour:', { selectedColor, selectedSize, totalVariants: availableVariants.length });
    
    if (!selectedColor && !selectedSize) {
      setSelectedVariant(null);
      onVariantChange?.(null, null);
      return;
    }
    
    const matchingVariant = availableVariants.find(variant => {
      let variantColor = '';
      let variantSize = '';
      
      // Utiliser la MÊME logique d'extraction que pour availableColors et availableSizes
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            // Essayer de parser comme JSON d'abord
            try {
              const props = JSON.parse(variant.properties);
              
              if (typeof props === 'string') {
                // Pattern : "Purple-S", "Black Zone2-S"
                const colorMatch = props.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
                variantColor = colorMatch ? colorMatch[1].trim() : props.split(/[-\s]/)[0];
                const sizeMatch = props.match(/[-\s]([A-Z0-9]+)$/i);
                variantSize = sizeMatch ? sizeMatch[1] : '';
              } else if (props.value1 || props.value2) {
                variantColor = props.value1 || '';
                variantSize = props.value2 || '';
              } else if (props.key) {
                variantColor = String(props.key).split(/[-\s]/)[0];
                const sizeMatch = String(props.key).match(/[-\s]([A-Z0-9]+)$/i);
                variantSize = sizeMatch ? sizeMatch[1] : '';
              }
            } catch {
              // Ce n'est pas du JSON, c'est une string directe
              const colorMatch = variant.properties.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
              variantColor = colorMatch ? colorMatch[1].trim() : variant.properties.split(/[-\s]/)[0];
              const sizeMatch = variant.properties.match(/[-\s]([A-Z0-9]+)$/i);
              variantSize = sizeMatch ? sizeMatch[1] : '';
            }
          } else {
            // C'est un objet
            const props = variant.properties;
            variantColor = props.value1 || '';
            variantSize = props.value2 || '';
            if (props.key) {
              variantColor = variantColor || String(props.key).split(/[-\s]/)[0];
              const sizeMatch = String(props.key).match(/[-\s]([A-Z0-9]+)$/i);
              variantSize = variantSize || (sizeMatch ? sizeMatch[1] : '');
            }
          }
        } catch (e) {
          console.warn('Erreur matching variant:', e);
        }
      }
      
      const colorMatch = !selectedColor || variantColor.toLowerCase() === selectedColor.toLowerCase();
      const sizeMatch = !selectedSize || variantSize.toUpperCase() === selectedSize.toUpperCase();
      
      console.log(`🔍 Variant "${variant.name}": color="${variantColor}" (match: ${colorMatch}), size="${variantSize}" (match: ${sizeMatch})`);
      
      return colorMatch && sizeMatch;
    });
    
    if (matchingVariant) {
      console.log('✅ Variant trouvé:', { 
        id: matchingVariant.id, 
        color: selectedColor, 
        size: selectedSize, 
        price: matchingVariant.price, 
        stock: matchingVariant.stock 
      });
    } else {
      console.warn('⚠️ Aucun variant trouvé pour:', { selectedColor, selectedSize });
    }
    
    setSelectedVariant(matchingVariant || null);
    onVariantChange?.(matchingVariant || null, matchingVariant?.image || null);
  }, [selectedColor, selectedSize, availableVariants, onVariantChange]);

  // ✅ Calculer le prix et le stock à afficher
  const displayPrice = selectedVariant?.price || product.price;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const displayImage = selectedVariant?.image || product.image;

  // Utilisation des couleurs d'étiquettes cohérentes
  const badgeConfig = getBadgeConfig(product.badge as any);
  
  // Calcul du pourcentage de réduction pour les promos
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, displayPrice)
    : 0;

  // Vérifier la livraison au chargement et quand le variant change
  useEffect(() => {
    const checkShipping = async () => {
      if (!country?.countryCode) return;
      
      setIsCheckingShipping(true);
      try {
        const response = await apiClient.checkProductShipping(
          product.id,
          country.countryCode,
          selectedVariant?.id
        );
        if (response.data) {
          setIsShippable(response.data.shippable);
        }
      } catch (error) {
        console.error('Erreur vérification livraison:', error);
        // En cas d'erreur, considérer comme livrable (fallback)
        setIsShippable(true);
      } finally {
        setIsCheckingShipping(false);
      }
    };

    checkShipping();
  }, [product.id, country?.countryCode, selectedVariant?.id]);

  // ✅ Fonction pour ajouter au panier avec le variant sélectionné
  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    // Vérifier qu'un variant est sélectionné si des variants existent
    if (availableVariants.length > 0 && !selectedVariant) {
      toast?.error?.('Veuillez sélectionner une couleur et une taille');
      return;
    }
    
    // Vérifier le stock
    if (displayStock <= 0) {
      toast?.error?.('Ce produit est en rupture de stock');
      return;
    }
    
    // Vérifier la livraison avant d'ajouter
    if (country?.countryCode && isShippable === false) {
      toast?.error?.(`Ce produit n'est pas livrable en ${country.countryName}`);
      return;
    }
    
    setIsAddingToCart(true);
    try {
      // ✅ Envoyer le variantId si disponible
      await addToCart(product.id, quantity, selectedVariant?.id);
      toast?.success?.(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier`);
    } catch (error) {
      console.error('Erreur ajout au panier:', error);
      toast?.error?.('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Badge "Non livrable" */}
      {isShippable === false && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-semibold">Ce produit n'est pas livrable en {country?.countryName || 'votre région'}</p>
          </div>
        </div>
      )}

      {/* Badge */}
      {product.badge && badgeConfig && (
        <div 
          className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ 
            backgroundColor: badgeConfig.backgroundColor, 
            color: badgeConfig.color 
          }}
        >
          {product.badge === 'promo' && discountPercentage > 0 
            ? formatDiscountPercentage(discountPercentage)
            : `${badgeConfig.icon} ${badgeConfig.text}`
          }
        </div>
      )}

      {/* Informations de base */}
      <div>
        <p className="text-[10px] text-[#81C784] font-medium mb-1">{product.brand || product.supplier?.name || 'KAMRI'}</p>
        <h1 className="text-lg font-bold text-[#424242] mb-2">{product.name}</h1>
        
        {/* Rating */}
        {product.rating && product.reviews && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-[#81C784]">({product.reviews} avis)</span>
          </div>
        )}

        {/* Prix - utilise displayPrice du variant sélectionné */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-[#4CAF50]">{displayPrice.toFixed(2)}$</span>
          {product.originalPrice && (
            <span className="text-sm text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}$</span>
          )}
          {selectedVariant && selectedVariant.sku && (
            <span className="text-xs text-gray-500 ml-2">SKU: {selectedVariant.sku}</span>
          )}
        </div>

        {/* Description retirée - maintenant dans les onglets */}
      </div>

      {/* Couleurs - extraites des variants CJ */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#424242] mb-1.5">Couleur</h3>
          <div className="flex flex-wrap gap-1.5">
            {availableColors.map((colorData) => (
              <button
                key={colorData.name}
                onClick={() => setSelectedColor(colorData.name)}
                className={`px-2.5 py-1 text-xs rounded-full border-2 transition-all duration-200 ${
                  selectedColor === colorData.name
                    ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                    : 'border-gray-300 bg-white text-[#424242] hover:border-[#81C784]'
                }`}
              >
                {colorData.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tailles - extraites des variants CJ */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#424242] mb-1.5">Taille</h3>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[2.5rem] h-8 px-2 text-xs rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedSize === size
                    ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                    : 'border-gray-300 bg-white text-[#424242] hover:border-[#81C784]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Alerte si variant non disponible */}
      {availableVariants.length > 0 && !selectedVariant && selectedColor && selectedSize && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-start gap-2">
          <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <p className="text-xs text-yellow-800">
            La combinaison <strong>{selectedColor}</strong> + <strong>{selectedSize}</strong> n'est pas disponible. 
            Veuillez choisir une autre combinaison.
          </p>
        </div>
      )}

      {/* Spécifications (tech) */}
      {product.type === 'tech' && product.specifications && (
        <div>
          <h3 className="text-lg font-semibold text-[#424242] mb-3">Spécifications techniques</h3>
          <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-2">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-[#81C784] font-medium">{key}:</span>
                <span className="text-[#424242] font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantité */}
      <div>
        <h3 className="text-base font-semibold text-[#424242] mb-2">Quantité</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full bg-[#E8F5E8] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-[#424242] min-w-[2.5rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-full bg-[#E8F5E8] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3">
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#4CAF50] text-white hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105'
          }`}
          title={isShippable === false ? `Ce produit n'est pas livrable en ${country?.countryName || 'votre région'}` : ''}
        >
          {isCheckingShipping ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vérification...
            </>
          ) : isAddingToCart ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ajout en cours...
            </>
          ) : isShippable === false ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Non livrable
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {displayStock <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </>
          )}
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
            isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping
              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              : 'bg-white text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transform hover:scale-105'
          }`}
          title={isShippable === false ? `Ce produit n'est pas livrable en ${country?.countryName || 'votre région'}` : ''}
        >
          {isShippable === false ? 'Non livrable' : 'Acheter maintenant'}
        </button>
      </div>

      {/* Stock - utilise displayStock du variant sélectionné */}
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
    </div>
  );
}

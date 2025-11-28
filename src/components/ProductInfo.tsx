'use client';

import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useGeo } from '../contexts/GeoContext';
import { useCurrency } from '../contexts/CurrencyContext';
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

// ✅ Fonction utilitaire pour nettoyer un nom de couleur/style de toute taille
// Définie en dehors du composant pour être accessible dans les useMemo
function cleanColorNameUtil(name: string): string {
  if (!name) return '';
  let cleaned = name;
  
  // 1. Retirer toute taille numérique (30-50) avec le tiret/espace qui précède
  cleaned = cleaned.replace(/[- ]+(3[0-9]|4[0-9]|5[0])\b/g, '').trim();
  
  // 2. Retirer aussi les tirets/espaces avec nombres à la fin (pour les cas comme "Style-36")
  cleaned = cleaned.replace(/[- ]+\d+$/, '').trim();
  
  // 3. Retirer les tirets orphelins à la fin (cas comme "Style-")
  cleaned = cleaned.replace(/[- ]+$/, '').trim();
  
  // 4. Retirer toute taille numérique isolée restante (30-50)
  cleaned = cleaned.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim();
  
  // 5. Nettoyer les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned;
}

export default function ProductInfo({ product, onVariantChange }: ProductInfoProps) {
  const { addToCart } = useCart();
  const toast = useToast();
  const { country } = useGeo();
  const { formatPrice } = useCurrency();
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

  // ✅ Fonction utilitaire pour extraire le style (couleur + genre) sans la taille
  const extractStyleFromVariant = useCallback((variant: ProductVariant, hasGender: boolean): string => {
    let variantKey = '';
    let variantName = variant.name || '';
    
    // 1. Extraire variantKey depuis properties (structure backend: { key: "...", property: "...", ... })
    if (variant.properties) {
      try {
        if (typeof variant.properties === 'string') {
          try {
            const props = JSON.parse(variant.properties);
            // Le backend stocke: { key: "Deep Rose Black Women-36", property: "...", ... }
            if (typeof props === 'string') {
              variantKey = props;
            } else if (props && typeof props === 'object' && props.key) {
              variantKey = String(props.key);
            }
          } catch {
            // Si ce n'est pas du JSON, c'est peut-être directement la clé
            variantKey = variant.properties;
          }
        } else {
          // Si c'est déjà un objet
          const props = variant.properties as any;
          variantKey = props.key || '';
        }
      } catch (e) {
        console.warn('Erreur extraction variantKey:', e, variant.properties);
      }
    }
    
    // Debug: afficher la structure reçue
    if (variantKey) {
      console.log('🔍 [extractStyle] variantKey extrait:', variantKey, 'hasGender:', hasGender);
    }
    
    // 2. Si on a un variantKey avec genre, extraire le style SANS la taille
    // Structure backend: variantKey = "Deep Rose Black Women-36" ou "Dark Gray Men-36"
    if (variantKey && hasGender) {
      // Méthode principale: chercher un pattern "-36" ou " 36" à la fin et le retirer
      // Pattern: cherche un tiret ou espace suivi d'un nombre 30-50 à la fin
      const sizePattern = /[- ](3[0-9]|4[0-9]|5[0])$/;
      
      if (sizePattern.test(variantKey)) {
        // Retirer la taille à la fin (tiret/espace + nombre)
        let style = variantKey.replace(sizePattern, '').trim();
        
        // Nettoyage final: s'assurer qu'aucune taille ne reste ailleurs
        style = style.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim();
        // Nettoyer les espaces multiples
        style = style.replace(/\s+/g, ' ');
        
        if (style) {
          console.log('✅ [extractStyle] Style extrait:', style, 'depuis variantKey:', variantKey);
          return style;
        }
      }
      
      // Méthode alternative: split et vérifier la dernière partie
      const parts = variantKey.split(/[- ]+/);
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].trim();
        const isNumericSize = /^(3[0-9]|4[0-9]|5[0])$/.test(lastPart);
        
        if (isNumericSize) {
          // La dernière partie est une taille, prendre tout le reste comme style
          let style = parts.slice(0, -1).join(' ').trim();
          style = style.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim().replace(/\s+/g, ' ');
          if (style) {
            console.log('✅ [extractStyle] Style extrait (split):', style, 'depuis variantKey:', variantKey);
            return style;
          }
        }
      }
      
      // Si aucune taille n'est trouvée avec les méthodes précédentes, essayer une dernière fois
      // Peut-être que le format est différent, essayons de retirer toute séquence numérique à la fin
      const lastNumberMatch = variantKey.match(/(.+?)[- ]*(\d+)$/);
      if (lastNumberMatch) {
        const possibleSize = parseInt(lastNumberMatch[2], 10);
        if (possibleSize >= 30 && possibleSize <= 50) {
          let style = lastNumberMatch[1].trim();
          style = style.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim().replace(/\s+/g, ' ');
          if (style) {
            console.log('✅ [extractStyle] Style extrait (dernière méthode):', style, 'depuis variantKey:', variantKey);
            return style;
          }
        }
      }
      
      // Dernier recours: si on arrive ici, il n'y a probablement pas de taille
      // Mais on ne doit JAMAIS retourner le variantKey complet s'il contient un nombre qui pourrait être une taille
      const hasPotentialSize = /\d+/.test(variantKey);
      if (hasPotentialSize) {
        console.warn('⚠️ [extractStyle] VariantKey contient des nombres mais aucune taille détectée:', variantKey);
        // Retirer quand même les nombres à la fin par sécurité
        const cleaned = variantKey.replace(/[- ]*\d+$/, '').trim();
        return cleaned || variantKey; // Retourner le cleaned ou le variantKey si cleaned est vide
      }
      
      return variantKey;
    }
    
    // 3. Fallback: extraire depuis le nom du variant
    if (variantName && hasGender) {
      // Retirer la taille à la fin
      let nameToProcess = variantName.replace(/[- ]\s*(3[0-9]|4[0-9]|5[0])$/i, '').trim();
      
      // Chercher la partie avec genre
      const nameMatch = nameToProcess.match(/([A-Za-z\s]+(?:Men|Women|Man|Woman))(?:\s|$)/i);
      if (nameMatch) {
        let style = nameMatch[1].trim();
        style = style.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim().replace(/\s+/g, ' ');
        if (style) return style;
      }
      
      // Chercher par index du genre
      const nameParts = nameToProcess.split(' ');
      const genderIndex = nameParts.findIndex(p => /^(Men|Women|Man|Woman)$/i.test(p));
      if (genderIndex > 0) {
        let style = nameParts.slice(0, genderIndex + 1).join(' ');
        style = style.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim().replace(/\s+/g, ' ');
        if (style) return style;
      }
    }
    
    // 4. Si pas de genre, extraire juste la couleur depuis variantKey
    if (variantKey && !hasGender) {
      const zoneMatch = variantKey.match(/^([A-Za-z\s]+?)(?:\s*Zone\d+)?[-\s]/i);
      if (zoneMatch) {
        return zoneMatch[1].trim();
      }
      return variantKey.split(/[-\s]/)[0];
    }
    
    // 5. Dernier recours: première partie du nom
    if (variantName) {
      const nameMatch = variantName.match(/^([A-Za-z]+)/);
      if (nameMatch) {
        return nameMatch[1];
      }
    }
    
    return '';
  }, []);

  // ✅ Détecter si les variants contiennent des genres (pour afficher "Style" au lieu de "Couleur")
  const hasGenderInVariants = useMemo(() => {
    return availableVariants.some(variant => {
      let key = '';
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              if (typeof props === 'string') {
                key = props;
              } else if (props.key) {
                key = String(props.key);
              }
            } catch {
              key = variant.properties;
            }
          } else {
            const props = variant.properties as any;
            key = props.key || '';
          }
        } catch (e) {
          // Ignore
        }
      }
      return /(Men|Women|Man|Woman)/i.test(key || variant.name || '');
    });
  }, [availableVariants]);

  // ✅ Extraire les couleurs uniques depuis les variants
  const availableColors = useMemo(() => {
    console.log('🔍 DEBUG: Total variants disponibles:', availableVariants.length);
    console.log('🔍 DEBUG: Premiers variants:', availableVariants.slice(0, 3));
    
    const colorsMap = new Map<string, { name: string; image: string; count: number; variantKey?: string }>();
    
    // D'abord, vérifier s'il y a des vraies tailles
    const hasRealSizes = availableVariants.some(variant => {
      let size = '';
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              if (typeof props === 'string') {
                const sizeMatch = props.match(/[-\s]([A-Z0-9]+)$/i);
                if (sizeMatch) size = sizeMatch[1];
              } else if (props.value2) {
                size = props.value2;
              }
            } catch {
              const sizeMatch = variant.properties.match(/[-\s]([A-Z0-9]+)$/i);
              if (sizeMatch) size = sizeMatch[1];
            }
          } else {
            const props = variant.properties as any;
            if (props.value2) size = props.value2;
          }
        } catch (e) {
          // Ignore
        }
      }
      // Vérifier si c'est une vraie taille (numérique 30-50 ou lettres standard)
      if (size) {
        const upper = size.toUpperCase();
        const validSizeLetters = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL', '6XL'];
        if (validSizeLetters.includes(upper)) return true;
        const numSize = parseInt(upper, 10);
        if (!isNaN(numSize) && numSize >= 30 && numSize <= 50) return true;
      }
      return false;
    });
    
    // Si pas de vraies tailles, afficher tous les variants comme options (comme CJ)
    if (!hasRealSizes) {
      availableVariants.forEach((variant) => {
        let variantLabel = '';
        let variantKey = '';
        
        // Extraire depuis properties
        if (variant.properties) {
          try {
            if (typeof variant.properties === 'string') {
              try {
                const props = JSON.parse(variant.properties);
                if (typeof props === 'string') {
                  variantKey = props;
                  variantLabel = props;
                } else if (props.key) {
                  variantKey = String(props.key);
                  variantLabel = variantKey;
                } else if (props.value1) {
                  variantLabel = props.value1;
                }
              } catch {
                variantKey = variant.properties;
                variantLabel = variant.properties;
              }
            } else {
              const props = variant.properties as any;
              variantKey = props.key || '';
              variantLabel = variantKey || props.value1 || '';
            }
          } catch (e) {
            // Ignore
          }
        }
        
        // Fallback : utiliser le nom du variant
        if (!variantLabel && variant.name) {
          // Extraire la partie pertinente du nom (après le nom du produit)
          const nameParts = variant.name.split(' ').filter(part => 
            part.length > 0 && 
            !part.match(/^(Smoke|Removal|Air|Purification|Ashtray|Anion|Practical|Automatic|Purifier|Portable|Gadgets|For|Car)$/i)
          );
          variantLabel = nameParts.join(' ') || variant.name;
        }
        
        if (variantLabel) {
          const labelKey = variantLabel.toLowerCase().trim();
          if (!colorsMap.has(labelKey)) {
            colorsMap.set(labelKey, {
              name: variantLabel,
              image: variant.image || '',
              count: 1,
              variantKey: variantKey
            });
          }
        }
      });
      
      return Array.from(colorsMap.values());
    }
    
    // Sinon, logique normale d'extraction des couleurs/styles
    // Détecter si les variants contiennent des genres (dans ce useMemo pour éviter les problèmes de dépendances)
    const hasGender = availableVariants.some(variant => {
      let key = '';
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              if (typeof props === 'string') {
                key = props;
              } else if (props.key) {
                key = String(props.key);
              }
            } catch {
              key = variant.properties;
            }
          } else {
            const props = variant.properties as any;
            key = props.key || '';
          }
        } catch (e) {
          // Ignore
        }
      }
      return /(Men|Women|Man|Woman)/i.test(key || variant.name || '');
    });
    
    availableVariants.forEach((variant, idx) => {
      if (idx < 2) {
        console.log(`🔍 DEBUG Variant ${idx}:`, {
          name: variant.name,
          properties: variant.properties,
          sku: variant.sku
        });
      }
      
      // Utiliser la fonction utilitaire pour extraire le style
      let style = extractStyleFromVariant(variant, hasGender);
      
      // Debug: vérifier ce qui est extrait
      if (idx < 3) {
        console.log(`🔍 [availableColors] Variant ${idx}:`, {
          variantName: variant.name,
          properties: variant.properties,
          styleExtracted: style
        });
      }
      
      if (style) {
        // Utiliser la fonction utilitaire pour garantir un nettoyage complet
        let cleanStyle = cleanColorNameUtil(style);
        
        // Si le style est vide après nettoyage, skip ce variant
        if (!cleanStyle) {
          console.warn('⚠️ [availableColors] Style vide après nettoyage pour variant:', variant.name);
          return; // Skip ce variant
        }
        
        const styleKey = cleanStyle.toLowerCase().trim();
        
        // Si on a des genres, accepter tous les styles (pas seulement les couleurs connues)
        if (hasGender) {
          const existing = colorsMap.get(styleKey);
          if (existing) {
            existing.count++;
            if (idx < 3) {
              console.log(`✅ [availableColors] Style existant trouvé, count incrémenté:`, styleKey, '→', existing.name);
            }
          } else {
            // Capitaliser chaque mot du style
            const capitalizedStyle = cleanStyle.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            
            // Vérification finale absolue: s'assurer qu'aucune taille n'est présente
            if (/\b(3[0-9]|4[0-9]|5[0])\b/.test(capitalizedStyle)) {
              console.error('❌ ERREUR CRITIQUE: Style contient encore une taille après TOUS les nettoyages:', { 
                variantName: variant.name,
                properties: variant.properties,
                styleOriginal: style,
                styleCleaned: cleanStyle,
                capitalizedStyle: capitalizedStyle
              });
              // Dernier nettoyage désespéré
              const finalCleaned = capitalizedStyle.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim().replace(/\s+/g, ' ');
              if (finalCleaned) {
                colorsMap.set(styleKey, {
                  name: finalCleaned,
                  image: variant.image || '',
                  count: 1
                });
                console.log(`✅ [availableColors] Style sauvegardé (après nettoyage d'urgence):`, finalCleaned);
              }
            } else {
              // Vérification finale: s'assurer qu'aucune taille n'est présente dans capitalizedStyle
              const finalCheck = capitalizedStyle.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim().replace(/\s+/g, ' ');
              if (finalCheck !== capitalizedStyle) {
                console.warn('⚠️ [availableColors] Taille détectée dans capitalizedStyle, nettoyage final:', capitalizedStyle, '→', finalCheck);
              }
              colorsMap.set(styleKey, {
                name: finalCheck,
                image: variant.image || '',
                count: 1
              });
              if (idx < 3) {
                console.log(`✅ [availableColors] Nouveau style sauvegardé:`, styleKey, '→', finalCheck);
              }
            }
          }
        } else {
          // Sinon, filtrer par couleurs connues (comportement original)
          const colorLower = style.toLowerCase();
          const knownColors = ['black', 'white', 'brown', 'gray', 'grey', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'orange', 'khaki', 'beige', 'navy', 'tan', 'burgundy', 'wine', 'ivory', 'cream', 'gold', 'silver', 'platinum'];
          
          if (knownColors.includes(colorLower)) {
            const existing = colorsMap.get(colorLower);
            if (existing) {
              existing.count++;
            } else {
              colorsMap.set(colorLower, {
                name: style.charAt(0).toUpperCase() + style.slice(1).toLowerCase(),
                image: variant.image || '',
                count: 1
              });
            }
          }
        }
      }
    });
    
    const result = Array.from(colorsMap.values());
    
    // Debug: vérifier les noms stockés
    if (result.length > 0) {
      console.log('🔍 [availableColors] Résultat final - Noms stockés:', result.slice(0, 3).map(c => c.name));
      // Vérifier si des noms contiennent encore des tailles
      result.forEach((colorData, idx) => {
        if (/\b(3[0-9]|4[0-9]|5[0])\b/.test(colorData.name)) {
          console.error(`❌ ERREUR: availableColors[${idx}].name contient encore une taille:`, colorData.name);
        }
      });
    }
    
    return result;
  }, [availableVariants]);

  // ✅ Extraire les tailles uniques depuis les variants
  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    
    // Liste des tailles valides (lettres standard)
    const validSizeLetters = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL', '6XL'];
    
    // Fonction pour vérifier si une chaîne est une taille valide
    const isValidSize = (sizeStr: string): boolean => {
      const upper = sizeStr.toUpperCase().trim();
      const lower = upper.toLowerCase();
      
      // Exclure d'abord les couleurs communes et mots non-tailles (liste exhaustive)
      const invalidSizes = [
        'GREEN', 'BLUE', 'RED', 'BLACK', 'WHITE', 'GRAY', 'GREY', 'YELLOW', 'PINK', 'PURPLE', 'ORANGE',
        'BROWN', 'BEIGE', 'NAVY', 'MAROON', 'ROSE', 'SKY', 'STARRY', 'SQUARE', 'ROUND', 'FILTER',
        'PCS', '2PCS', '5PCS', '10PCS', 'FILTER2PCS', 'GREEN2PCS', 'GRAY2PCS', 'WHITE2PCS',
        'SET1', 'SET2', 'SET3', 'SET4', 'SET5', 'SET6', 'SET7', 'SET8', 'SET9',
        'WOMEN', 'MEN', 'KIDS', 'UNISEX', 'DEEP', 'ZONE', 'ZONE2'
      ];
      
      if (invalidSizes.includes(upper)) {
        return false;
      }
      
      // Si ça contient des mots de couleur ou des mots non-tailles, exclure
      const colorKeywords = ['green', 'blue', 'red', 'black', 'white', 'gray', 'grey', 'yellow', 'pink', 'purple', 'orange', 'brown', 'beige', 'navy', 'maroon', 'rose', 'sky', 'starry', 'deep'];
      const nonSizeKeywords = ['filter', 'pcs', 'set', 'women', 'men', 'kids', 'unisex', 'square', 'round', 'zone'];
      
      if (colorKeywords.some(keyword => lower.includes(keyword)) || 
          nonSizeKeywords.some(keyword => lower.includes(keyword))) {
        return false;
      }
      
      // Tailles lettres standard
      if (validSizeLetters.includes(upper)) {
        return true;
      }
      
      // Tailles numériques (chaussures, vêtements) : 30-50 pour chaussures
      const numSize = parseInt(upper, 10);
      if (!isNaN(numSize) && numSize >= 30 && numSize <= 50) {
        return true;
      }
      
      // Tailles numériques pour enfants/petites tailles (mais pas 0-9 seuls car trop ambigus)
      if (!isNaN(numSize) && numSize >= 10 && numSize <= 20) {
        return true;
      }
      
      // Par défaut, ne pas accepter si on n'est pas sûr que c'est une taille
      return false;
    };
    
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
                // Pour les chaussures: "Beige Maroon Women-36" → taille = "36"
                // Pour les vêtements: "Purple-S", "Black Zone2-S" → taille = "S"
                // Priorité aux tailles numériques (30-50) à la fin
                const numericSizeMatch = props.match(/[- ](3[0-9]|4[0-9]|5[0])$/i);
                if (numericSizeMatch) {
                  size = numericSizeMatch[1];
                } else {
                  // Sinon, chercher une taille lettre ou autre à la fin
                  const sizeMatch = props.match(/[- ]([A-Z0-9]+)$/i);
                  if (sizeMatch) {
                    size = sizeMatch[1];
                  }
                }
              } else if (props.value2) {
                size = props.value2;
              } else if (props.key) {
                const keyStr = String(props.key);
                // Priorité aux tailles numériques (30-50) à la fin
                const numericSizeMatch = keyStr.match(/[- ](3[0-9]|4[0-9]|5[0])$/i);
                if (numericSizeMatch) {
                  size = numericSizeMatch[1];
                } else {
                  const sizeMatch = keyStr.match(/[- ]([A-Z0-9]+)$/i);
                  if (sizeMatch) {
                    size = sizeMatch[1];
                  }
                }
              }
            } catch {
              // Ce n'est pas du JSON, c'est une string directe
              // Format: "Purple-S", "Black-M", "Beige Maroon Women-36"
              const numericSizeMatch = variant.properties.match(/[- ](3[0-9]|4[0-9]|5[0])$/i);
              if (numericSizeMatch) {
                size = numericSizeMatch[1];
              } else {
                const sizeMatch = variant.properties.match(/[- ]([A-Z0-9]+)$/i);
                if (sizeMatch) {
                  size = sizeMatch[1];
                }
              }
            }
          } else {
            // C'est un objet
            const props = variant.properties as any;
            if (props.value2) {
              size = props.value2;
            } else if (props.key) {
              const keyStr = String(props.key);
              // Priorité aux tailles numériques (30-50) à la fin
              const numericSizeMatch = keyStr.match(/[- ](3[0-9]|4[0-9]|5[0])$/i);
              if (numericSizeMatch) {
                size = numericSizeMatch[1];
              } else {
                const sizeMatch = keyStr.match(/[- ]([A-Z0-9]+)$/i);
                if (sizeMatch) {
                  size = sizeMatch[1];
                }
              }
            }
          }
        } catch (e) {
          console.warn('Erreur parsing size:', e);
        }
      }
      
      // Vérifier si c'est une taille valide avant de l'ajouter
      if (size && isValidSize(size)) {
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

  // ✅ Fonction pour nettoyer un nom de couleur/style (utilise la fonction utilitaire)
  const cleanColorName = useCallback((name: string): string => {
    return cleanColorNameUtil(name);
  }, []);

  // ✅ Sélectionner automatiquement la première couleur et taille disponibles
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      const cleanName = cleanColorName(availableColors[0].name);
      
      if (cleanName !== availableColors[0].name) {
        console.warn('⚠️ [Auto-sélection] Nom nettoyé:', availableColors[0].name, '→', cleanName);
      }
      
      console.log('🎨 Auto-sélection de la première couleur:', cleanName);
      setSelectedColor(cleanName);
    }
  }, [availableColors, cleanColorName]);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      console.log('📏 Auto-sélection de la première taille:', availableSizes[0]);
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes]);

  // ✅ Trouver le variant correspondant à la sélection couleur + taille
  useEffect(() => {
    console.log('🔍 Recherche variant pour:', { selectedColor, selectedSize, totalVariants: availableVariants.length });
    
    // ✅ Si pas de couleur ni taille, mais qu'il n'y a qu'un seul variant (ex: "Default"), le sélectionner automatiquement
    if (!selectedColor && !selectedSize) {
      if (availableVariants.length === 1) {
        const singleVariant = availableVariants[0];
        console.log('✅ Variant unique détecté, sélection automatique:', singleVariant);
        setSelectedVariant(singleVariant);
        onVariantChange?.(singleVariant, singleVariant.image);
        return;
      }
      setSelectedVariant(null);
      onVariantChange?.(null, null);
      return;
    }
    
    // ✅ APPROCHE EN DEUX PASSES : D'abord chercher un match exact, puis un fallback
    // Cela permet de gérer les produits standards (couleur + taille) et les produits non-standard
    
    // Normaliser les couleurs
    const normalizeColor = (color: string) => {
      const normalized = color.toLowerCase().trim();
      if (normalized === 'grey') return 'gray';
      if (normalized === 'gray') return 'gray';
      return normalized;
    };
    
    // Fonction pour extraire les infos d'un variant
    const extractVariantInfo = (variant: ProductVariant) => {
      let variantColor = '';
      let variantSize = '';
      let variantKey = '';
      
      if (variant.properties) {
        try {
          if (typeof variant.properties === 'string') {
            try {
              const props = JSON.parse(variant.properties);
              
              if (typeof props === 'string') {
                variantKey = props;
              } else if (props.key) {
                variantKey = String(props.key);
              } else if (props.value1) {
                variantColor = props.value1;
              }
              if (props.value2) {
                variantSize = props.value2;
              }
            } catch {
              variantKey = variant.properties;
            }
          } else {
            // TypeScript: properties peut être un objet dans certains cas
            const props = variant.properties as any;
            variantKey = props.key || '';
            variantColor = props.value1 || '';
            variantSize = props.value2 || '';
          }
        } catch (e) {
          console.warn('Erreur matching variant:', e);
        }
      }
      
      // Utiliser la fonction utilitaire pour extraire le style (cohérence avec availableColors)
      if (!variantColor) {
        variantColor = extractStyleFromVariant(variant, hasGenderInVariants);
      }
      
      // Si on n'a pas de taille depuis value2, l'extraire depuis variantKey
      if (!variantSize && variantKey) {
        // Priorité aux tailles numériques (30-50) à la fin
        const numericSizeMatch = variantKey.match(/[- ](3[0-9]|4[0-9]|5[0])$/i);
        if (numericSizeMatch) {
          variantSize = numericSizeMatch[1];
        } else {
          const sizeMatch = variantKey.match(/[- ]([A-Z0-9]+)$/i);
          variantSize = sizeMatch ? sizeMatch[1] : '';
        }
      }
      
      return { variantColor, variantSize, variantKey };
    };
    
    // Fonction pour nettoyer le selectedColor de toute taille restante
    const cleanSelectedColor = (color: string | null): string => {
      if (!color) return '';
      // Retirer toute taille numérique (30-50) du selectedColor
      let cleaned = color.replace(/\b(3[0-9]|4[0-9]|5[0])\b/g, '').trim();
      // Retirer aussi les tirets/espaces avec nombres à la fin
      cleaned = cleaned.replace(/[- ]*\d+$/, '').trim();
      // Nettoyer les espaces multiples
      cleaned = cleaned.replace(/\s+/g, ' ');
      return cleaned;
    };
    
    // Fonction pour calculer le score de matching d'un variant
    const calculateMatchScore = (variant: ProductVariant) => {
      const { variantColor, variantSize, variantKey } = extractVariantInfo(variant);
      const searchString = `${variantKey} ${variant.name || ''}`.toLowerCase();
      const variantNameLower = (variant.name || '').toLowerCase();
      
      let score = 0;
      let colorMatch = false;
      let sizeMatch = false;
      
      if (selectedColor) {
        // Nettoyer selectedColor pour retirer toute taille restante
        const cleanedSelectedColor = cleanSelectedColor(selectedColor);
        const selectedColorNormalized = normalizeColor(cleanedSelectedColor);
        const variantColorNormalized = normalizeColor(variantColor);
        const selectedColorLower = cleanedSelectedColor.toLowerCase();
        
        // Match exact du style/couleur extrait
        if (variantColorNormalized === selectedColorNormalized) {
          colorMatch = true;
          score += 10; // Score élevé pour match exact
        }
        // Match dans le variantKey (pour les chaussures: "Beige Maroon Women" dans "Beige Maroon Women-36")
        else if (variantKey.toLowerCase().includes(selectedColorLower) && 
                 selectedColorLower.length > 3) {
          colorMatch = true;
          score += 8; // Score élevé pour match dans la clé
        }
        // Match dans le nom du variant
        else if (variantNameLower.includes(selectedColorLower) && selectedColorLower.length > 3) {
          colorMatch = true;
          score += 5; // Score moyen pour match partiel
        }
        // Match dans la chaîne de recherche combinée
        else if (searchString.includes(selectedColorNormalized)) {
          colorMatch = true;
          score += 3; // Score faible pour match très partiel
        }
      } else {
        colorMatch = true; // Pas de couleur sélectionnée = match
      }
      
      if (selectedSize) {
        const selectedSizeUpper = selectedSize.toUpperCase();
        const selectedSizeLower = selectedSize.toLowerCase();
        
        // Match exact de taille
        if (variantSize.toUpperCase() === selectedSizeUpper) {
          sizeMatch = true;
          score += 10;
        } else if (searchString.includes(selectedSizeLower) || variantNameLower.includes(selectedSizeLower) || variantNameLower.includes(selectedSizeUpper.toLowerCase())) {
          sizeMatch = true;
          score += 5;
        }
      } else {
        sizeMatch = true; // Pas de taille sélectionnée = match
      }
      
      // Bonus si les deux correspondent
      if (colorMatch && sizeMatch && selectedColor && selectedSize) {
        score += 5;
      }
      
      console.log(`🔍 Variant "${variant.name}": key="${variantKey}", color="${variantColor}" (match: ${colorMatch}), size="${variantSize}" (match: ${sizeMatch}), score=${score}`);
      
      return { score, colorMatch, sizeMatch };
    };
    
    let matchingVariant: ProductVariant | null = null;
    
    if (selectedColor && selectedSize) {
      // PASS 1 : Chercher un match exact (couleur ET taille)
      matchingVariant = availableVariants.find(variant => {
        const { score, colorMatch, sizeMatch } = calculateMatchScore(variant);
        // Match exact = les deux correspondent ET score élevé
        return colorMatch && sizeMatch && score >= 15;
      }) || null;
      
      if (matchingVariant) {
        console.log('✅ Match exact trouvé:', matchingVariant.name);
      } else {
        // PASS 2 : Si pas de match exact, chercher le meilleur match partiel
        const scoredVariants = availableVariants.map(variant => ({
          variant,
          ...calculateMatchScore(variant)
        })).filter(({ colorMatch, sizeMatch }) => colorMatch || sizeMatch);
        
        // Trier par score décroissant, puis prioriser les matches de couleur
        scoredVariants.sort((a, b) => {
          // D'abord par score
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          // Si même score, prioriser celui qui a un match de couleur
          if (a.colorMatch && !b.colorMatch) return -1;
          if (b.colorMatch && !a.colorMatch) return 1;
          return 0;
        });
        
        if (scoredVariants.length > 0) {
          matchingVariant = scoredVariants[0].variant;
          console.log(`✅ Match partiel accepté (score: ${scoredVariants[0].score}, couleur: ${scoredVariants[0].colorMatch}, taille: ${scoredVariants[0].sizeMatch}):`, matchingVariant.name);
        }
      }
    } else if (selectedColor && !selectedSize) {
      // Si seulement couleur sélectionnée (produits sans vraies tailles)
      // Chercher le variant qui correspond exactement au nom sélectionné
      matchingVariant = availableVariants.find(variant => {
        const { score, colorMatch } = calculateMatchScore(variant);
        // Si le score est très élevé (20+), c'est un match exact du variant complet
        if (score >= 20) {
          return true;
        }
        // Sinon, accepter si la couleur correspond
        return colorMatch;
      }) || null;
      
      if (matchingVariant) {
        console.log('✅ Variant trouvé par couleur seule:', matchingVariant.name);
      }
    } else if (selectedSize && !selectedColor) {
      // Si seulement taille sélectionnée
      matchingVariant = availableVariants.find(variant => {
        const { sizeMatch } = calculateMatchScore(variant);
        return sizeMatch;
      }) || null;
    }
    
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
    console.log('🛒 [ProductInfo] handleAddToCart appelé');
    console.log('   - availableVariants:', availableVariants.length);
    console.log('   - selectedVariant:', selectedVariant);
    console.log('   - displayStock:', displayStock);
    console.log('   - isShippable:', isShippable);
    console.log('   - country:', country?.countryCode);
    
    if (isAddingToCart) {
      console.log('⏳ [ProductInfo] Déjà en cours d\'ajout, ignoré');
      return;
    }
    
    // Vérifier qu'un variant est sélectionné si des variants existent
    // Exception : si un seul variant existe (ex: "Default"), il est sélectionné automatiquement
    if (availableVariants.length > 1 && !selectedVariant) {
      console.log('❌ [ProductInfo] Variant non sélectionné (plusieurs variants disponibles)');
      toast?.error?.('Veuillez sélectionner une couleur et une taille');
      return;
    }
    
    // Si un seul variant existe mais n'est pas sélectionné, le sélectionner automatiquement
    if (availableVariants.length === 1 && !selectedVariant) {
      console.log('✅ [ProductInfo] Sélection automatique du variant unique');
      const singleVariant = availableVariants[0];
      setSelectedVariant(singleVariant);
      onVariantChange?.(singleVariant, singleVariant.image);
    }
    
    // Vérifier le stock
    if (displayStock <= 0) {
      console.log('❌ [ProductInfo] Stock insuffisant:', displayStock);
      toast?.error?.('Ce produit est en rupture de stock');
      return;
    }
    
    // Vérifier la livraison avant d'ajouter
    if (country?.countryCode && isShippable === false) {
      console.log('❌ [ProductInfo] Produit non livrable en', country.countryCode);
      toast?.error?.(`Ce produit n'est pas livrable en ${country.countryName}`);
      return;
    }
    
    console.log('✅ [ProductInfo] Toutes les vérifications passées, ajout au panier...');
    setIsAddingToCart(true);
    try {
      // ✅ Utiliser le variant sélectionné ou le variant unique s'il n'y en a qu'un
      const variantToUse = selectedVariant || (availableVariants.length === 1 ? availableVariants[0] : null);
      
      // ✅ Envoyer le variantId si disponible
      console.log('📤 [ProductInfo] Appel addToCart:', { productId: product.id, quantity, variantId: variantToUse?.id });
      await addToCart(product.id, quantity, variantToUse?.id);
      console.log('✅ [ProductInfo] Produit ajouté avec succès');
      toast?.success?.(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier`);
    } catch (error) {
      console.error('❌ [ProductInfo] Erreur ajout au panier:', error);
      toast?.error?.('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Badge "Non livrable" */}
      {isShippable === false && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs font-semibold">Ce produit n'est pas livrable en {country?.countryName || 'votre région'}</p>
          </div>
        </div>
      )}

      {/* ✅ ZONE 1: Badge + Titre + Rating sur même ligne */}
      <div className="flex items-center justify-between gap-2 mb-1">
        {/* Badge */}
        {product.badge && badgeConfig && (
          <div 
            className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
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
        
        {/* Rating à droite */}
        {product.rating > 0 && product.reviews > 0 && (
          <div className="flex items-center gap-1">
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
            <span className="text-[10px] text-[#81C784] font-medium">{product.rating.toFixed(1)} ({product.reviews})</span>
          </div>
        )}
      </div>

      {/* Titre */}
      <h1 className="text-base font-bold text-[#424242] leading-tight">{product.name}</h1>

      {/* ✅ ZONE 2: Card Prix + Bénéfices */}
      <div className="bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] rounded-xl p-3 border border-[#4CAF50]/20">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-[#2E7D32]">{formatPrice(displayPrice)}</span>
          {product.originalPrice && product.originalPrice > displayPrice && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FF5722] to-[#F44336]">
              -{Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#2E7D32]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Livraison gratuite</span>
        </div>
        {product.deliveryCycle && (
          <div className="flex items-center gap-1.5 text-xs text-[#616161] mt-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Arrivée: {product.deliveryCycle} jours</span>
          </div>
        )}
      </div>

      {/* ✅ Couleurs/Styles - Cards avec images */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[#424242] mb-1.5">
            {availableSizes.length === 0 ? 'Variante' : hasGenderInVariants ? 'Style' : 'Couleur'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((colorData) => (
              <button
                key={colorData.name}
                onClick={() => {
                  const cleanName = cleanColorName(colorData.name);
                  if (cleanName !== colorData.name) {
                    console.warn('⚠️ [Clic couleur] Nom nettoyé:', colorData.name, '→', cleanName);
                  }
                  setSelectedColor(cleanName);
                }}
                className={`relative flex flex-col items-center p-1.5 rounded-lg border-2 transition-all duration-200 ${
                  selectedColor === cleanColorName(colorData.name)
                    ? 'border-[#4CAF50] bg-[#E8F5E9]'
                    : 'border-gray-300 bg-white hover:border-[#81C784]'
                }`}
              >
                {colorData.image ? (
                  <img 
                    src={colorData.image} 
                    alt={colorData.name}
                    className="w-10 h-10 object-cover rounded-md mb-1"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-md mb-1"
                    style={{ backgroundColor: colorData.name.toLowerCase() }}
                  />
                )}
                <span className="text-[9px] font-medium text-gray-700">{cleanColorName(colorData.name)}</span>
                {selectedColor === cleanColorName(colorData.name) && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4CAF50] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
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

      {/* ✅ ZONE D'ACTION - Quantité intégrée + Boutons groupés */}
      <div className="space-y-2">
        {/* Quantité + Ajouter au panier */}
        <div className="flex items-stretch gap-2">
          {/* Quantité */}
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-3 py-2 text-sm font-semibold text-[#424242] min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* Ajouter au panier */}
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#4CAF50] text-white hover:bg-[#2E7D32] hover:shadow-lg'
            }`}
          >
            {isCheckingShipping || isAddingToCart ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Ajouter au panier</span>
              </>
            )}
          </button>
        </div>
        
        {/* Acheter maintenant */}
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
            isAddingToCart || displayStock <= 0 || (availableVariants.length > 0 && !selectedVariant) || isShippable === false || isCheckingShipping
              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              : 'bg-white text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white'
          }`}
        >
          {isShippable === false ? 'Non livrable' : '⚡ Acheter maintenant'}
        </button>
      </div>

      {/* ✅ Stock simplifié */}
      <div className={`flex items-center justify-center gap-1.5 text-xs ${displayStock > 0 ? 'text-[#4CAF50]' : 'text-red-600'}`}>
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          {displayStock > 0 ? (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          )}
        </svg>
        <span className="font-semibold">
          {displayStock > 0 ? 'En stock' : 'Rupture de stock'}
        </span>
      </div>
      
      {/* Info variant sélectionné */}
      {selectedVariant && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
          <p className="font-medium">{selectedVariant.name || `${selectedColor} - ${selectedSize}`}</p>
        </div>
      )}
    </div>
  );
}

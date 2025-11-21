// Utilitaires pour les étiquettes de produits avec couleurs cohérentes

export type BadgeType = 'promo' | 'top-ventes' | 'tendances' | 'nouveau';

export interface BadgeConfig {
  color: string;
  backgroundColor: string;
  text: string;
  icon: string;
}

export const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  'promo': {
    color: '#FFFFFF',
    backgroundColor: '#E53935', // Rouge vif
    text: 'PROMO',
    icon: '💸'
  },
  'top-ventes': {
    color: '#FFFFFF',
    backgroundColor: '#4CAF50', // Vert
    text: 'TOP VENTES',
    icon: '🏆'
  },
  'tendances': {
    color: '#FFFFFF',
    backgroundColor: '#9C27B0', // Violet
    text: 'TENDANCES',
    icon: '🔥'
  },
  'nouveau': {
    color: '#FFFFFF',
    backgroundColor: '#FF9800', // Jaune/Orangé
    text: 'NOUVEAU',
    icon: '🆕'
  }
};

export function getBadgeConfig(badge: BadgeType | null): BadgeConfig {
  if (!badge) {
    return {
      color: 'transparent',
      backgroundColor: 'transparent',
      text: '',
      icon: ''
    };
  }
  return BADGE_CONFIGS[badge];
}

export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function formatDiscountPercentage(percentage: number): string {
  return `-${percentage}%`;
}

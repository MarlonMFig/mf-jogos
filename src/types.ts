export type Category = 
  | 'all'
  | 'trending'
  | 'high_bonus'
  | 'fast_pix'
  | 'casino'
  | 'sports'
  | 'low_deposit';

export type PaymentMethod = 'PIX' | 'Cartão' | 'Boleto' | 'Cripto' | 'PicPay' | 'AstroPay';

export interface BettingHouse {
  id: string;
  name: string;
  logoUrl?: string;
  brandColor: string; // Hex or tailwind color class
  accentBg: string;
  rating: number; // e.g. 4.9
  reviewCount: number;
  bonusTitle: string; // e.g. "100% até R$ 500"
  bonusDescription: string; // e.g. "+ 100 Rodadas Grátis no Fortune Tiger"
  affiliateUrl: string; // The affiliate redirect link
  promoCode?: string;
  minDeposit: number; // e.g. 1, 10, 20
  minWithdrawal?: number; // e.g. 1, 10, 20
  withdrawalTime: string; // e.g. "Imediato (Pix)", "< 5 min"
  featuredTag?: string; // e.g. "🔥 Mais Popular", "⚡ Pix Instantâneo", "🏆 Melhor Bônus"
  badgeType?: 'gold' | 'emerald' | 'blue' | 'purple';
  categories: Category[];
  pros: string[];
  cons: string[];
  license: string; // e.g. "Licença Curaçao #8048/JAZ - Em conformidade com SPA/MF"
  rollover: string; // e.g. "5x em cotações mínimas de 1.70"
  featuredInPodium?: number; // 1, 2, or 3 for top podium
  podiumBadgeText?: string; // e.g. "LANÇAMENTO", "🥇 nº 1 RECOMENDADA"
  podiumBadgeStyle?: 'purple' | 'gold' | 'emerald' | 'blue';
  stepGuide?: string[];
  isVerified: boolean;
  isNew?: boolean;
}

export interface UserReview {
  id: string;
  houseId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

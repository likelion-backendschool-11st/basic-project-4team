import { useMemo } from 'react';
import { FRAUD_THRESHOLD_RATIO, MARKET_PRICE, pricingCopy, type FormVariant } from '../../data/listingForm';

export type PriceTier = 'none' | 'danger' | 'fair' | 'above';

export interface PriceFeedback {
  readonly marketPrice: number;
  readonly diffPercent: number | null;
  readonly tier: PriceTier;
  readonly badgeText: string;
  readonly isFraudRisk: boolean;
  /** Edit mode: new price is lower than the originally registered price. */
  readonly isPriceDrop: boolean;
}

export const formatWon = (n: number): string => (n > 0 ? n.toLocaleString('ko-KR') : '');
export const parseWon = (raw: string): number => parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;

/** Compares the asking price to the market price and derives the feedback badge. */
export const usePriceFeedback = (
  price: number,
  variant: FormVariant,
  originalPrice?: number,
  marketPrice: number = MARKET_PRICE,
): PriceFeedback =>
  useMemo<PriceFeedback>(() => {
    if (price <= 0) {
      return { marketPrice, diffPercent: null, tier: 'none', badgeText: '', isFraudRisk: false, isPriceDrop: false };
    }
    const diff = ((price - marketPrice) / marketPrice) * 100;
    const isFraudRisk = price < marketPrice * (1 - FRAUD_THRESHOLD_RATIO);
    const tier: PriceTier = isFraudRisk ? 'danger' : diff < 0 ? 'fair' : 'above';
    const t = pricingCopy.tiers;
    const tierText =
      tier === 'danger' ? t.danger : tier === 'above' ? t.above : variant === 'create' ? t.fairCreate : t.fairEdit;
    const pct = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    const badgeText =
      variant === 'create'
        ? `${pricingCopy.diffPrefix}${pct} ${tierText}`
        : `${pricingCopy.diffPrefix}${pct} (${tierText})`;
    return {
      marketPrice,
      diffPercent: diff,
      tier,
      badgeText,
      isFraudRisk,
      isPriceDrop: originalPrice !== undefined && price < originalPrice,
    };
  }, [price, variant, originalPrice, marketPrice]);

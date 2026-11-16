import { useMemo } from 'react';
import { FRAUD_THRESHOLD_RATIO, pricingCopy, type FormVariant } from '../../data/listingForm';

export type PriceTier = 'none' | 'danger' | 'fair' | 'above';

export interface PriceFeedback {
  readonly diffPercent: number | null;
  readonly tier: PriceTier;
  readonly badgeText: string;
  readonly isFraudRisk: boolean;
  /** Edit mode: new price is lower than the originally registered price. */
  readonly isPriceDrop: boolean;
}

export const formatWon = (n: number): string => (n > 0 ? n.toLocaleString('ko-KR') : '');
export const parseWon = (raw: string): number => parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;

/**
 * Compares the asking price to the market price (ITEM-04) and derives the feedback badge.
 * 시세가 없으면(거래 없음·불러오기 전) 비교하지 않는다.
 */
export const usePriceFeedback = (
  price: number,
  variant: FormVariant,
  marketPrice: number | null,
  lowPriceRatio: number = FRAUD_THRESHOLD_RATIO,
  originalPrice?: number,
): PriceFeedback =>
  useMemo<PriceFeedback>(() => {
    const isPriceDrop = originalPrice !== undefined && price > 0 && price < originalPrice;
    if (price <= 0 || marketPrice === null || marketPrice <= 0) {
      return { diffPercent: null, tier: 'none', badgeText: '', isFraudRisk: false, isPriceDrop };
    }
    const diff = ((price - marketPrice) / marketPrice) * 100;
    const isFraudRisk = price < marketPrice * (1 - lowPriceRatio);
    const tier: PriceTier = isFraudRisk ? 'danger' : diff < 0 ? 'fair' : 'above';
    const t = pricingCopy.tiers;
    const tierText =
      tier === 'danger' ? t.danger : tier === 'above' ? t.above : variant === 'create' ? t.fairCreate : t.fairEdit;
    const pct = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    const badgeText =
      variant === 'create'
        ? `${pricingCopy.diffPrefix}${pct} ${tierText}`
        : `${pricingCopy.diffPrefix}${pct} (${tierText})`;
    return { diffPercent: diff, tier, badgeText, isFraudRisk, isPriceDrop };
  }, [price, variant, marketPrice, lowPriceRatio, originalPrice]);

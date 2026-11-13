import React from 'react';
import { Icon } from '../common/Icon';

interface BuyerPriceInfo {
  readonly label: string;
  readonly avgLabel: string;
  readonly deltaBadge: string;
  readonly deltaNote: string;
}

interface SellerPriceInfo {
  readonly label: string;
  readonly avgPrefix: string;
  readonly avgValue: string;
  readonly deltaNote: string;
}

interface ListingPriceCalloutProps {
  readonly price: string;
  readonly currency: string;
  readonly buyer?: BuyerPriceInfo;
  readonly seller?: SellerPriceInfo;
}

/** Asking price block with market-average comparison (buyer: mint callout, seller: soft panel). */
export const ListingPriceCallout: React.FC<ListingPriceCalloutProps> = ({ price, currency, buyer, seller }) => {
  if (seller) {
    return (
      <div className="bg-canvas-soft rounded p-space-md mb-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
        <div>
          <span className="font-caption text-caption text-muted block mb-0.5">{seller.label}</span>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display-lg-mobile text-display-lg-mobile md:font-display-xl md:text-display-xl text-primary font-bold tracking-tight">
              {price}
            </span>
            <span className="font-heading-3 text-heading-3 text-ink font-bold">{currency}</span>
          </div>
        </div>
        <div className="bg-canvas p-space-xs rounded flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1 font-caption text-caption text-muted">
            <Icon className="text-[14px] text-primary" name="trending_up" />
            <span>{seller.avgPrefix}</span>
            <span className="font-ui-label text-ui-label text-ink">{seller.avgValue}</span>
          </div>
          <p className="font-micro text-micro text-primary flex items-center gap-0.5">
            <Icon className="text-[13px]" name="arrow_downward" />
            <span>{seller.deltaNote}</span>
          </p>
        </div>
      </div>
    );
  }

  if (!buyer) return null;
  return (
    <div className="bg-mint-50 border border-mint-200 rounded p-space-md my-space-sm">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs">
        <div>
          <span className="font-eyebrow text-eyebrow text-forest">{buyer.label}</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display-lg text-display-lg text-forest tracking-tight">{price}</span>
            <span className="font-heading-3 text-heading-3 text-forest">{currency}</span>
          </div>
        </div>
        <div className="sm:text-right">
          <span className="font-caption text-caption text-muted">{buyer.avgLabel}</span>
          <div className="flex items-center sm:justify-end gap-1 mt-0.5">
            {buyer.deltaBadge && (
              <span className="bg-forest text-lime-ribbon font-ui-sm text-ui-sm px-2 py-0.5 rounded font-bold">
                {buyer.deltaBadge}
              </span>
            )}
            <span className="font-caption text-caption text-primary font-bold">{buyer.deltaNote}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPriceCallout;

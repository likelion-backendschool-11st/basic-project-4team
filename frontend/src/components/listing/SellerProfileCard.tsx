import React from 'react';
import type { SellerOtherItem } from '../../data/listing';
import { SellerOtherItemCard } from './SellerOtherItemCard';

interface SellerProfile {
  readonly initial: string;
  readonly name: string;
  readonly grade: string;
  readonly badge: string;
  readonly tradesLabel: string;
  readonly trades: string;
  readonly tradesUnit: string;
  readonly otherTitle: string;
  readonly otherEmpty: string;
  readonly otherItems: readonly SellerOtherItem[];
}

interface SellerProfileCardProps {
  readonly seller: SellerProfile;
}

/** 판매자 닉네임·누적 거래 횟수와 판매자의 다른 상품 (모두 DB 값). */
export const SellerProfileCard: React.FC<SellerProfileCardProps> = ({ seller }) => (
  /* data-component="SellerProfileCard" */
  <div className="lg:col-span-5 flex flex-col">
    <div className="border border-hairline rounded p-space-md bg-canvas">
      <div className="flex items-center gap-space-sm pb-space-sm border-b border-hairline min-w-0">
        <div className="w-12 h-12 shrink-0 rounded-full bg-primary flex items-center justify-center text-on-primary font-heading-3 text-heading-3">
          {seller.initial}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-heading-4 text-heading-4 text-ink">{seller.name}</span>
            <span className="bg-lime-panel text-forest font-micro text-micro px-1.5 py-0.5 rounded font-bold border border-lime-accent">
              {seller.grade}
            </span>
          </div>
          <span className="font-caption text-caption text-muted flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-primary-container" /> {seller.badge}
          </span>
        </div>
      </div>
      <div className="flex flex-col py-space-sm border-b border-hairline bg-canvas-soft rounded my-space-sm px-space-sm">
        <span className="font-micro text-micro text-muted">{seller.tradesLabel}</span>
        <span className="font-stat-value text-stat-value text-ink mt-0.5">
          {seller.trades}
          <span className="font-body-sm text-body-sm font-normal text-muted">{seller.tradesUnit}</span>
        </span>
      </div>
      <div className="mt-space-sm">
        <span className="block font-ui-label text-ui-label text-ink mb-space-xs">{seller.otherTitle}</span>
        {seller.otherItems.length === 0 ? (
          <p className="font-caption text-caption text-muted py-space-sm">{seller.otherEmpty}</p>
        ) : (
          <div className="grid grid-cols-3 gap-space-xs">
            {seller.otherItems.map((item) => (
              <SellerOtherItemCard item={item} key={item.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default SellerProfileCard;

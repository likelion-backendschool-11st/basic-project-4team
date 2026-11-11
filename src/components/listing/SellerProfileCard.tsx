import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import type { SellerOtherItem } from '../../data/listing';
import { SellerOtherItemCard } from './SellerOtherItemCard';

interface SellerProfile {
  readonly initial: string;
  readonly name: string;
  readonly grade: string;
  readonly badge: string;
  readonly profileLabel: string;
  readonly profileTo: string;
  readonly tradesLabel: string;
  readonly trades: string;
  readonly tradesUnit: string;
  readonly ratingLabel: string;
  readonly reviewsLabel: string;
  readonly rating: string;
  readonly ratingCount: string;
  readonly otherTitle: string;
  readonly otherAllLabel: string;
  readonly otherAllTo: string;
  readonly otherItems: readonly SellerOtherItem[];
}

interface SellerProfileCardProps {
  readonly seller: SellerProfile;
}

/** Seller header, trade stats/review score and other items grid. */
export const SellerProfileCard: React.FC<SellerProfileCardProps> = ({ seller }) => (
  /* data-component="SellerProfileCard" */
  <div className="lg:col-span-5 flex flex-col">
    <div className="border border-hairline rounded p-space-md bg-canvas">
      <div className="flex items-center justify-between gap-space-xs pb-space-sm border-b border-hairline">
        <div className="flex items-center gap-space-sm min-w-0">
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
        <Link className="text-link font-ui-sm text-ui-sm hover:underline flex items-center shrink-0" to={seller.profileTo}>
          {seller.profileLabel} <Icon className="text-[16px]" name="chevron_right" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-space-sm py-space-sm border-b border-hairline bg-canvas-soft rounded my-space-sm px-space-sm">
        <div className="flex flex-col">
          <span className="font-micro text-micro text-muted">{seller.tradesLabel}</span>
          <span className="font-stat-value text-stat-value text-ink mt-0.5">
            {seller.trades}
            <span className="font-body-sm text-body-sm font-normal text-muted">{seller.tradesUnit}</span>
          </span>
        </div>
        <div className="flex flex-col border-l border-hairline pl-space-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-1">
            <span className="font-micro text-micro text-muted">{seller.ratingLabel}</span>
            <Link className="font-micro text-micro text-link hover:underline" to={`${seller.profileTo}/reviews`}>
              {seller.reviewsLabel}
            </Link>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Icon className="text-logo-lime text-[18px]" filled name="star" />
            <span className="font-stat-value text-stat-value text-ink">{seller.rating}</span>
            <span className="font-caption text-caption text-muted">{seller.ratingCount}</span>
          </div>
        </div>
      </div>

      <div className="mt-space-sm">
        <div className="flex items-center justify-between mb-space-xs">
          <span className="font-ui-label text-ui-label text-ink">{seller.otherTitle}</span>
          <Link className="font-caption text-caption text-muted hover:text-ink" to={seller.otherAllTo}>
            {seller.otherAllLabel}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {seller.otherItems.map((item) => (
            <SellerOtherItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SellerProfileCard;

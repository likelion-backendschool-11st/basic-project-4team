import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { ROUTES } from '../../data/layout';
import type { RelatedListing } from '../../data/listing';

interface RelatedListingCardProps {
  readonly item: RelatedListing;
  readonly currency?: string;
  readonly variant?: 'buyer' | 'seller';
}

/** Card in the "같은 품목의 다른 매물" carousel. */
export const RelatedListingCard: React.FC<RelatedListingCardProps> = ({ item, currency = '원', variant = 'buyer' }) => {
  const to = ROUTES.listingDetail(item.id);

  if (variant === 'seller') {
    return (
      <Link
        className="w-64 shrink-0 bg-canvas-soft rounded overflow-hidden flex flex-col justify-between hover:bg-mint-50/60 transition-colors"
        to={to}
      >
        <div className="relative w-full aspect-square bg-canvas overflow-hidden">
          <img alt={item.imageAlt} className="w-full h-full object-cover" loading="lazy" src={item.imageSrc} />
        </div>
        <div className="p-space-sm flex flex-col gap-1">
          <span className="font-caption text-caption text-muted truncate">{item.category}</span>
          <p className="font-ui-label text-ui-label text-ink line-clamp-1">{item.title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-heading-3 text-heading-3 text-ink font-bold">{item.price}</span>
            <span className="font-caption text-caption text-muted">{currency}</span>
          </div>
          <div className="flex items-center justify-between font-micro text-micro text-muted pt-2">
            <span>{item.location}</span>
            <span>{item.timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      className="min-w-[210px] max-w-[220px] shrink-0 border border-hairline rounded bg-canvas hover:border-primary-container transition-all flex flex-col"
      to={to}
    >
      <div className="aspect-square bg-canvas-soft rounded-t overflow-hidden relative">
        <img alt={item.imageAlt} className="w-full h-full object-cover" loading="lazy" src={item.imageSrc} />
      </div>
      <div className="p-space-sm flex flex-col justify-between flex-1">
        <div>
          <span className="font-caption text-caption text-ink font-bold line-clamp-1">{item.title}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-ui-label text-ui-label text-ink font-bold">{item.price}</span>
          </div>
        </div>
        <div className="mt-space-sm pt-space-xs border-t border-hairline font-micro text-micro text-muted flex flex-col gap-0.5">
          <span className="flex items-center gap-1">
            <Icon className="text-[12px]" name="location_on" />
            {item.location}
          </span>
          <div className="flex items-center justify-between text-faint">
            <span>{item.timeAgo}</span>
            <span className={`${item.conditionTone === 'muted' ? 'text-muted' : 'text-primary-container'} font-medium`}>
              {item.condition}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RelatedListingCard;

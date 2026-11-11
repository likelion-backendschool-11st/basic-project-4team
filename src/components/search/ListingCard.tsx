import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import type { Listing, ListingStatus, PriceDiffTone } from '../../data/search';
import { Icon } from '../common/Icon';

interface ListingCardProps {
  readonly listing: Listing;
  readonly wished: boolean;
  readonly onToggleWish: (id: string) => void;
  readonly wishAria: string;
  readonly currency: string;
  readonly statusLabels: Record<ListingStatus, string>;
}

const diffStyles: Record<PriceDiffTone, string> = {
  below: 'text-primary-container',
  warning: 'text-error font-bold',
  neutral: 'text-muted',
};

const statusStyles: Record<ListingStatus, { readonly text: string; readonly dot: string }> = {
  selling: { text: 'text-forest', dot: 'bg-primary-container' },
  reserved: { text: 'text-tertiary-container', dot: 'bg-tertiary' },
};

/** Marketplace listing card (image, wish toggle, title, price vs. market, status). */
export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  wished,
  onToggleWish,
  wishAria,
  currency,
  statusLabels,
}) => {
  const status = statusStyles[listing.status];
  const detailPath = ROUTES.listingDetail(listing.id);

  return (
    // data-component="ListingCard"
    <article className="bg-surface-container-lowest rounded shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
      <div className="relative w-full aspect-[4/5] bg-canvas-soft overflow-hidden">
        <Link aria-label={listing.title} to={detailPath}>
          <img
            alt={listing.imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            src={listing.imageUrl}
          />
        </Link>
        <button
          aria-label={wishAria}
          aria-pressed={wished}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-canvas/80 backdrop-blur flex items-center justify-center hover:bg-canvas transition-colors shadow-sm ${
            wished ? 'text-primary-container' : 'text-muted hover:text-primary-container'
          }`}
          onClick={() => onToggleWish(listing.id)}
          type="button"
        >
          <Icon className="text-[18px]" name="favorite" />
        </button>
      </div>
      <div className="p-space-sm flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between font-caption text-caption text-muted mb-1">
            <span>{listing.series}</span>
            <span>{listing.postedAgo}</span>
          </div>
          <h2 className="font-ui-label text-ui-label text-ink font-bold line-clamp-2 mb-2 group-hover:text-primary-container transition-colors">
            <Link to={detailPath}>{listing.title}</Link>
          </h2>
        </div>
        <div>
          {listing.cautionLabel ? (
            <div className="mb-1.5 px-1.5 py-1 bg-error-container text-on-error-container rounded font-micro text-micro flex items-center gap-1 font-bold">
              <Icon className="text-[14px]" name="warning" />
              <span>{listing.cautionLabel}</span>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="font-stat-value text-stat-value text-ink">
              {listing.price.toLocaleString('ko-KR')}
              <span className="font-ui-sm text-ui-sm font-normal ml-0.5">{currency}</span>
            </div>
            <div className={`font-ui-label text-ui-label flex items-center ${diffStyles[listing.priceDiffTone]}`}>
              {listing.priceDiff}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-hairline font-micro text-micro text-muted">
            <span className={`inline-flex items-center gap-1 font-semibold ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {statusLabels[listing.status]}
            </span>
            <span className="flex items-center gap-0.5">
              <Icon className="text-[12px] text-muted" name="favorite" /> {listing.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;

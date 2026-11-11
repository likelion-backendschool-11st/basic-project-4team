import React from 'react';
import type { Listing, ListingStatus } from '../../data/search';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  readonly listings: readonly Listing[];
  readonly isWished: (id: string) => boolean;
  readonly onToggleWish: (id: string) => void;
  readonly wishAria: string;
  readonly currency: string;
  readonly statusLabels: Record<ListingStatus, string>;
}

/** 5-column (desktop) grid of listing cards. */
export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isWished,
  onToggleWish,
  wishAria,
  currency,
  statusLabels,
}) => (
  // data-component="ProductCardGrid"
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-desktop mb-space-xxl">
    {listings.map((listing) => (
      <ListingCard
        currency={currency}
        key={listing.id}
        listing={listing}
        onToggleWish={onToggleWish}
        statusLabels={statusLabels}
        wishAria={wishAria}
        wished={isWished(listing.id)}
      />
    ))}
  </section>
);

export default ListingGrid;

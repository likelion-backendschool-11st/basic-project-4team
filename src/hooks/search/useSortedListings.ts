import { useMemo, useState } from 'react';
import type { Listing, SortKey } from '../../data/search';
import type { PriceRange } from './useSearchFilters';

const comparators: Record<SortKey, (a: Listing, b: Listing) => number> = {
  latest: (a, b) => a.postedMinutes - b.postedMinutes,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  popular: (a, b) => b.likes - a.likes,
};

/** Applies the committed price range and the active sort order to the listings. */
export const useSortedListings = (listings: readonly Listing[], range: PriceRange) => {
  const [sortKey, setSortKey] = useState<SortKey>('latest');

  const items = useMemo(
    () =>
      listings
        .filter((item) => (range.min === null || item.price >= range.min) && (range.max === null || item.price <= range.max))
        .sort(comparators[sortKey]),
    [listings, range, sortKey],
  );

  return { sortKey, setSortKey, items };
};

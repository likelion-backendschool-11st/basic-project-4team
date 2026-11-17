import { useMemo } from 'react';
import { getItemListings } from '../../api/listings';
import type { RelatedListing } from '../../data/listing';
import { toRelatedListing } from './relatedListingMapping';
import { useListingSummaries } from './useListingSummaries';

/** 캐러셀에 보여줄 최대 개수. */
const RELATED_SIZE = 10;

/** 같은 품목의 다른 매물 (ITEM-05) — 판매중, 낮은 가격순, 지금 보는 글 제외. */
export const useRelatedListings = (itemId: number, listingId: number, variant: 'buyer' | 'seller') => {
  const { items, totalCount, loading } = useListingSummaries(`${itemId}:${listingId}`, () =>
    getItemListings(itemId, { excludeListingId: listingId, status: 'selling', sort: 'priceAsc', size: RELATED_SIZE }),
  );
  const cards = useMemo<readonly RelatedListing[]>(() => {
    const now = Date.now();
    return items.map((item) => toRelatedListing(item, variant, now));
  }, [items, variant]);
  return { items: cards, totalCount, loading };
};

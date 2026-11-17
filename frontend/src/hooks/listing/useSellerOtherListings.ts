import { useMemo } from 'react';
import { getSellerListings } from '../../api/listings';
import type { SellerOtherItem } from '../../data/listing';
import { toSellerOtherItem } from './relatedListingMapping';
import { useListingSummaries } from './useListingSummaries';

/** 판매자 카드에 보여줄 미니 카드 수 (3열 한 줄). */
const SELLER_OTHER_SIZE = 3;

/** 판매자의 다른 상품 (LISTING-10) — 판매중, 최신순, 지금 보는 글 제외. totalCount는 전체 개수. */
export const useSellerOtherListings = (sellerId: number, listingId: number) => {
  const { items, totalCount, loading } = useListingSummaries(`${sellerId}:${listingId}`, () =>
    getSellerListings(sellerId, { excludeListingId: listingId, status: 'selling', size: SELLER_OTHER_SIZE }),
  );
  const cards = useMemo<readonly SellerOtherItem[]>(() => items.map(toSellerOtherItem), [items]);
  return { items: cards, totalCount, loading };
};

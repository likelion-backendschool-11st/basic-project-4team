import { useEffect, useState } from 'react';
import { getListings, type ListingSearchParams } from '../../api/listingSearch';
import type { ListingSummary } from '../../api/types';

export interface OtherListings {
  readonly items: readonly ListingSummary[];
  /** 현재 판매글을 뺀 전체 개수. */
  readonly totalCount: number;
}

const EMPTY: OtherListings = { items: [], totalCount: 0 };

/**
 * 판매글 상세 아래 "다른 매물" 목록 — LISTING-01을 판매중·예약중, 최신순으로 불러오고 현재 판매글은 뺀다.
 * filter는 { itemId } 또는 { sellerId }. 불러오기 전이거나 실패하면 빈 목록.
 */
export const useOtherListings = (
  filter: Pick<ListingSearchParams, 'itemId' | 'sellerId'>,
  excludeListingId: number,
  size: number,
): OtherListings => {
  const [result, setResult] = useState<OtherListings>(EMPTY);
  const { itemId, sellerId } = filter;

  useEffect(() => {
    let cancelled = false;
    getListings({ itemId, sellerId, excludeSold: true, sort: 'latest', size: size + 1 })
      .then((page) => {
        if (cancelled) return;
        const others = page.items.filter((listing) => listing.id !== excludeListingId);
        const includesSelf = others.length < page.items.length;
        setResult({
          items: others.slice(0, size),
          // 현재 판매글이 이번 페이지 밖에 있을 수도 있어, 목록에 있었을 때만 1을 뺀다.
          totalCount: includesSelf ? page.totalCount - 1 : page.totalCount,
        });
      })
      .catch(() => {
        if (!cancelled) setResult(EMPTY);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, sellerId, excludeListingId, size]);

  return result;
};

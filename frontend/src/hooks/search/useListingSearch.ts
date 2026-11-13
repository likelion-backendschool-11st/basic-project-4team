import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../api/client';
import { getListings, type ListingSearchParams } from '../../api/listingSearch';
import type { ListingSummary } from '../../api/types';
import { FRAUD_THRESHOLD_RATIO } from '../../data/listingForm';
import {
  categoryOptions,
  gradeFilterParams,
  paginationData,
  searchApiCopy,
  type Listing,
  type PriceDiffTone,
  type SortKey,
} from '../../data/search';
import { formatTimeAgo } from '../listing/listingViewHelpers';
import { usePagination } from './usePagination';
import type { useSearchFilters } from './useSearchFilters';

type SearchFilters = ReturnType<typeof useSearchFilters>;
type SearchStatus = 'loading' | 'success' | 'error';

const FRAUD_RATE = -FRAUD_THRESHOLD_RATIO * 100;

/** 필터 패널 상태 → LISTING-01 파라미터. */
const toSearchParams = (query: string, filters: SearchFilters, sort: SortKey): ListingSearchParams => {
  const picked = filters.grades.map((id) => gradeFilterParams[id]).filter(Boolean);
  // 둘 다 고르거나 둘 다 안 고르면 거래 방식은 제한하지 않는다.
  const tradeMethod = filters.trades.length === 1 ? (filters.trades as readonly ('delivery' | 'direct')[]) : undefined;
  return {
    q: query,
    category: categoryOptions.find((c) => c.id === filters.categoryId)?.code,
    grades: picked.flatMap((p) => p.grades ?? []),
    condition: picked.flatMap((p) => (p.condition ? [p.condition] : [])),
    minPrice: filters.appliedRange.min,
    maxPrice: filters.appliedRange.max,
    tradeMethod,
    excludeSold: filters.excludeSold,
    sort,
  };
};

/** ListingSummary → 기존 검색 카드(ListingCard) 형태. */
const toCard = (listing: ListingSummary): Listing => {
  const rate = listing.priceDiffRate;
  let tone: PriceDiffTone = 'neutral';
  if (rate !== null && rate <= FRAUD_RATE) tone = 'warning';
  else if (rate !== null && rate < 0) tone = 'below';
  return {
    id: String(listing.id),
    series: listing.item.setName ?? listing.item.name,
    postedAgo: formatTimeAgo(listing.createdAt),
    postedMinutes: Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / 60000),
    title: listing.title,
    price: listing.price,
    priceDiff: rate === null ? searchApiCopy.noMarket : searchApiCopy.priceDiff(rate),
    priceDiffTone: tone,
    cautionLabel: tone === 'warning' ? searchApiCopy.caution : undefined,
    status: listing.status,
    likes: listing.wishCount,
    wished: listing.isWished,
    imageUrl: listing.thumbnailUrl ?? '',
    imageAlt: listing.title,
  };
};

/**
 * 검색 결과(P-009)를 LISTING-01로 불러온다. 정렬·페이지·필터가 바뀌면 다시 불러오고,
 * 조건이 바뀌면 1페이지로 돌아간다.
 */
export const useListingSearch = (query: string, filters: SearchFilters) => {
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [status, setStatus] = useState<SearchStatus>('loading');
  const [items, setItems] = useState<readonly Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  // 찜 API(LISTING-08/09) 연동 전까지는 화면에서만 토글한다.
  const [toggled, setToggled] = useState<ReadonlySet<string>>(() => new Set());
  const pagination = usePagination({
    totalItems: totalCount,
    pageSize: paginationData.pageSize,
    windowSize: paginationData.windowSize,
  });
  const { page, setPage } = pagination;

  const params = useMemo(() => toSearchParams(query, filters, sortKey), [query, filters, sortKey]);
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    setPage(1);
  }, [paramsKey, setPage]);

  useEffect(() => {
    // 응답이 늦게 와도 이전 조건의 결과로 화면을 덮어쓰지 않게 한다.
    let cancelled = false;
    setStatus('loading');
    getListings({ ...params, page, size: paginationData.pageSize })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items.map(toCard));
        setTotalCount(result.totalCount);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 아직 DB에 없는 카테고리는 결과 0건으로 보여준다.
        if (err instanceof ApiError && err.code === 'CATEGORY_NOT_FOUND') {
          setItems([]);
          setTotalCount(0);
          setStatus('success');
          return;
        }
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // params는 paramsKey로 비교한다 (객체가 매 렌더 새로 만들어져도 같은 조건이면 다시 부르지 않게).
  }, [paramsKey, page]);

  const isWished = useCallback(
    (id: string) => (items.find((item) => item.id === id)?.wished ?? false) !== toggled.has(id),
    [items, toggled],
  );
  const toggleWish = useCallback((id: string) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { status, items, totalCount, sortKey, setSortKey, pagination, isWished, toggleWish };
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import { getListings, type ListingSearchParams } from '../../api/listingSearch';
import type { ListingSummary } from '../../api/types';
import { toastMessages, wishCopy } from '../../data/listing';
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
import type { ShowToast } from '../listing/useToast';
import { requestWish } from '../listing/wishRequest';
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

/** 카드 하트에 필요한 화면 쪽 동작 (로그인 팝업·토스트). */
export interface WishHandlers {
  /** 비로그인이면 false를 돌려주고 로그인 팝업을 띄운다 (useLoginGate). */
  readonly ensureLogin: () => boolean;
  /** 서버가 401을 돌려줬을 때(토큰 만료) 로그인 팝업을 띄운다. */
  readonly onLoginRequired: () => void;
  readonly showToast: ShowToast;
}

/**
 * 검색 결과(P-009)를 LISTING-01로 불러온다. 정렬·페이지·필터가 바뀌면 다시 불러오고,
 * 조건이 바뀌면 1페이지로 돌아간다.
 */
export const useListingSearch = (query: string, filters: SearchFilters, wish: WishHandlers) => {
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [status, setStatus] = useState<SearchStatus>('loading');
  const [items, setItems] = useState<readonly Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  // 응답을 기다리는 카드 id — 그동안 같은 카드의 하트 연타는 무시한다.
  const pendingWishes = useRef(new Set<string>());
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

  const isWished = useCallback((id: string) => items.find((item) => item.id === id)?.wished ?? false, [items]);

  const patchItem = useCallback((id: string, patch: Pick<Listing, 'wished' | 'likes'>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  /** 카드 하트 (LIST-02 / LIST-03). 먼저 바꿔 보여주고 응답으로 맞춘다. 실패하면 되돌린다. */
  const toggleWish = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item || pendingWishes.current.has(id) || !wish.ensureLogin()) return;
      pendingWishes.current.add(id);
      const next = !item.wished;
      patchItem(id, { wished: next, likes: Math.max(0, item.likes + (next ? 1 : -1)) });

      const outcome = await requestWish(Number(id), next);
      pendingWishes.current.delete(id);
      if (outcome.ok) {
        patchItem(id, { wished: outcome.result.isWished, likes: outcome.result.wishCount });
        wish.showToast(next ? toastMessages.wishAdded : toastMessages.wishRemoved);
        return;
      }
      if (outcome.reason === 'notFound') {
        // 삭제된 판매글은 목록에서 뺀다 (명세 4장 클라이언트 후속 처리).
        setItems((prev) => prev.filter((i) => i.id !== id));
        setTotalCount((c) => Math.max(0, c - 1));
        wish.showToast(outcome.message, wishCopy.errorIcon);
        return;
      }
      patchItem(id, { wished: item.wished, likes: item.likes });
      if (outcome.reason === 'login') wish.onLoginRequired();
      else wish.showToast(outcome.message, wishCopy.errorIcon);
    },
    [items, patchItem, wish],
  );

  return { status, items, totalCount, sortKey, setSortKey, pagination, isWished, toggleWish };
};

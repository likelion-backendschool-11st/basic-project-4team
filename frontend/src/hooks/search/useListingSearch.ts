import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import { getListings, type ListingSearchParams } from '../../api/listingSearch';
import type { ListingSummary } from '../../api/types';
import { toastMessages, wishCopy } from '../../data/listing';
import { FRAUD_THRESHOLD_RATIO } from '../../data/listingForm';
import { gradeFilterParams, paginationData, searchApiCopy, type Listing, type PriceDiffTone } from '../../data/search';
import { formatTimeAgo } from '../listing/listingViewHelpers';
import type { ShowToast } from '../listing/useToast';
import { requestWish } from '../listing/wishRequest';
import { usePagination } from './usePagination';
import type { SearchFiltersState as SearchFilters } from './useSearchFilters';
type SearchStatus = 'loading' | 'success' | 'error';

const FRAUD_RATE = -FRAUD_THRESHOLD_RATIO * 100;

/**
 * 주소의 검색 조건 → LISTING-01 파라미터.
 * 고른 카테고리에서 쓸 수 없는 필터(카드가 아니면 등급, 운동화가 아니면 사이즈)는 보내지 않는다.
 */
const toSearchParams = (
  filters: SearchFilters,
  { gradeEnabled, sizeEnabled }: FilterAvailability,
): ListingSearchParams => {
  const picked = gradeEnabled ? filters.grades.map((id) => gradeFilterParams[id]).filter(Boolean) : [];
  // 둘 다 고르거나 둘 다 안 고르면 제한하지 않는다.
  const tradeMethod = filters.trades.length === 1 ? (filters.trades as readonly ('delivery' | 'direct')[]) : undefined;
  const itemState = filters.conditions.length === 1 ? (filters.conditions as readonly ('new' | 'used')[]) : undefined;
  return {
    q: filters.q,
    category: filters.categoryCode,
    grades: picked.flatMap((p) => p.grades ?? []),
    sizes: sizeEnabled ? filters.sizes : [],
    condition: picked.flatMap((p) => (p.condition ? [p.condition] : [])),
    minPrice: filters.appliedRange.min,
    maxPrice: filters.appliedRange.max,
    tradeMethod,
    itemState,
    excludeSold: filters.excludeSold,
    sort: filters.sortKey,
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
    title: listing.title,
    price: listing.price,
    priceDiff: rate === null ? searchApiCopy.noMarket : searchApiCopy.priceDiff(rate),
    priceDiffTone: tone,
    cautionLabel: tone === 'warning' ? searchApiCopy.caution : undefined,
    status: listing.status,
    likes: listing.wishCount,
    wished: listing.isWished,
    imageUrl: listing.thumbnailUrl,
    imageAlt: listing.title,
  };
};

/** 고른 카테고리에서 쓸 수 있는 필터 (useSearchCategories). */
export interface FilterAvailability {
  readonly gradeEnabled: boolean;
  readonly sizeEnabled: boolean;
}

/** 카드 하트에 필요한 화면 쪽 동작 (로그인 팝업·토스트). */
export interface WishHandlers {
  /** 비로그인이면 false를 돌려주고 로그인 팝업을 띄운다 (useLoginGate). */
  readonly ensureLogin: () => boolean;
  /** 서버가 401을 돌려줬을 때(토큰 만료) 로그인 팝업을 띄운다. */
  readonly onLoginRequired: () => void;
  readonly showToast: ShowToast;
}

/**
 * 검색 결과(P-009)를 LISTING-01로 불러온다. 조건·정렬·페이지는 모두 주소에 있고(useSearchFilters),
 * 그 값이 바뀔 때마다 다시 불러온다.
 */
export const useListingSearch = (filters: SearchFilters, availability: FilterAvailability, wish: WishHandlers) => {
  const [status, setStatus] = useState<SearchStatus>('loading');
  const [items, setItems] = useState<readonly Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  // 응답을 기다리는 카드 id — 그동안 같은 카드의 하트 연타는 무시한다.
  const pendingWishes = useRef(new Set<string>());
  const { page, setPage } = filters;
  const pagination = usePagination({
    totalItems: totalCount,
    pageSize: paginationData.pageSize,
    windowSize: paginationData.windowSize,
    page,
    onPageChange: setPage,
  });

  const params = toSearchParams(filters, availability);
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    // 응답이 늦게 와도 이전 조건의 결과로 화면을 덮어쓰지 않게 한다.
    let cancelled = false;
    setStatus('loading');
    getListings({
      ...(JSON.parse(paramsKey) as ListingSearchParams),
      page,
      size: paginationData.pageSize,
    })
      .then((result) => {
        if (cancelled) return;
        const lastPage = Math.max(1, Math.ceil(result.totalCount / paginationData.pageSize));
        // 주소의 page가 마지막 페이지를 넘으면(글이 줄었거나 주소를 고친 경우) 마지막 페이지로 옮긴다.
        if (result.items.length === 0 && page > lastPage) {
          setPage(lastPage);
          return;
        }
        setItems(result.items.map(toCard));
        setTotalCount(result.totalCount);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 주소의 카테고리가 DB에 없으면 결과 0건으로 보여준다.
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
    // 조건은 paramsKey(문자열)로 비교한다 — 같은 조건이면 다시 부르지 않는다.
  }, [paramsKey, page, reloadToken]);

  // 페이지를 옮기면 목록 맨 위가 보이게 한다.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

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
      patchItem(id, {
        wished: next,
        likes: Math.max(0, item.likes + (next ? 1 : -1)),
      });

      const outcome = await requestWish(Number(id), next);
      pendingWishes.current.delete(id);
      if (outcome.ok) {
        patchItem(id, {
          wished: outcome.result.isWished,
          likes: outcome.result.wishCount,
        });
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

  return { status, items, totalCount, pagination, isWished, toggleWish, retry };
};

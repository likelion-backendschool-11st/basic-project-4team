import { useEffect, useState } from 'react';
import { getMarketPrices } from '../../api/market';
import { toAssetUrl } from '../../api/client';
import type { MarketItemPrice } from '../../api/types';
import { priceCardTags, type PriceCard, type PriceSortKey, priceGridSection, type ViewMode } from '../../data/market';
import { sparklinePath } from './marketFormat';

const toPriceCard = (item: MarketItemPrice): PriceCard => ({
  id: `${item.itemId}:${item.gradeKey}`,
  slug: item.slug,
  name: item.name,
  tags: priceCardTags({ key: item.gradeKey, gradingService: item.gradingService, grade: item.grade }, item.language),
  imageUrl: item.imageUrl ? toAssetUrl(item.imageUrl) : null,
  price: item.price,
  change1d: item.change1d,
  change7d: item.change7d,
  change30d: item.change30d,
  volume30d: item.tradeCount30d,
  sparkline: sparklinePath(item.sparkline, 200, 40, 5),
});

/**
 * 품목별 시세 목록 (MARKET-05) — 검색(입력 후 잠시 뒤 요청)·정렬은 서버에서, "더 보기"는 다음 페이지를 이어 붙인다.
 * 카테고리·등급·검색어·정렬이 바뀌면 1페이지부터 다시 불러온다.
 */
export const useMarketPrices = (category: string, grade: string) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortKey, setSortKey] = useState<PriceSortKey>('volume');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  // 조건(카테고리·등급·검색어·정렬)이 바뀌면 page는 따로 되돌리지 않아도 1이 된다.
  const conditionKey = [category, grade, debouncedQuery, sortKey].join('|');
  const [paging, setPaging] = useState({ key: conditionKey, page: 1 });
  const page = paging.key === conditionKey ? paging.page : 1;
  const [items, setItems] = useState<readonly PriceCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), priceGridSection.searchDelayMs);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!category) return undefined;
    let cancelled = false;
    getMarketPrices({ category, grade }, { q: debouncedQuery, sort: sortKey, page, size: priceGridSection.pageSize })
      .then((data) => {
        if (cancelled) return;
        const cards = data.items.map(toPriceCard);
        setItems((prev) => (page === 1 ? cards : [...prev, ...cards]));
        setTotalCount(data.totalCount);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [category, grade, debouncedQuery, sortKey, page]);

  return {
    query,
    setQuery,
    sortKey,
    setSortKey,
    viewMode,
    setViewMode,
    items,
    totalCount,
    error,
    shownCount: items.length,
    hasMore: items.length < totalCount,
    loadMore: () => setPaging({ key: conditionKey, page: page + 1 }),
  };
};

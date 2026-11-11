import { useMemo, useState } from 'react';
import type { PriceCard, PriceSortKey, ViewMode } from '../../data/market';

const comparators: Record<PriceSortKey, ((a: PriceCard, b: PriceCard) => number) | null> = {
  volume: null, // data order is already 거래순
  priceDesc: (a, b) => b.price - a.price,
  priceAsc: (a, b) => a.price - b.price,
  rising: (a, b) => b.change1d - a.change1d,
  falling: (a, b) => a.change1d - b.change1d,
};

export interface PriceCardListOptions {
  readonly pageSize: number;
  readonly subOptionId: string;
}

/** Search, sub-option filter, sort, grid/list view and "더 보기" for the price card grid. */
export const usePriceCardList = (cards: readonly PriceCard[], { pageSize, subOptionId }: PriceCardListOptions) => {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<PriceSortKey>('volume');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = cards.filter(
      (card) =>
        (subOptionId === 'all' || card.subOptionId === subOptionId) &&
        (q.length === 0 || card.name.toLowerCase().includes(q) || card.tags.some((t) => t.toLowerCase().includes(q))),
    );
    const compare = comparators[sortKey];
    return compare ? [...matches].sort(compare) : matches;
  }, [cards, query, sortKey, subOptionId]);

  const items = filtered.slice(0, visibleCount);

  return {
    query,
    setQuery,
    sortKey,
    setSortKey,
    viewMode,
    setViewMode,
    items,
    shownCount: items.length,
    hasMore: visibleCount < filtered.length,
    loadMore: () => setVisibleCount((n) => n + pageSize),
  };
};

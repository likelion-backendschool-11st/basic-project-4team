import { useEffect, useState } from 'react';
import { getTrendingItems } from '../../api/itemcommunity';
import { trendingSidebar, type TrendingItem } from '../../data/community';

export type TrendingStatus = 'loading' | 'ready' | 'error';

/** 토론방 "연관 품목" 순위 — GET /items/trending (최근 N일 토론글 수). */
export const useTrendingItems = () => {
  const [items, setItems] = useState<readonly TrendingItem[]>([]);
  const [status, setStatus] = useState<TrendingStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    getTrendingItems(trendingSidebar.days, trendingSidebar.limit)
      .then((list) => {
        if (cancelled) return;
        setItems(
          list.map((it, i) => ({
            id: it.slug,
            rank: i + 1,
            name: it.name,
            detail: trendingSidebar.detail(
              it.rarity ?? it.category.name,
              it.marketSummary?.latestPrice ?? null,
              it.marketSummary?.changeRate ?? 0,
            ),
            count: trendingSidebar.count(it.postCount),
          })),
        );
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, status };
};

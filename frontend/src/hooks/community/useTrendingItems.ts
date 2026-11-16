import { useEffect, useState } from 'react';
import { getTrendingItems } from '../../api/itemcommunity';
import type { TrendingItemResponse } from '../../api/types';
import { trendingSidebar, type TrendingItem } from '../../data/community';

export type TrendingStatus = 'loading' | 'ready' | 'error';

const toTrendingItem = (it: TrendingItemResponse, i: number): TrendingItem => ({
  id: it.slug,
  rank: i + 1,
  name: it.name,
  detail: trendingSidebar.detail(
    it.rarity ?? it.category.name,
    it.marketSummary?.latestPrice ?? null,
    it.marketSummary?.changeRate ?? 0,
  ),
  count: trendingSidebar.count(it.mentionCount),
  countTitle: trendingSidebar.countTitle(it.postCount, it.commentCount),
});

/**
 * 토론방 "실시간 많이 언급된 품목" — GET /items/trending (최근 24시간 글·댓글 수).
 * refreshMs마다 다시 불러온다. 탭이 숨겨져 있으면 건너뛰고, 다시 보이면 바로 갱신한다.
 * 갱신에 실패하면 직전 순위를 그대로 보여준다 (처음 불러오기에 실패했을 때만 error).
 */
export const useTrendingItems = () => {
  const [items, setItems] = useState<readonly TrendingItem[]>([]);
  const [status, setStatus] = useState<TrendingStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    let loaded = false;

    const load = () => {
      getTrendingItems(trendingSidebar.days, trendingSidebar.limit)
        .then((list) => {
          if (cancelled) return;
          loaded = true;
          setItems(list.map(toTrendingItem));
          setStatus('ready');
        })
        .catch(() => {
          if (!cancelled && !loaded) setStatus('error');
        });
    };

    load();
    const timer = window.setInterval(() => {
      if (!document.hidden) load();
    }, trendingSidebar.refreshMs);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { items, status };
};

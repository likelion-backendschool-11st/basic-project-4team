import { useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { getItemDetail } from '../../api/itemcommunity';
import type { ItemDetail } from '../../api/types';
import { defaultDiscussionItem, type DiscussionItem } from '../../data/community';
import { itemSummaryCopy } from '../../data/itemcommunity';
import { ROUTES } from '../../data/layout';

export type ItemDetailStatus = 'loading' | 'ready' | 'notFound' | 'error';

type Fallback = Pick<DiscussionItem, 'sentiment' | 'totalDiscussions'>;

/**
 * ITEM-03 응답 → 토론방 헤더용 DiscussionItem.
 * 감성 투표·토론 글 수는 board API 담당이라 아직 목 데이터(fallback)를 쓴다.
 */
const toDiscussionItem = (detail: ItemDetail, routeId: string, fallback: Fallback): DiscussionItem => {
  const summary = detail.marketSummary;
  const change = summary?.changeAmount ?? 0;
  return {
    id: routeId,
    name: detail.name,
    grade: itemSummaryCopy.gradeChip(detail.rarity, detail.category.name),
    certNo: itemSummaryCopy.subLabel(detail.setName, detail.cardNo),
    image: { src: detail.imageUrl ?? '', alt: itemSummaryCopy.imageAlt(detail.name) },
    price: summary ? itemSummaryCopy.price(summary.latestPrice) : itemSummaryCopy.noPrice,
    changePct: summary ? itemSummaryCopy.changePct(summary.changeRate) : '',
    changeAmount: summary ? itemSummaryCopy.changeAmount(change) : '',
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    categoryCode: detail.category.code,
    listingCount: detail.sellingCount,
    breadcrumbs: [
      { label: itemSummaryCopy.homeLabel, to: ROUTES.home },
      ...detail.breadcrumbs.map((c) => ({ label: c.name, to: itemSummaryCopy.categoryTo(c.code) })),
    ],
    breadcrumbCurrent: itemSummaryCopy.breadcrumbCurrent(detail.name),
    sentiment: fallback.sentiment,
    totalDiscussions: fallback.totalDiscussions,
  };
};

/** 품목 토론방 헤더 데이터 (ITEM-03). itemId는 라우트의 :id(slug 또는 숫자 id). */
export const useItemDetail = (itemId: string, fallback: Fallback = defaultDiscussionItem) => {
  const [item, setItem] = useState<DiscussionItem | null>(null);
  const [status, setStatus] = useState<ItemDetailStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setItem(null);
    getItemDetail(itemId)
      .then((detail) => {
        if (cancelled) return;
        setItem(toDiscussionItem(detail, itemId, fallback));
        setStatus('ready');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus(e instanceof ApiError && e.status === 404 ? 'notFound' : 'error');
      });
    return () => {
      cancelled = true;
    };
    // fallback은 목 데이터라 바뀌지 않는다. itemId가 바뀔 때만 다시 불러온다.
  }, [itemId]);

  return { item, status };
};

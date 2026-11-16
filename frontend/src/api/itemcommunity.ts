import { apiRequest } from './client';
import type { Grade, GradingService, ItemCondition, ItemDetail, Sentiment, SentimentDirection } from './types';

/** 시세 필터. gradingService·grade는 condition이 'graded'일 때만 보낸다. */
export interface ItemMarketFilter {
  readonly condition?: ItemCondition;
  readonly gradingService?: GradingService;
  readonly grade?: Grade;
}

function toQueryString(filter: ItemMarketFilter): string {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** 품목 상세 (ITEM-03). itemId는 숫자 id 또는 slug. 품목 토론방 헤더의 시세 요약·현재 매물 수에 쓴다. */
export const getItemDetail = (itemId: number | string, filter: ItemMarketFilter = {}): Promise<ItemDetail> =>
  apiRequest<ItemDetail>(`/items/${encodeURIComponent(String(itemId))}${toQueryString(filter)}`);

const sentimentPath = (itemId: number | string) => `/items/${encodeURIComponent(String(itemId))}/sentiments`;

/** 시세 전망 투표 현황. 로그인 상태면 오늘 내 투표(myVote)가 채워진다. */
export const getSentiment = (itemId: number | string): Promise<Sentiment> => apiRequest<Sentiment>(sentimentPath(itemId));

/** 시세 전망 투표. 로그인 필요. 품목당 하루(KST) 1회 → 이미 투표했으면 409 ALREADY_VOTED. */
export const voteSentiment = (itemId: number | string, direction: SentimentDirection): Promise<Sentiment> =>
  apiRequest<Sentiment>(sentimentPath(itemId), { method: 'POST', body: JSON.stringify({ direction }) });

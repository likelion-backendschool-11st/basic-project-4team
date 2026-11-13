import { apiRequest } from './client';
import type { Grade, GradingService, ItemCondition, ItemDetail } from './types';

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

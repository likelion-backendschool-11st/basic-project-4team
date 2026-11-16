import { apiRequest } from './client';
import type { Grade, GradingService, ItemCondition, ListingLimit, MarketPriceResponse } from './types';

export interface MarketPriceFilter {
  readonly condition?: ItemCondition;
  /** condition이 'graded'일 때만 보낸다. */
  readonly gradingService?: GradingService;
  readonly grade?: Grade;
}

/** 품목 시세 기준가 (ITEM-04) — 판매글 등록·수정 가격 피드백과 저가 경고에 쓴다. */
export const getMarketPrice = (itemId: number, filter: MarketPriceFilter): Promise<MarketPriceResponse> => {
  const params = new URLSearchParams();
  if (filter.condition) params.set('condition', filter.condition);
  if (filter.gradingService) params.set('gradingService', filter.gradingService);
  if (filter.grade) params.set('grade', filter.grade);
  const qs = params.toString();
  return apiRequest<MarketPriceResponse>(`/items/${itemId}/market-price${qs ? `?${qs}` : ''}`);
};

/** 내 신규 가입자 등록 제한 상태 (로그인 필요). */
export const getListingLimit = (): Promise<ListingLimit> => apiRequest<ListingLimit>('/users/me/listing-limit');

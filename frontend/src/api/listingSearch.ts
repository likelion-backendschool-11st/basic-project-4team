import { apiRequest } from './client';
import type { ItemCondition, ListingListResponse } from './types';

export type ListingSort = 'latest' | 'priceAsc' | 'priceDesc' | 'popular';

/** LISTING-01 검색 조건. 비어 있는 값은 보내지 않는다. */
export interface ListingSearchParams {
  readonly q?: string;
  readonly category?: string;
  readonly condition?: readonly ItemCondition[];
  /** `{그레이딩사}-{등급}` (예: PSA-10). */
  readonly grades?: readonly string[];
  readonly minPrice?: number | null;
  readonly maxPrice?: number | null;
  readonly tradeMethod?: readonly ('delivery' | 'direct')[];
  readonly excludeSold?: boolean;
  readonly sort?: ListingSort;
  readonly page?: number;
  readonly size?: number;
}

const toQueryString = (params: ListingSearchParams): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length > 0) query.set(key, value.join(','));
      return;
    }
    query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
};

/** 판매글 검색·목록 (LISTING-01). */
export const getListings = (params: ListingSearchParams): Promise<ListingListResponse> =>
  apiRequest<ListingListResponse>(`/listings${toQueryString(params)}`);

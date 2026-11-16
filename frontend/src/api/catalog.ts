import { apiRequest } from './client';
import type { CategoryNode, ItemSearchResponse } from './types';

/** 카테고리 트리 (ITEM-01). 대분류 아래 소분류가 children. */
export const getCategories = (): Promise<readonly CategoryNode[]> =>
  apiRequest<readonly CategoryNode[]>('/categories');

export interface CatalogSearchParams {
  readonly q?: string;
  /** 카테고리 code. 대분류면 하위 카테고리까지 포함. */
  readonly category?: string;
  readonly page?: number;
  readonly size?: number;
}

/** 공식 품목 검색 (ITEM-02). 판매글 등록 "공식 품목 DB 검색"에 쓴다. */
export const searchCatalogItems = ({ q, category, page, size }: CatalogSearchParams): Promise<ItemSearchResponse> => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (page !== undefined) params.set('page', String(page));
  if (size !== undefined) params.set('size', String(size));
  const qs = params.toString();
  return apiRequest<ItemSearchResponse>(`/items${qs ? `?${qs}` : ''}`);
};

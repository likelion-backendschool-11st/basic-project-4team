import { apiRequest } from './client';
import type { ItemRequest, ItemRequestPage, ItemRequestStatus } from './types';

export interface CreateItemRequestBody {
  /** 소분류 카테고리 id. */
  readonly categoryId: number;
  readonly title: string;
  readonly body: string;
  readonly referenceUrl?: string | null;
}

/**
 * 품목 등록 요청 (ITEM-06). 로그인 필요.
 * 이미 있는 품목이면 409 ITEM_ALREADY_EXISTS(details.item), 같은 요청이 대기 중이면 409 ITEM_REQUEST_DUPLICATE.
 */
export const createItemRequest = async (body: CreateItemRequestBody): Promise<ItemRequest> => {
  const { itemRequest } = await apiRequest<{ readonly itemRequest: ItemRequest }>('/item-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return itemRequest;
};

export interface MyItemRequestParams {
  readonly status?: ItemRequestStatus;
  readonly page?: number;
  readonly size?: number;
}

/** 내 품목 등록 요청 목록 (ITEM-07). 최신순. */
export const getMyItemRequests = ({ status, page, size }: MyItemRequestParams = {}): Promise<ItemRequestPage> => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page !== undefined) params.set('page', String(page));
  if (size !== undefined) params.set('size', String(size));
  const qs = params.toString();
  return apiRequest<ItemRequestPage>(`/users/me/item-requests${qs ? `?${qs}` : ''}`);
};

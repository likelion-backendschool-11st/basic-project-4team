import { apiRequest } from './client';
import type {
  AdminItemRequestPage,
  ItemRequest,
  ItemRequestPage,
  ItemRequestStatus,
  ProcessItemRequestBody,
  ProcessItemRequestResult,
} from './types';

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

/** 관리자: 요청 목록 (ITEM-08). 검토 중이면 오래된 순, 그 외 최신순. */
export const getAdminItemRequests = ({ status, page, size }: MyItemRequestParams = {}): Promise<AdminItemRequestPage> => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page !== undefined) params.set('page', String(page));
  if (size !== undefined) params.set('size', String(size));
  const qs = params.toString();
  return apiRequest<AdminItemRequestPage>(`/admin/item-requests${qs ? `?${qs}` : ''}`);
};

/**
 * 관리자: 승인·반려 (ITEM-09). 승인하면 품목이 생겨(또는 기존 품목에 연결) 바로 품목 검색에 나온다.
 * 새 품목이 기존 품목과 겹치면 409 ITEM_ALREADY_EXISTS(details.item) → itemId로 다시 승인하면 된다.
 */
export const processItemRequest = (id: number, body: ProcessItemRequestBody): Promise<ProcessItemRequestResult> =>
  apiRequest<ProcessItemRequestResult>(`/admin/item-requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

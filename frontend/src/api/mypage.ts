import { apiRequest } from './client';
import type { MyComment, MyListing, MyListingStatus, MyPost, MyProfile, MyPurchase, MySummary, PagedList } from './types';

export interface PageQuery {
  readonly page: number;
  readonly size: number;
}

const toQuery = (params: Readonly<Record<string, string | number | undefined>>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  return search.toString();
};

/** 프로필 + 활동 숫자. */
export const getMySummary = (): Promise<MySummary> => apiRequest<MySummary>('/users/me/summary');

/** 내 판매글. status가 없으면 전체. */
export const getMyListings = ({ page, size, status }: PageQuery & { readonly status?: MyListingStatus }): Promise<PagedList<MyListing>> =>
  apiRequest<PagedList<MyListing>>(`/users/me/listings?${toQuery({ page, size, status })}`);

/** 구매 내역 (내가 구매자인 거래완료 판매글). */
export const getMyPurchases = ({ page, size }: PageQuery): Promise<PagedList<MyPurchase>> =>
  apiRequest<PagedList<MyPurchase>>(`/users/me/purchases?${toQuery({ page, size })}`);

/** 내가 쓴 토론글. */
export const getMyPosts = ({ page, size }: PageQuery): Promise<PagedList<MyPost>> =>
  apiRequest<PagedList<MyPost>>(`/users/me/posts?${toQuery({ page, size })}`);

/** 내가 쓴 댓글·답글. */
export const getMyComments = ({ page, size }: PageQuery): Promise<PagedList<MyComment>> =>
  apiRequest<PagedList<MyComment>>(`/users/me/comments?${toQuery({ page, size })}`);

/** 닉네임 변경 (30일에 1번). */
export const changeMyNickname = async (nickname: string): Promise<MyProfile> => {
  const { profile } = await apiRequest<{ readonly profile: MyProfile }>('/users/me/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
  return profile;
};

/** 비밀번호 변경. */
export const changeMyPassword = (body: { readonly currentPassword: string; readonly newPassword: string }): Promise<void> =>
  apiRequest<void>('/users/me/password', { method: 'PATCH', body: JSON.stringify(body) });

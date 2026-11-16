import { apiRequest } from './client';
import { removeWish, type WishState } from './layout';

/** LIST-02 찜하기. 이미 찜한 상태여도 성공한다 (멱등). */
export const addWish = (listingId: number): Promise<WishState> =>
  apiRequest<WishState>(`/listings/${listingId}/wishes`, { method: 'POST' });

/** LIST-03 찜 해제 — 헤더 찜 사이드바(api/layout.ts)와 같은 함수를 쓴다. */
export { removeWish };

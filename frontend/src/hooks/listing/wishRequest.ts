import { ApiError } from '../../api/client';
import type { WishState } from '../../api/layout';
import { addWish, removeWish } from '../../api/wishes';
import { wishCopy } from '../../data/listing';
import { publishWishChange } from './wishSync';

/** 찜 요청 결과. 실패하면 화면이 할 일(reason)과 보여줄 문구를 함께 돌려준다. */
export type WishOutcome =
  | { readonly ok: true; readonly result: WishState }
  /** login: 로그인 팝업 · notFound: 삭제된 판매글 · message: 토스트만 */
  | { readonly ok: false; readonly reason: 'login' | 'notFound' | 'message'; readonly message: string };

/**
 * 찜하기(wished = true) 또는 찜 해제(false)를 요청한다. 에러를 던지지 않는다.
 * 에러 처리는 api-spec-all.md 4장 "클라이언트 후속 처리"를 따른다.
 * 성공하면 다른 화면(헤더 찜 숫자, 같은 판매글 카드)에도 알린다.
 */
export const requestWish = async (listingId: number, wished: boolean): Promise<WishOutcome> => {
  try {
    const result = await (wished ? addWish(listingId) : removeWish(listingId));
    publishWishChange(result);
    return { ok: true, result };
  } catch (err) {
    if (!(err instanceof ApiError)) return { ok: false, reason: 'message', message: wishCopy.failed };
    // 401: 쿠키 없음(UNAUTHORIZED)·만료(INVALID_TOKEN)
    if (err.status === 401) return { ok: false, reason: 'login', message: err.message };
    if (err.status === 404) return { ok: false, reason: 'notFound', message: wishCopy.notFound };
    // 403 CANNOT_WISH_OWN_LISTING, 409 LISTING_SOLD → 서버 문구를 그대로 보여준다.
    if (err.status === 403 || err.status === 409) return { ok: false, reason: 'message', message: err.message };
    return { ok: false, reason: 'message', message: wishCopy.failed };
  }
};

import { useCallback, useEffect, useRef, useState } from 'react';
import { toastMessages, wishCopy } from '../../data/listing';
import type { ShowToast } from './useToast';
import { requestWish } from './wishRequest';
import { subscribeWishChange } from './wishSync';

export interface UseWishlistOptions {
  readonly listingId: number;
  readonly initialCount: number;
  readonly initialWished: boolean;
  /** 비로그인이면 false를 돌려주고 로그인 팝업을 띄운다 (useLoginGate). */
  readonly ensureLogin: () => boolean;
  /** 서버가 401을 돌려줬을 때(토큰 만료) 로그인 팝업을 띄운다. */
  readonly onLoginRequired: () => void;
  readonly showToast: ShowToast;
}

/**
 * 판매글 상세의 찜 토글 (LIST-02 / LIST-03).
 * 하트를 먼저 바꿔 보여주고(낙관적 업데이트), 응답의 wishCount로 맞춘다. 실패하면 원래대로 되돌린다.
 * 다른 곳(헤더 찜 사이드바 등)에서 같은 판매글의 찜을 바꾸면 그 값으로 맞춘다.
 */
export const useWishlist = ({
  listingId,
  initialCount,
  initialWished,
  ensureLogin,
  onLoginRequired,
  showToast,
}: UseWishlistOptions) => {
  const [wished, setWished] = useState(initialWished);
  const [count, setCount] = useState(initialCount);
  // 응답 전 연타는 무시한다 — 요청 순서가 뒤섞여 하트와 숫자가 어긋나지 않게.
  const pending = useRef(false);

  useEffect(
    () =>
      subscribeWishChange((state) => {
        // 내 요청의 응답은 toggle이 직접 반영한다.
        if (state.listingId !== listingId || pending.current) return;
        setWished(state.isWished);
        setCount(state.wishCount);
      }),
    [listingId],
  );

  const toggle = useCallback(async () => {
    if (pending.current || !ensureLogin()) return;
    pending.current = true;
    const before = { wished, count };
    const next = !wished;
    setWished(next);
    setCount(Math.max(0, count + (next ? 1 : -1)));

    const outcome = await requestWish(listingId, next);
    pending.current = false;
    if (outcome.ok) {
      setWished(outcome.result.isWished);
      setCount(outcome.result.wishCount);
      showToast(next ? toastMessages.wishAdded : toastMessages.wishRemoved);
      return;
    }
    setWished(before.wished);
    setCount(before.count);
    if (outcome.reason === 'login') onLoginRequired();
    else showToast(outcome.message, wishCopy.errorIcon);
  }, [wished, count, listingId, ensureLogin, onLoginRequired, showToast]);

  return { wished, count, toggle } as const;
};

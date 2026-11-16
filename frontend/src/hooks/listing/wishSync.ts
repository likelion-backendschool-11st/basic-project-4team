import type { WishState } from '../../api/layout';

/**
 * 찜이 바뀐 것을 다른 화면에 알린다 — 판매글 상세 하트, 검색 결과 카드, 헤더 찜 숫자·사이드바가
 * 서로 다른 곳에서 찜을 바꿔도 같은 상태를 보여주게 한다 (REQ-DETAIL-004, REQ-HEADER-010).
 * 서버 응답(WishState)만 알린다 — 실패한 요청이나 낙관적 업데이트는 알리지 않는다.
 */
type Listener = (state: WishState) => void;

const listeners = new Set<Listener>();

export const publishWishChange = (state: WishState) => {
  listeners.forEach((listener) => listener(state));
};

/** 찜 변경을 받는다. 돌려받은 함수로 그만 받는다. */
export const subscribeWishChange = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

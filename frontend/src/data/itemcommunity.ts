import { ROUTES } from './layout';

/* ------------------------------------------------------------------ */
/* 품목 토론방(P-018) 헤더 — ITEM-03 응답을 화면 문구로 바꿀 때 쓰는 문구  */
/* ------------------------------------------------------------------ */

export const itemSummaryCopy = {
  homeLabel: '홈',
  breadcrumbCurrent: (name: string) => `${name} 토론방`,
  categoryTo: (code: string) => `${ROUTES.search}?category=${encodeURIComponent(code)}`,
  imageAlt: (name: string) => `${name} 대표 이미지`,
  price: (n: number) => `${n.toLocaleString('ko-KR')}원`,
  noPrice: '거래 이력 없음',
  changePct: (rate: number) => `${Math.abs(rate).toFixed(1)}%`,
  changeAmount: (n: number) => `(전일 대비 ${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n).toLocaleString('ko-KR')}원)`,
  /** 등급 칩 — 카드는 레어도, 그 외는 카테고리 이름. */
  gradeChip: (rarity: string | null, categoryName: string) => rarity ?? categoryName,
  /** 칩 옆 보조 문구 — 세트명 · 카드 번호. */
  subLabel: (setName: string | null, cardNo: string | null) => [setName, cardNo].filter(Boolean).join(' · '),
};

export const itemStatusCopy = {
  loading: '품목 정보를 불러오는 중...',
  notFound: '존재하지 않거나 숨김 처리된 품목입니다.',
  error: '품목 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

/** 비로그인 사용자가 댓글·이모지를 누르면 띄우는 팝업 문구. */
export const loginRequiredCopy = {
  icon: 'lock',
  title: '로그인이 필요합니다',
  message: '로그인하지 않으면 토론글에 댓글을 달거나 이모지를 남길 수 없습니다.',
  confirmLabel: '로그인하기',
  cancelLabel: '닫기',
};

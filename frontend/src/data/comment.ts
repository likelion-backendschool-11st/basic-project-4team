import type { ReportReason } from '../api/types';

/* ------------------------------------------------------------------ */
/* 토론글 댓글 (피드 카드 아래로 펼치는 댓글 영역)                        */
/* ------------------------------------------------------------------ */

export const COMMENT_PAGE_SIZE = 10;
export const COMMENT_BODY_MAX = 500;

export const commentCopy = {
  expandIcon: 'expand_more',
  collapseIcon: 'expand_less',
  loading: '댓글을 불러오는 중...',
  empty: '아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.',
  loadError: '댓글을 불러오지 못했습니다.',
  retry: '다시 시도',
  moreComments: '댓글 더보기',
  moreReplies: (n: number) => `답글 ${n}개 더보기`,
  replyLabel: '답글',
  deleteLabel: '삭제',
  deleteConfirm: '댓글을 삭제할까요?',
  deletedBody: '삭제된 댓글입니다.',
  edited: '(수정됨)',
  placeholder: '댓글을 입력하세요. (최대 500자)',
  replyPlaceholder: (nickname: string) => `${nickname}님에게 답글 남기기`,
  submitLabel: '등록',
  cancelLabel: '취소',
  submitError: '댓글을 등록하지 못했습니다.',
  deleteError: '댓글을 삭제하지 못했습니다.',
  likeError: '좋아요를 처리하지 못했습니다.',
  moreMenuLabel: '댓글 더보기 메뉴',
  loginPrompt: '로그인하면 댓글을 남길 수 있습니다.',
  loginLabel: '로그인',
};

/** 댓글 작성자 배지 코드 → 화면 문구. */
export const commentBadgeLabel: Record<string, string> = {
  ITEM_OWNER: '보유자',
  TRADE_VERIFIED: '거래 인증',
};

/** 댓글 좋아요 버튼 (Material Symbols). */
export const commentLikeCopy = {
  icon: 'favorite',
  label: '좋아요',
  ariaLabel: (n: number, liked: boolean) => `좋아요 ${n}개${liked ? ', 누름' : ''}`,
};

/** 댓글 "⋮" 메뉴 — 내 댓글은 삭제, 남의 댓글은 신고. */
export const commentMenu = {
  mine: [{ key: 'delete', icon: 'delete', label: '삭제', danger: true }],
  others: [{ key: 'report', icon: 'flag', label: '신고하기', danger: true }],
};

export const REPORT_DETAIL_MAX = 500;

export const reportCopy = {
  title: '신고하기',
  description: '신고 사유를 선택해 주세요. 접수된 신고는 운영팀이 검토합니다.',
  reasons: [
    { value: 'fraud', label: '사기·허위 시세' },
    { value: 'spam', label: '도배·광고' },
    { value: 'abuse', label: '욕설·비방' },
    { value: 'inappropriate', label: '부적절한 내용' },
    { value: 'etc', label: '기타' },
  ] as readonly { readonly value: ReportReason; readonly label: string }[],
  detailPlaceholder: '상세 내용을 입력해 주세요. (기타 선택 시 필수, 최대 500자)',
  submitLabel: '신고하기',
  cancelLabel: '취소',
  done: '신고가 접수되었습니다.',
  submitError: '신고하지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

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

/** 내 댓글 "⋮" 메뉴. */
export const commentMenu = {
  mine: [{ key: 'delete', icon: 'delete', label: '삭제', danger: true }],
};

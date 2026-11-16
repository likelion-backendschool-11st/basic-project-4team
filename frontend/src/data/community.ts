import { ROUTES } from './layout';

/* ------------------------------------------------------------------ */
/* Shared types                                                         */
/* ------------------------------------------------------------------ */

export type AvatarTone = 'rose' | 'neutral' | 'forest' | 'soft' | 'secondary' | 'primary';
export type BadgeTone = 'lime' | 'neutral' | 'mint';
export type ReactionTone = 'tertiary' | 'neutral' | 'info';

export interface CommunityBadge {
  readonly label: string;
  readonly tone: BadgeTone;
  readonly icon?: string;
}

export interface CommunityAuthor {
  readonly name: string;
  readonly initials: string;
  readonly tone: AvatarTone;
  readonly icon?: string;
}

export interface ReactionSeed {
  readonly key: string;
  readonly emoji: string;
  readonly count: number;
  readonly tone?: ReactionTone;
}

export interface CommunityImage {
  readonly src: string;
  readonly alt: string;
}

/* ------------------------------------------------------------------ */
/* Community feed (P-017)                                               */
/* ------------------------------------------------------------------ */

export type FeedCategoryKey = 'all' | 'pokemon' | 'onepiece' | 'sneakers' | 'watch';

export interface FeedCategory {
  readonly key: FeedCategoryKey;
  readonly label: string;
  readonly emoji?: string;
}

export const feedCategories: readonly FeedCategory[] = [
  { key: 'all', label: '전체' },
  { key: 'pokemon', label: '포켓몬 카드', emoji: '🃏' },
  { key: 'onepiece', label: '원피스/유희왕', emoji: '🏴‍☠️' },
  { key: 'sneakers', label: '조던/나이키 스니커즈', emoji: '👟' },
  { key: 'watch', label: '명품/시계', emoji: '⌚' },
];

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export const feedComposer = {
  boardIcon: 'category',
  tagIcon: 'sell',
  boardOptions: [
    { value: 'pokemon', label: '🃏 포켓몬 카드' },
    { value: 'sneakers', label: '👟 한정판 스니커즈' },
    { value: 'onepiece', label: '🏴‍☠️ 원피스/TCG' },
    { value: 'watch', label: '⌚ 명품/시계' },
    { value: 'free', label: '💬 자유 토론' },
  ] as readonly SelectOption[],
  tagOptions: [
    { value: 'analysis', label: '📈 시세·전망 분석' },
    { value: 'verify', label: '🔍 실물·정품 검증' },
    { value: 'unboxing', label: '📦 개봉·수령 후기' },
    { value: 'poll', label: '📊 투표·설문' },
    { value: 'qna', label: '❓ 질문·Q&A' },
    { value: 'info', label: '📢 발매·경매 정보' },
  ] as readonly SelectOption[],
  verifiedNotice: '검증된 실시간 수집가 토론',
  verifiedIcon: 'verified_user',
  avatarLabel: '내',
  placeholder: '수집품 시세 전망이나 카드 상태, 시장에 대한 생각을 자유롭게 남겨보세요...',
  tools: [
    { key: 'photo', icon: 'image', label: '사진', title: '사진 첨부' },
    { key: 'poll', icon: 'poll', label: '투표', title: '투표 만들기' },
    { key: 'tag', icon: 'analytics', label: '시세 태그', title: '시세/품목 태그' },
  ] as readonly { readonly key: 'photo' | 'poll' | 'tag'; readonly icon: string; readonly label: string; readonly title: string }[],
  photo: {
    max: 4,
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 5 * 1024 * 1024,
    counter: (n: number, max: number) => `사진 ${n}/${max}`,
    removeLabel: '사진 빼기',
    uploading: '사진을 올리는 중...',
    tooMany: (max: number) => `사진은 최대 ${max}장까지 첨부할 수 있습니다.`,
    tooLarge: '5MB 이하의 JPG, PNG, WebP 사진만 올릴 수 있습니다.',
    failed: '사진을 올리지 못했습니다.',
    alt: (n: number) => `첨부할 사진 ${n}`,
  },
  poll: {
    title: '투표 만들기',
    minOptions: 2,
    maxOptions: 4,
    optionMax: 40,
    optionPlaceholder: (n: number) => `선택지 ${n}`,
    addOption: '선택지 추가',
    removeOption: '선택지 삭제',
    removePoll: '투표 빼기',
    durationLabel: '투표 기간',
    durations: [
      { value: '1', label: '1일' },
      { value: '3', label: '3일' },
      { value: '7', label: '7일' },
    ] as readonly SelectOption[],
    defaultDuration: 3,
    invalid: '투표 선택지를 2개 이상, 서로 다르게 입력해 주세요.',
  },
  tag: {
    title: '시세 태그',
    placeholder: '품목 이름으로 검색 (예: 리자몽)',
    searching: '검색 중...',
    empty: '검색 결과가 없습니다.',
    failed: '품목을 검색하지 못했습니다.',
    removeLabel: '시세 태그 빼기',
    minChars: 1,
    debounceMs: 250,
  },
  submitting: '등록 중...',
  bodyMax: 500,
  submitIcon: 'edit_note',
  submitLabel: '의견 남기기',
};

/** Board names used for posts created through the composer. */
export const feedBoardMeta: Readonly<Record<string, { readonly label: string; readonly icon: string; readonly category: FeedCategoryKey }>> = {
  pokemon: { label: '포켓몬 카드 토론방', icon: 'style', category: 'pokemon' },
  sneakers: { label: '나이키 조던 토론방', icon: 'sports_handball', category: 'sneakers' },
  onepiece: { label: '원피스 카드 토론방', icon: 'shield', category: 'onepiece' },
  watch: { label: '명품/시계 토론방', icon: 'watch', category: 'watch' },
  free: { label: '자유 토론방', icon: 'forum', category: 'all' },
};

export interface PollOptionSeed {
  /** 화면에 보이는 순번 글자 (A, B, C, D). */
  readonly key: string;
  /** post_poll_options.id — 투표 요청에 쓴다. */
  readonly id: number;
  readonly label: string;
  readonly votes: number;
}

export interface FeedPoll {
  readonly postId: number;
  readonly options: readonly PollOptionSeed[];
  readonly deadlineLabel: string;
  /** 내가 고른 선택지 id. 안 했으면 null. */
  readonly myOptionId: number | null;
  readonly closed: boolean;
}

/** 시세 태그 카드 — 글에 붙인 품목과 최근 체결가. */
export interface FeedItemTag {
  readonly slug: string;
  readonly name: string;
  readonly imageSrc: string | null;
  readonly priceLabel: string;
  readonly changeLabel: string;
  readonly trend: 'up' | 'down' | 'flat';
}

export interface FeedPost {
  readonly id: string;
  readonly category: FeedCategoryKey;
  /** itemId: 품목 slug. 품목 없는 글(자유 토론 등)은 null → 칩이 링크가 아님. */
  readonly board: { readonly label: string; readonly icon: string; readonly itemId: string | null };
  readonly author: CommunityAuthor;
  readonly badge?: CommunityBadge;
  readonly timeAgo: string;
  readonly context: string;
  readonly title: string;
  readonly body: string;
  readonly poll?: FeedPoll;
  readonly itemTag?: FeedItemTag;
  readonly images?: readonly CommunityImage[];
  readonly reactions?: readonly ReactionSeed[];
  /** 로그인 사용자가 남긴 이모지 key. 없으면 null. */
  readonly myReaction?: string | null;
  readonly priceTag?: PostPriceTagView;
  readonly commentCount: number;
  /** API에서 받은 글의 숫자 id. 수정·삭제 요청에 쓴다. */
  readonly postId?: number;
  /** 로그인 사용자가 작성한 글이면 true → 수정/삭제 메뉴 표시. */
  readonly isMine?: boolean;
  /** 수정된 적이 있으면 true → "(수정됨)" 표시. */
  readonly edited?: boolean;
}

/** 피드 글 카드의 "⋯" 메뉴와 수정 모드 문구. */
export const feedPostEditCopy = {
  menu: [
    { key: 'edit', icon: 'edit', label: '수정', danger: false },
    { key: 'delete', icon: 'delete', label: '삭제', danger: true },
  ],
  editedLabel: '(수정됨)',
  saveLabel: '수정하기',
  cancelLabel: '취소',
  deleteConfirm: '이 글을 삭제할까요? 삭제한 글은 되돌릴 수 없습니다.',
  bodyMax: 500,
};

/** API 호출 실패 시 보여줄 문구. */
export const feedErrorCopy = {
  load: '토론글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  loginRequired: '로그인이 필요합니다.',
  create: '글을 등록하지 못했습니다.',
  update: '글을 수정하지 못했습니다.',
  remove: '글을 삭제하지 못했습니다.',
};

/** ISO 시간 → "방금 전 / N분 전 / N시간 전 / N일 전". 7일이 넘으면 날짜로 표시. */
export const formatTimeAgo = (iso: string, now: number = Date.now()): string => {
  const diffMin = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
};

export const feedCopy = {
  commentLabel: (n: number) => `댓글 ${n}`,
  shareLabel: '공유',
  pollSummary: (total: number, deadline: string) => `총 ${total}명 참여 · ${deadline}`,
  pollVotes: (n: number) => `${n}명 투표`,
  loadingLabel: '스크롤 시 실시간 토론글이 자동으로 로딩됩니다',
  endLabel: '모든 토론글을 불러왔습니다',
  emptyLabel: '이 카테고리에는 아직 토론글이 없습니다.',
  justNow: '방금 전',
  newPostTitle: '새 의견',
  pollLetters: ['A', 'B', 'C', 'D'] as readonly string[],
  /** 투표 마감까지 남은 시간 → "마감 D-2", "오늘 마감", "투표 마감". */
  pollDeadline: (iso: string, closed: boolean, now: number = Date.now()) => {
    if (closed) return '투표 마감';
    const days = Math.floor((new Date(iso).getTime() - now) / 86400000);
    return days < 1 ? '오늘 마감' : `마감 D-${days}`;
  },
  pollVoteError: '투표하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  pollAlreadyVoted: '이미 투표했어요. 투표는 바꿀 수 없습니다.',
  itemTagIcon: 'sell',
  itemTagLabel: '시세 태그',
  itemTagPrice: (n: number | null) => (n === null ? '거래 이력 없음' : `${n.toLocaleString('ko-KR')}원`),
  itemTagChange: (rate: number, hasPrice: boolean) =>
    !hasPrice ? '' : rate === 0 ? '보합' : `${rate > 0 ? '▲' : '▼'} ${Math.abs(rate).toFixed(1)}%`,
};

/* ------------------------------------------------------------------ */
/* Item discussion (P-018)                                              */
/* ------------------------------------------------------------------ */

export interface DiscussionItem {
  readonly id: string;
  readonly name: string;
  readonly grade: string;
  readonly certNo: string;
  readonly image: CommunityImage;
  readonly price: string;
  /** 최근 체결가(원). 거래 이력이 없으면 null. 희망 체결가 비교에 쓴다. */
  readonly latestPrice: number | null;
  readonly changePct: string;
  readonly changeAmount: string;
  /** 소분류 카테고리 code (API 품목만). 토론글 등록 시 게시판(board)을 정하는 데 쓴다. */
  readonly categoryCode?: string;
  /** 전일 대비 방향 — 화살표·색상 선택용. */
  readonly trend: 'up' | 'down' | 'flat';
  readonly listingCount: number;
  readonly breadcrumbs: readonly { readonly label: string; readonly to: string }[];
  readonly breadcrumbCurrent: string;
}

export const itemHeaderCopy = {
  listingIcon: 'storefront',
  listingLabel: (n: number) => `현재 매물 (${n})`,
  listingTo: (name: string) => `${ROUTES.search}?q=${encodeURIComponent(name)}`,
};

export const sentimentCopy = {
  upLabel: '오른다',
  downLabel: '내린다',
  upIcon: 'local_fire_department',
  downIcon: 'ac_unit',
  votes: (n: number) => `(${n.toLocaleString('ko-KR')}표)`,
  notice: '품목당 하루(자정 기준) 1회 참여 · 투표 후 변경 불가',
  alreadyVoted: '오늘은 이미 투표했습니다. 내일 다시 투표할 수 있습니다.',
  voteError: '투표하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  loadError: '투표 결과를 불러오지 못했습니다.',
  upButton: '🔥 오른다 투표',
  downButton: '🧊 내린다 투표',
};

/** 시세 대비 차이 — "+6.3%", "-2.0%", "시세와 같음". */
export const formatPriceDiff = (price: number, market: number): string => {
  const rate = ((price - market) / market) * 100;
  if (Math.abs(rate) < 0.05) return '시세와 같음';
  return `${rate > 0 ? '+' : '-'}${Math.abs(rate).toFixed(1)}%`;
};

/** 글 카드의 희망 체결가 표시. */
export interface PostPriceTagView {
  readonly label: string;
  /** 시세 대비 차이. 시세가 없으면 빈 문자열. */
  readonly diffLabel: string;
  readonly tone: 'up' | 'down' | 'flat';
}

export const priceTagCopy = {
  icon: 'sell',
  label: (price: number) => `희망 체결가 ${price.toLocaleString('ko-KR')}원`,
  diff: (price: number, market: number) => `시세 대비 ${formatPriceDiff(price, market)}`,
};

export const discussionComposer = {
  avatarIcon: 'person',
  placeholder: '이 품목에 대한 전망이나 실거래 의견을 남겨보세요. (최대 500자, 이미지 첨부 4장 가능)',
  maxLength: 500,
  photoIcon: 'photo_camera',
  photoLabel: (n: number, max: number) => `사진 첨부 (${n}/${max})`,
  photoTitle: '사진 추가',
  priceIcon: 'sell',
  priceLabel: '희망 체결가',
  priceTitle: '희망 체결가 입력',
  priceInputLabel: '희망 체결가 (원)',
  pricePlaceholder: '예: 300,000',
  priceMax: 1000000000,
  priceRemove: '희망 체결가 빼기',
  priceInvalid: '희망 체결가는 1원 ~ 10억 원 사이로 입력해 주세요.',
  /** 입력 중 참고용 — "현재 시세 320,000원 대비 -6.3%". */
  priceReference: (market: number | null, price: number | null) => {
    if (market === null) return '거래 이력이 없어 시세 비교를 할 수 없습니다.';
    const base = `현재 시세 ${market.toLocaleString('ko-KR')}원`;
    return price === null ? base : `${base} 대비 ${formatPriceDiff(price, market)}`;
  },
  counter: (n: number, max: number) => `${n} / ${max}자`,
  submitLabel: '글쓰기',
  submitting: '등록 중...',
  uploading: '사진 올리는 중...',
};

/** 토론방 글 수정 (카드 안에서 바로 수정, REQ-BEDIT). */
export const discussionEditCopy = {
  submitLabel: '수정하기',
  submitting: '저장 중...',
  cancelLabel: '취소',
  deleteConfirm: '이 글을 삭제할까요? 삭제한 글은 되돌릴 수 없습니다.',
};

export type DiscussionSort = 'popular' | 'latest';

export const discussionControls = {
  sorts: [
    { key: 'popular', label: '인기순 (반응+댓글)' },
    { key: 'latest', label: '최신순' },
  ] as readonly { readonly key: DiscussionSort; readonly label: string }[],
  total: (n: number) => `총 ${n.toLocaleString('ko-KR')}개의 토론`,
  verifiedOnly: '인증 보유자 글만 보기',
};

export interface DiscussionPost {
  readonly id: string;
  readonly author: CommunityAuthor;
  readonly badges: readonly CommunityBadge[];
  readonly isOwner: boolean;
  readonly meta: string;
  readonly body: string;
  readonly images?: readonly CommunityImage[];
  readonly reactions: readonly ReactionSeed[];
  /** 로그인 사용자가 남긴 이모지 key. 없으면 null. */
  readonly myReaction?: string | null;
  readonly priceTag?: PostPriceTagView;
  readonly commentCount: number;
  /** Higher = newer. Used for 최신순 sorting. */
  readonly order: number;
  /** API에서 받은 글의 숫자 id. 댓글·신고 요청에 쓴다. 목 데이터 글은 없음. */
  readonly postId?: number;
  /** 로그인 사용자가 쓴 글이면 true → 신고 대신 수정·삭제 메뉴. */
  readonly isMine?: boolean;
  /** 수정 폼을 채울 원래 값 (내 글만). */
  readonly editSource?: DiscussionEditSource;
}

/** 토론글 수정 폼의 초기값 — 본문, 첨부 사진(post_images.id·주소), 희망 체결가. */
export interface DiscussionEditSource {
  readonly body: string;
  readonly images: readonly { readonly id: number; readonly url: string }[];
  readonly priceTag: number | null;
}

/** API author.badges 값 → 화면 배지. owner = 이 품목 보유자, trade = 이 품목 거래완료 이력. */
export const postBadgeMeta: Readonly<Record<string, CommunityBadge>> = {
  owner: { label: '보유자', tone: 'mint', icon: 'verified' },
  trade: { label: '거래 인증', tone: 'lime', icon: 'handshake' },
};

/** 글 사진 확대 보기 (피드·토론방 공용). */
export const imageViewerCopy = {
  dialogLabel: '사진 크게 보기',
  openLabel: (n: number) => `사진 ${n} 크게 보기`,
  closeLabel: '닫기',
  closeIcon: 'close',
  prevLabel: '이전 사진',
  prevIcon: 'chevron_left',
  nextLabel: '다음 사진',
  nextIcon: 'chevron_right',
  counter: (current: number, total: number) => `${current} / ${total}`,
};

/** 토론글 사진 alt 문구. */
export const postImageAlt = (author: string, n: number) => `${author}님이 첨부한 사진 ${n}`;

export const discussionReactionTemplate = (fire: number, surprised: number, laugh: number, ice: number): readonly ReactionSeed[] => [
  { key: 'fire', emoji: '🔥', count: fire, tone: 'tertiary' },
  { key: 'surprised', emoji: '😮', count: surprised, tone: 'neutral' },
  { key: 'laugh', emoji: '😂', count: laugh, tone: 'neutral' },
  { key: 'ice', emoji: '🧊', count: ice, tone: 'info' },
];

export const discussionPostCopy = {
  commentIcon: 'chat_bubble_outline',
  comment: '댓글',
  menuIcon: 'more_vert',
  menu: [
    { key: 'share', icon: 'share', label: '공유', danger: false },
    { key: 'report', icon: 'flag', label: '신고하기', danger: true },
  ],
  /** 내 글의 ⋮ 메뉴 (REQ-BOARD-009). */
  ownerMenu: [
    { key: 'share', icon: 'share', label: '공유', danger: false },
    { key: 'edit', icon: 'edit', label: '수정하기', danger: false },
    { key: 'delete', icon: 'delete', label: '삭제하기', danger: true },
  ],
  newPostBadge: '방금 전 작성',
  edited: '(수정됨)',
  justNow: '방금 전',
  loadingIcon: 'expand_more',
  loadingLabel: '스크롤 시 이전 토론 글 자동 로딩',
  endLabel: '모든 토론 글을 불러왔습니다',
  emptyLabel: '조건에 맞는 토론 글이 없습니다.',
};

export interface TrendingItem {
  /** 품목 slug (토론방 경로). */
  readonly id: string;
  readonly rank: number;
  readonly name: string;
  readonly detail: string;
  /** 언급 수 표시 문구 ("12회"). */
  readonly count: string;
  /** 언급 수 내역 ("토론글 3개 · 댓글 9개"). */
  readonly countTitle: string;
}

/** REQ-BOARD-010 실시간 많이 언급된 품목 — 최근 24시간 글·댓글 수 TOP5. */
export const trendingSidebar = {
  icon: 'whatshot',
  title: '실시간 많이 언급된 품목',
  /** GET /items/trending 의 days. 1 = 최근 24시간. */
  days: 1,
  limit: 5,
  /** "실시간" — 이 간격(ms)마다 순위를 다시 불러온다. */
  refreshMs: 60_000,
  period: '최근 24시간 기준',
  description: '토론 글과 댓글이 가장 많이 달린 품목 순위입니다.',
  currentBadge: '현재',
  loading: '순위를 불러오는 중...',
  empty: '최근 24시간 동안 언급된 품목이 없습니다.',
  error: '순위를 불러오지 못했습니다.',
  /** "SAR · 320,000원 (+18.1%)" — 거래 이력이 없으면 "거래 이력 없음". */
  detail: (label: string, price: number | null, rate: number) => {
    if (price === null) return `${label} · 거래 이력 없음`;
    const change = rate === 0 ? '보합' : `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
    return `${label} · ${price.toLocaleString('ko-KR')}원 (${change})`;
  },
  /** 언급 수(글 + 댓글). */
  count: (n: number) => `${n.toLocaleString('ko-KR')}회`,
  /** 숫자에 마우스를 올리면 보이는 내역. */
  countTitle: (posts: number, comments: number) => `토론글 ${posts}개 · 댓글 ${comments}개`,
};

export const guidelines = {
  icon: 'verified_user',
  title: 'RE:PICK 클린 토론 원칙',
  description: '건전한 컬렉터 생태계를 위해 아래 행위 적발 시 게시글 삭제 및 거래소 이용 제한 조치가 진행됩니다.',
  rules: [
    '허위 사실을 통한 인위적 시세 조작 및 펌핑 유도 금지',
    '외부 사설 계좌 입금 유도 및 직거래 사기 시도 영구 제재',
    '타인 비방, 욕설, 감정적 비하성 게시글 즉시 블라인드 처리',
  ] as readonly string[],
  footnote: '신고 접수 시 감정사/운영팀 24시간 내 심사',
  linkLabel: '규정 전문',
  linkTo: '/community/guidelines',
};

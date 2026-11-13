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
  ],
  submitIcon: 'edit_note',
  submitLabel: '의견 남기기',
};

/** Board names used for posts created through the composer. */
export const feedBoardMeta: Readonly<Record<string, { readonly label: string; readonly icon: string; readonly itemId: string; readonly category: FeedCategoryKey }>> = {
  pokemon: { label: '포켓몬 카드 토론방', icon: 'style', itemId: 'charizard-ex-sar', category: 'pokemon' },
  sneakers: { label: '나이키 조던 토론방', icon: 'sports_handball', itemId: 'jordan-1-chicago', category: 'sneakers' },
  onepiece: { label: '원피스 카드 토론방', icon: 'shield', itemId: 'luffy-gear5', category: 'onepiece' },
  watch: { label: '명품/시계 토론방', icon: 'watch', itemId: 'rolex-submariner', category: 'watch' },
  free: { label: '자유 토론방', icon: 'forum', itemId: 'charizard-ex-sar', category: 'all' },
};

export interface PollOptionSeed {
  readonly key: string;
  readonly label: string;
  readonly votes: number;
}

export interface FeedPoll {
  readonly options: readonly PollOptionSeed[];
  readonly deadlineLabel: string;
}

export interface FeedPost {
  readonly id: string;
  readonly category: FeedCategoryKey;
  readonly board: { readonly label: string; readonly icon: string; readonly itemId: string };
  readonly author: CommunityAuthor;
  readonly badge?: CommunityBadge;
  readonly timeAgo: string;
  readonly context: string;
  readonly title: string;
  readonly body: string;
  readonly poll?: FeedPoll;
  readonly images?: readonly CommunityImage[];
  readonly reactions?: readonly ReactionSeed[];
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
  pollCommentLabel: (n: number) => `댓글 ${n}개`,
  shareLabel: '공유',
  pollSummary: (total: number, deadline: string) => `총 ${total}명 참여 완료 · ${deadline}`,
  pollVotes: (n: number) => `${n}명 투표`,
  loadingLabel: '스크롤 시 실시간 토론글이 자동으로 로딩됩니다',
  endLabel: '모든 토론글을 불러왔습니다',
  emptyLabel: '이 카테고리에는 아직 토론글이 없습니다.',
  justNow: '방금 전',
  newPostTitle: '새 의견',
};

export const myAuthor: CommunityAuthor = { name: '콜렉터_나', initials: '나', tone: 'primary' };

export const feedPosts: readonly FeedPost[] = [
  {
    id: 'feed-1',
    category: 'sneakers',
    board: { label: '나이키 조던 토론방', icon: 'sports_handball', itemId: 'jordan-1-chicago' },
    author: { name: '스니커헤드KR', initials: '스', tone: 'rose' },
    badge: { label: '프로컬렉터', tone: 'lime' },
    timeAgo: '4시간 전',
    context: '투표 진행중 (D-2)',
    title: '조던 1 시카고 2015 OG vs 2022 로스트앤파운드, 지금 시세라면 어떤 것을 소장하시겠습니까?',
    body: '현재 2015 시카고(신품 풀구성)는 약 130만원 선, 2022 로스트앤파운드는 48만원 선에서 안착했습니다. 가성비 실착 vs 대장급 오리지널 소장가치 중 회원님들의 선택은?',
    poll: {
      options: [
        { key: 'A', label: '2015 OG 시카고 (불변의 대장 소장용)', votes: 82 },
        { key: 'B', label: '2022 로스트앤파운드 (실착 & 가성비 승리)', votes: 60 },
      ],
      deadlineLabel: '마감 48시간 남음',
    },
    commentCount: 15,
  },
  {
    id: 'feed-2',
    category: 'onepiece',
    board: { label: '원피스 카드 토론방', icon: 'shield', itemId: 'luffy-gear5' },
    author: { name: '루피기어5만랩', initials: '원', tone: 'neutral' },
    badge: { label: '신규 수집가', tone: 'neutral' },
    timeAgo: '5시간 전',
    context: '실물 검증 요청',
    title: 'PSA 10 그레이딩 방금 수령했습니다! 코너 센터링 및 홀로그램 상태 어떤가요?',
    body: "원피스 카드 신시대의 주역 편 '몽키 D. 루피 (기어 5) 시크릿 슈퍼 패러렐' PSA 10 받았는데 상단부 미세 마이크로 도트가 보이네요. 장기 홀딩 가치에 영향이 있을지 선배님들 감정 피드백 부탁드립니다.",
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTIXsmhj7prA6OZNt7v9NW4Rt1DJd7IWcyEmOfgOUO2CbEvkbCSSeZo5jfpYnOJcfWG-u5APLIDWZbabc7l2TgnICHJTxXbeEHh3AhCxnGc0YW2_VyZyi10UasjGY6AcjB246jwBHmEDStfNfW9FGTN-kj5swk2iZ9u1_Cw86yPiX1mHHUVLOR_BoWPJwMC-gHlbNshUc9iuY2wHfdM9pJwyMK5cce2kgxbLHjQm8',
        alt: 'PSA 10 슬랩에 담긴 원피스 루피 기어5 시크릿 레어 홀로그램 카드',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9VwvHg5HT3RgCxKiF3RWH2Wp47R_TVH6CoXDGDYlaMCIdQaexDpXXhnBFUB4gtlQA74jj9VfEF1XGK6V34IQYoUYYu8ZSW1oS4r6aYeMmtwMRZ6SGkeoHomyfivefjzs3mIOKTIYoAduszBnjflyd5NhpqqCBpob-wMt90ca8lAQQ0sePLbflyIUsEson8MQn1QdGkAu0_J82Nu6oCWqxVzApQyH0hSIbNeCVTLU',
        alt: '트레이딩 카드 코너와 센터링 접사 사진',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYQ9W-qiyhg1d8AzMRJwPcwFL4KNR-8Y4OvXFMFCLILYKZF-j3SssZHjIq-bEUhAm0CZBXS8BRJhr10qMwzIHX8pydX1Kt3DHOKP4gms2nJ8dRFxHrrveVRMQbrup_w28V7J9ehj3gH7BxY2f15JwpXmcn-adcuolQGMZVhN26z29SVVhn4CsZu7rVc8GArFJS_RJG2J7wqPTDwq37FfToCrz5fDiN3m3ci8mls5I',
        alt: '그레이딩 카드 뒷면의 인증 바코드와 QR 코드',
      },
    ],
    reactions: [
      { key: 'fire', emoji: '🔥', count: 19 },
      { key: 'clap', emoji: '👏', count: 12 },
    ],
    commentCount: 8,
  },
];

/** Older posts appended by the infinite-scroll sentinel. */
export const feedMorePosts: readonly FeedPost[] = [
  {
    id: 'feed-3',
    category: 'pokemon',
    board: { label: '포켓몬 카드 토론방', icon: 'style', itemId: 'charizard-ex-sar' },
    author: { name: '포켓몬덕후', initials: '덕', tone: 'forest' },
    badge: { label: '프로컬렉터', tone: 'lime' },
    timeAgo: '7시간 전',
    context: '시세·전망 분석',
    title: '리자몽 ex SAR PSA 10, 30만 원대 초반 지지선 유지될까요?',
    body: '국내 PSA10 물량이 눈에 띄게 줄었습니다. 다음 주 신규 확장팩 발매 전까지 시세 흐름을 같이 지켜봐요.',
    reactions: [
      { key: 'fire', emoji: '🔥', count: 7 },
      { key: 'clap', emoji: '👏', count: 3 },
    ],
    commentCount: 4,
  },
  {
    id: 'feed-4',
    category: 'watch',
    board: { label: '명품/시계 토론방', icon: 'watch', itemId: 'rolex-submariner' },
    author: { name: '워치러버', initials: '워', tone: 'soft' },
    badge: { label: '신규 수집가', tone: 'neutral' },
    timeAgo: '9시간 전',
    context: '질문·Q&A',
    title: '서브마리너 풀세트 vs 단품, 리셀 시 차이 얼마나 나나요?',
    body: '보증서와 박스 유무에 따라 체결가 차이가 어느 정도인지 실거래 경험 공유 부탁드립니다.',
    reactions: [
      { key: 'fire', emoji: '🔥', count: 2 },
      { key: 'clap', emoji: '👏', count: 1 },
    ],
    commentCount: 6,
  },
];

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
  readonly changePct: string;
  readonly changeAmount: string;
  /** 소분류 카테고리 code (API 품목만). 토론글 등록 시 게시판(board)을 정하는 데 쓴다. */
  readonly categoryCode?: string;
  /** 전일 대비 방향 — 화살표·색상 선택용. */
  readonly trend: 'up' | 'down' | 'flat';
  readonly listingCount: number;
  readonly breadcrumbs: readonly { readonly label: string; readonly to: string }[];
  readonly breadcrumbCurrent: string;
  readonly sentiment: { readonly up: number; readonly down: number };
  readonly totalDiscussions: number;
}

export const discussionItems: readonly DiscussionItem[] = [
  {
    id: 'charizard-ex-sar',
    name: '리자몽 ex SAR',
    grade: 'PSA 10 GEM MINT',
    certNo: '검증 고유번호 #8841-2094',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLnOKRQ3FuvwAxIShHhKDpzFlaPMaP7XlxY7CUo7VNooU8S1lwFTScf0-kdBtmf_VsEKhIlAFizx4O9Yd9wcuCJiAKNfdH5ANYoqfgrD6KFHvbzCMeg9GENrADXfkS7cUWi58nIfn3Ilj9--Bd5aSe8R0jXO1zAUzyI-NHMvrC8RT0XzVHAmskZMmsR9PQhz_458HZ0hF1JX-SOwyEOO4QmoY0Z2p635VnXYGTgUA',
      alt: 'PSA 10 젬민트 슬랩에 담긴 포켓몬 카드 리자몽 ex SAR',
    },
    price: '320,000원',
    changePct: '18.2%',
    changeAmount: '(전일 대비 +49,000원)',
    trend: 'up',
    listingCount: 42,
    breadcrumbs: [
      { label: '홈', to: ROUTES.home },
      { label: '트레이딩 카드', to: `${ROUTES.search}?category=trading-card` },
      { label: '포켓몬 카드', to: `${ROUTES.search}?q=${encodeURIComponent('포켓몬 카드')}` },
    ],
    breadcrumbCurrent: '리자몽 ex SAR (PSA 10) 토론방',
    sentiment: { up: 1842, down: 1036 },
    totalDiscussions: 1420,
  },
];

export const defaultDiscussionItem: DiscussionItem = discussionItems[0];

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
  notice: '24시간 기준 품목당 1회 참여 가능 · 실시간 시세 반영',
  upButton: '🔥 오른다 투표',
  downButton: '🧊 내린다 투표',
};

export const discussionComposer = {
  avatarIcon: 'person',
  placeholder: '이 품목에 대한 전망이나 실거래 의견을 남겨보세요. (최대 500자, 이미지 첨부 4장 가능)',
  maxLength: 500,
  photoIcon: 'photo_camera',
  photoLabel: (n: number, max: number) => `사진 첨부 (${n}/${max})`,
  photoTitle: '사진 추가',
  maxPhotos: 4,
  priceIcon: 'sell',
  priceLabel: '희망 체결가',
  priceTitle: '시세 태그',
  counter: (n: number, max: number) => `${n} / ${max}자`,
  submitLabel: '글쓰기',
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
  readonly commentCount: number;
  /** Higher = newer. Used for 최신순 sorting. */
  readonly order: number;
  /** API에서 받은 글의 숫자 id. 댓글·신고 요청에 쓴다. 목 데이터 글은 없음. */
  readonly postId?: number;
  /** 로그인 사용자가 쓴 글이면 true → 신고 메뉴 숨김. */
  readonly isMine?: boolean;
}

const ownerBadge: CommunityBadge = { label: '보유자', tone: 'mint', icon: 'verified' };
const tradeBadge: CommunityBadge = { label: '거래 인증', tone: 'lime', icon: 'handshake' };

export const discussionReactionTemplate = (fire: number, surprised: number, laugh: number, ice: number): readonly ReactionSeed[] => [
  { key: 'fire', emoji: '🔥', count: fire, tone: 'tertiary' },
  { key: 'surprised', emoji: '😮', count: surprised, tone: 'neutral' },
  { key: 'laugh', emoji: '😂', count: laugh, tone: 'neutral' },
  { key: 'ice', emoji: '🧊', count: ice, tone: 'info' },
];

export const discussionPosts: readonly DiscussionPost[] = [
  {
    id: 'post-1',
    author: { name: '포켓몬덕후', initials: '덕후', tone: 'forest' },
    badges: [ownerBadge, tradeBadge],
    isOwner: true,
    meta: '10분 전 · 서울 강남구 체결 이력',
    body: 'PSA10 물량이 국내 유통 채널에서 눈에 띄게 줄어서 당분간 30만 원대 초반 지지선은 견고할 것 같아요. 다음 주 신규 확장팩 발매 전까지는 패닉셀 하지 마시고 보유하시는 것을 추천합니다. 일본 야후 옥션 마감가도 이미 3.4만 엔 선에 안착했습니다.',
    reactions: discussionReactionTemplate(12, 3, 1, 2),
    commentCount: 5,
    order: 3,
  },
  {
    id: 'post-2',
    author: { name: '카드초보', initials: '초보', tone: 'soft' },
    badges: [{ label: '리픽 입문 1개월', tone: 'neutral' }],
    isOwner: false,
    meta: '1시간 전',
    body: '지금 사면 고점일까요? 이번 주에만 4만 원 올랐네요. 카드 실물 홀로그램 결 상태 보는데 센터링도 거의 완벽해서 질러야 할지 고민입니다. 실물 사진 첨부합니다.',
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxWHmR_obnVoS8mrlJkMeo8UWsbNVnsvHFG0IiU1ElxjyQAp5_BO_dKjaQt4Xjb8xQgvIqD_GWyo5Hn8Zkog3UJFN5HdZyn72eT0gqdi38Q01KXgWLBE6j9uKmhr4oMyQrebp7W7FiIuUnKE7AXYv050_gsNeysyssjN5yETh3e03Cy9npbmqW_34316-qkCgT4YXMw38PwKPPy5ofz825HpUrQjUedhKEDohY3oM',
        alt: '홀로그램 리자몽 카드 센터링 접사 사진',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgBFuQg_hiW49S8IMgOXLWDN0yvw9xkz0mfa2hOMqxZBY3x0XxCgbRXDq2wQHaqThDKNtDbIA-rnozQLTSTiwtNiGStXCqeu3k1GoPy-2UskO_o-4seXoFUV56O2UPNey599Gcf7UeS4idWBeV3kI-urH5Pl3uTs9tuLtpTHgKhI0lPtzHHPzPYgY52zQI8gz6jVDU8m2a6215ICvQES8A0jUkxcxf65b3D7cqAWY',
        alt: '그레이딩 카드 뒷면 테두리 상태',
      },
    ],
    reactions: discussionReactionTemplate(4, 6, 0, 9),
    commentCount: 11,
    order: 2,
  },
  {
    id: 'post-3',
    author: { name: '리셀러J', initials: '리셀', tone: 'secondary' },
    badges: [tradeBadge],
    isOwner: false,
    meta: '3시간 전 · 트레이딩 전문 셀러',
    body: '해외 시세는 오히려 내려가는 중이라 곧 조정 올 듯합니다. 이베이 최근 3일간 평균 낙찰가가 $210선까지 내려앉았어요. 환율 감안해도 국내 프리미엄이 10% 이상 껴있는 상태니 진입 타이밍 신중하게 잡으세요.',
    reactions: discussionReactionTemplate(1, 2, 0, 7),
    commentCount: 3,
    order: 1,
  },
];

export const discussionMorePosts: readonly DiscussionPost[] = [
  {
    id: 'post-4',
    author: { name: '홀로그램장인', initials: '장인', tone: 'neutral' },
    badges: [ownerBadge],
    isOwner: true,
    meta: '6시간 전 · PSA 10 2장 보유',
    body: '감정 결과 편차가 거의 없는 카드라 장기 보유 관점에서는 여전히 매력적이라고 봅니다. 단기 변동성은 감안하세요.',
    reactions: discussionReactionTemplate(5, 1, 0, 1),
    commentCount: 2,
    order: 0,
  },
];

export const discussionPostCopy = {
  commentIcon: 'chat_bubble_outline',
  comment: '댓글',
  bookmarkIcon: 'bookmark_border',
  bookmarkActiveIcon: 'bookmark',
  menuIcon: 'more_vert',
  menu: [
    { key: 'share', icon: 'share', label: '공유', danger: false },
    { key: 'report', icon: 'flag', label: '신고하기', danger: true },
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
  readonly id: string;
  readonly rank: number;
  readonly name: string;
  readonly detail: string;
  readonly count: string;
}

export const trendingSidebar = {
  icon: 'whatshot',
  title: '연관 품목',
  period: '24시간 기준',
  description: '회원 간 거래 의견 및 시세 전망 토론이 가장 활발한 컬렉터블 품목 순위입니다.',
  currentBadge: '현재',
  items: [
    { id: 'charizard-ex-sar', rank: 1, name: '리자몽 ex SAR', detail: 'PSA 10 · 320,000원 (+18.2%)', count: '1,420건' },
    { id: 'jordan-1-chicago', rank: 2, name: '에어조던 1 레트로 하이 시카고', detail: '사이즈 270 · 480,000원 (-2.1%)', count: '980건' },
    { id: 'luffy-gear5', rank: 3, name: '원피스 카드 몽키 D. 루피 기어5', detail: 'SEC 패럴렐 · 850,000원 (+5.4%)', count: '740건' },
    { id: 'dunk-low-panda', rank: 4, name: '나이키 덩크 로우 범고래 블랙', detail: '사이즈 265 · 142,000원 (보합)', count: '620건' },
    { id: 'blue-eyes-white-dragon', rank: 5, name: '유희왕 푸른 눈의 백룡', detail: 'PSA 9 · 1,290,000원 (+8.9%)', count: '510건' },
  ] as readonly TrendingItem[],
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

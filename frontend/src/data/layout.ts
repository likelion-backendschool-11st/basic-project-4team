export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  findId: '/find-id',
  findPassword: '/find-password',
  my: '/my',
  search: '/search',
  listingDetail: (id: string) => `/listings/${id}`,
  myListingDetail: (id: string) => `/my/listings/${id}`,
  myListingEdit: (id: string) => `/my/listings/${id}/edit`,
  sell: '/sell',
  market: '/market',
  community: '/community',
  itemDiscussion: (id: string) => `/community/items/${id}`,
} as const;

export const brand = {
  name: 'RE:PICK',
  logoSrc: '/logo-brand.svg',
  logoDarkSrc: '/logo-dark.svg',
  logoAlt: 'RE:PICK 로고',
  slogan: '리픽 · 다시 고르고, 다시 판다',
  tagline: '리픽 · 다시 고르고, 다시 판다 | 안전 수집품 거래 플랫폼',
};

export const noticeBar = {
  badge: 'NOTICE',
  text: '국내 최초 PSA/BGS 10등급 인증 트레이딩 카드 에스크로 직거래 개시',
  links: [
    { label: '검수 가이드', to: '/guide' },
    { label: '100% 보증제도', to: '/guarantee' },
    { label: '앱 다운로드', to: '/app' },
  ],
};

export const headerData = {
  searchPlaceholder: '품목명 · 카드명 · 모델명 · 스타일코드 검색',
  enterHint: 'ENTER',
  searchLabel: '검색',
  sellLabel: '판매',
  chatLabel: '채팅',
  chatSoon: '채팅은 준비 중이에요',
  alertLabel: '알림',
  /** 안 읽은 수가 이보다 크면 "99+". */
  badgeMax: 99,
  badgeText: (count: number, max: number) => (count > max ? `${max}+` : String(count)),
  myLabel: '마이',
  loginLabel: '로그인',
  logoutLabel: '로그아웃',
  loggingOutLabel: '로그아웃 중...',
  logoutError: '로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  nicknameSuffix: (nickname: string) => `${nickname}님`,
  myPageAria: '마이페이지로 이동',
};

export interface NavItem {
  readonly label: string;
  readonly to: string;
  readonly icon?: string;
  /** wishlist: 링크 대신 찜 사이드바를 연다 (REQ-HEADER-010). */
  readonly action?: 'wishlist';
}

export const navItems: NavItem[] = [
  { label: '시세 랭킹', to: ROUTES.market },
  { label: '찜한 상품', to: ROUTES.home, icon: 'favorite', action: 'wishlist' },
  { label: '커뮤니티 토론방', to: ROUTES.community, icon: 'forum' },
];

/** 헤더 카테고리 메뉴 (REQ-HEADER-007) — 항목은 GET /categories. */
export const categoryMenuCopy = {
  label: '카테고리',
  icon: 'menu',
  allLabel: (name: string) => `${name} 전체`,
  loading: '카테고리를 불러오는 중...',
  error: '카테고리를 불러오지 못했습니다.',
  searchTo: (code: string) => `${ROUTES.search}?category=${encodeURIComponent(code)}`,
};

/** 찜한 상품 사이드바 (REQ-HEADER-010) — GET /users/me/wishes. */
export const wishlistDrawerCopy = {
  title: '찜한 상품',
  countLabel: (count: number) => `${count}개`,
  closeLabel: '찜 목록 닫기',
  loading: '찜 목록을 불러오는 중...',
  error: '찜 목록을 불러오지 못했습니다.',
  retry: '다시 시도',
  emptyTitle: '아직 찜한 상품이 없어요',
  emptyBody: '마음에 드는 판매글의 하트를 눌러 모아 보세요.',
  emptyLink: '판매글 둘러보기',
  removeLabel: (title: string) => `${title} 찜 해제`,
  removeError: '찜을 해제하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  moreLabel: '더 보기',
  wishedAt: (timeAgo: string) => `${timeAgo} 찜`,
  price: (price: string) => `${price}원`,
  statuses: { selling: '판매중', reserved: '예약중', sold: '거래완료' } as const,
  pageSize: 20,
};

/** 알림 드롭다운 (REQ-HEADER-005) — GET /notifications. */
export const notificationCopy = {
  title: '알림',
  readAll: '모두 읽음',
  loading: '알림을 불러오는 중...',
  error: '알림을 불러오지 못했습니다.',
  retry: '다시 시도',
  empty: '새로운 알림이 없어요',
  size: 20,
  /** 안 읽은 수를 다시 확인하는 간격 (ms). 페이지를 옮길 때도 확인한다. */
  pollMs: 60_000,
  unknownActor: '알 수 없는 회원',
  icons: { comment: 'chat', reply: 'reply', price_change: 'sell' } as const,
  comment: (actor: string) => `${actor}님이 내 글에 댓글을 남겼어요`,
  reply: (actor: string) => `${actor}님이 내 댓글에 답글을 남겼어요`,
  priceDown: '찜한 상품의 가격이 내렸어요',
  priceUp: '찜한 상품의 가격이 올랐어요',
  priceChange: (oldPrice: string, newPrice: string) => `${oldPrice}원 → ${newPrice}원`,
};

export const footerData = {
  socials: [
    { label: 'YouTube', icon: 'smart_display', href: 'https://youtube.com' },
    { label: 'Facebook', icon: 'public', href: 'https://facebook.com' },
    { label: 'Naver Cafe', icon: 'forum', href: 'https://cafe.naver.com' },
  ],
  businessTitle: '사업자 정보',
  businessLines: [
    '주식회사 리픽컴퍼니 | 대표이사: 홍길동 | 사업자등록번호: 120-88-00000',
    '통신판매업신고: 제2025-서울강남-01452호 | 서울특별시 강남구 테헤란로 142 아크플레이스 12층',
    '호스팅 서비스: 주식회사 리픽컴퍼니 | 고객센터: 1588-0000 (평일 09:30 - 18:30)',
  ],
  disclaimer:
    'RE:PICK(리픽)은 통신판매중개자로서 통신판매의 당사자가 아니며, 등록된 판매 물품 정보 및 거래에 대해 책임을 지지 않습니다. (단, 에스크로 및 전문 검수 보증 정책 제외)',
  supportTitle: '안내 및 지원',
  supportLinks: [
    { label: '이용약관', to: '/terms', strong: false },
    { label: '개인정보처리방침', to: '/privacy', strong: true },
    { label: '검수 기준 안내', to: '/guide', strong: false },
    { label: '시세 데이터 API', to: '/api', strong: false },
  ],
  csLabel: '고객센터 1588-0000',
  copyright: `© ${new Date().getFullYear()} RE:PICK INC. All rights reserved.`,
  footnote: 'PSA & BGS Certified Trading Cards, Limited Sneaker, Luxury Escrow Service.',
};

/** 오류 페이지 (#21) — 없는 주소(404)와 화면 오류(예상치 못한 렌더링 오류). */
export const errorPageCopy = {
  notFound: {
    code: '404',
    icon: 'search_off',
    title: '페이지를 찾을 수 없어요',
    body: '주소가 잘못되었거나, 삭제·이동된 페이지예요. 입력한 주소를 다시 확인해 주세요.',
  },
  crash: {
    code: 'ERROR',
    icon: 'error',
    title: '화면을 표시하지 못했어요',
    body: '일시적인 문제가 발생했어요. 새로고침하거나 잠시 후 다시 시도해 주세요.',
  },
  homeLabel: '홈으로',
  backLabel: '이전 페이지',
  reloadLabel: '새로고침',
  searchLabel: '판매글 검색하기',
};

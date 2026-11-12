export const ROUTES = {
  home: '/',
  login: '/login',
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
  chatCount: 2,
  alertLabel: '알림',
  alertCount: 3,
  myLabel: '마이',
  loginLabel: '로그인',
  logoutLabel: '로그아웃',
  loggingOutLabel: '로그아웃 중...',
  logoutError: '로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  nicknameSuffix: (nickname: string) => `${nickname}님`,
};

export interface NavItem {
  readonly label: string;
  readonly to: string;
  readonly icon?: string;
  readonly badge?: number;
}

export const navItems: NavItem[] = [
  { label: '시세 랭킹', to: ROUTES.market },
  { label: '찜한 상품', to: '/wishlist', badge: 4 },
  { label: '커뮤니티 토론방', to: ROUTES.community, icon: 'forum' },
];

export const liveTicker = {
  label: 'LIVE 급상승 1위',
  item: '포켓몬 카드 151 일본판 박스',
  change: '14.2%',
};

export const footerData = {
  socials: [
    { label: 'YouTube', icon: 'smart_display', href: 'https://youtube.com' },
    { label: 'Facebook', icon: 'public', href: 'https://facebook.com' },
    { label: 'Naver Cafe', icon: 'forum', href: 'https://cafe.naver.com' },
    { label: 'Instagram', icon: 'photo_camera', href: 'https://instagram.com' },
  ],
  businessTitle: '사업자 정보',
  businessLines: [
    '주식회사 리픽컴퍼니 | 대표이사: 홍길동 | 사업자등록번호: 120-88-00000',
    '통신판매업신고: 제2025-서울강남-01452호 | 서울특별시 강남구 테헤란로 142 아크플레이스 12층',
    '호스팅 서비스: 주식회사 리픽컴퍼니 | 고객센터: 1588-0000 (평일 09:30 - 18:30)',
  ],
  disclaimer:
    '트레저 허브는 통신판매중개자로서 통신판매의 당사자가 아니며, 등록된 판매 물품 정보 및 거래에 대해 책임을 지지 않습니다. (단, 에스크로 및 전문 검수 보증 정책 제외)',
  supportTitle: '안내 및 지원',
  supportLinks: [
    { label: '이용약관', to: '/terms', strong: false },
    { label: '개인정보처리방침', to: '/privacy', strong: true },
    { label: '검수 기준 안내', to: '/guide', strong: false },
    { label: '시세 데이터 API', to: '/api', strong: false },
  ],
  csLabel: '고객센터 1588-0000',
  copyright: '© 2025 RE:PICK INC. All rights reserved.',
  footnote: 'PSA & BGS Certified Trading Cards, Limited Sneaker, Luxury Escrow Service.',
};

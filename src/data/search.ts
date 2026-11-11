import { ROUTES } from './layout';

export type PriceDiffTone = 'below' | 'warning' | 'neutral';
export type ListingStatus = 'selling' | 'reserved';
export type SortKey = 'latest' | 'priceAsc' | 'priceDesc' | 'popular';

export interface Breadcrumb {
  readonly label: string;
  readonly to?: string;
}

export interface CategoryOption {
  readonly id: string;
  readonly label: string;
  /** Render a thin divider before this option. */
  readonly dividerBefore?: boolean;
}

export interface CheckOption {
  readonly id: string;
  readonly label: string;
}

export interface PricePreset {
  readonly id: string;
  readonly label: string;
  readonly min: number | null;
  readonly max: number | null;
}

export interface SortOption {
  readonly key: SortKey;
  readonly label: string;
}

export interface Listing {
  readonly id: string;
  readonly series: string;
  readonly postedAgo: string;
  /** Minutes since posting — used for 최신순 sorting. */
  readonly postedMinutes: number;
  readonly title: string;
  readonly price: number;
  readonly priceDiff: string;
  readonly priceDiffTone: PriceDiffTone;
  readonly cautionLabel?: string;
  readonly status: ListingStatus;
  readonly likes: number;
  readonly wished: boolean;
  readonly imageUrl: string;
  readonly imageAlt: string;
}

export const searchDefaults = {
  query: '리자몽',
};

export const searchHeaderData = {
  resultLabel: '검색 결과',
  totalPrefix: '총',
  totalSuffix: '개',
  breadcrumbs: [
    { label: '홈', to: ROUTES.home },
    { label: '트레이딩 카드', to: `${ROUTES.search}?category=trading-card` },
    { label: '포켓몬 카드' },
  ] as readonly Breadcrumb[],
};

export const filterLabels = {
  category: { label: '카테고리', icon: 'category' },
  grade: { label: '등급', icon: 'verified', badge: '활성', hint: '카드 카테고리 전용 필터 적용 중' },
  size: { label: '사이즈', icon: 'straighten', badge: '비활성', hint: '(운동화 선택 시 활성화)' },
  price: {
    label: '가격',
    icon: 'payments',
    minPlaceholder: '최소 가격',
    maxPlaceholder: '최대 가격',
    unit: '원',
    apply: '적용',
  },
  options: {
    label: '옵션',
    icon: 'tune',
    excludeSold: '거래완료 제외',
    conditionLabel: '상품 상태:',
    tradeLabel: '거래 방식:',
    reset: '필터 초기화',
  },
};

export const categoryOptions: readonly CategoryOption[] = [
  { id: 'all', label: '전체' },
  { id: 'card-pokemon', label: '카드 > 포켓몬', dividerBefore: true },
  { id: 'onepiece', label: '원피스' },
  { id: 'sports', label: '스포츠' },
  { id: 'yugioh', label: '유희왕' },
  { id: 'sneakers-jordan', label: '운동화 > 조던', dividerBefore: true },
  { id: 'collab', label: '콜라보' },
  { id: 'dunk', label: '덩크' },
  { id: 'luxury', label: '명품', dividerBefore: true },
];

export const gradeOptions: readonly CheckOption[] = [
  { id: 'psa10', label: 'PSA 10' },
  { id: 'psa9', label: 'PSA 9' },
  { id: 'bgs95', label: 'BGS 9.5 이상' },
  { id: 'sealed', label: '미개봉' },
  { id: 'ungraded', label: '그레이딩 없음' },
];

export const sizeOptions: readonly CheckOption[] = [
  { id: 's230', label: '230 이하' },
  { id: 's235', label: '235~250' },
  { id: 's255', label: '255~265' },
  { id: 's270', label: '270~280' },
  { id: 's285', label: '285 이상' },
];

export const pricePresets: readonly PricePreset[] = [
  { id: 'lt10', label: '10만 이하', min: null, max: 100000 },
  { id: '10to50', label: '10만-50만', min: 100000, max: 500000 },
  { id: '50to100', label: '50만-100만', min: 500000, max: 1000000 },
  { id: 'gt100', label: '100만 이상', min: 1000000, max: null },
];

export const conditionOptions: readonly CheckOption[] = [
  { id: 'new', label: '새상품' },
  { id: 'used', label: '중고' },
];

export const tradeOptions: readonly CheckOption[] = [
  { id: 'direct', label: '직거래' },
  { id: 'delivery', label: '택배' },
];

export const initialFilterState = {
  categoryId: 'card-pokemon',
  grades: ['psa10', 'psa9', 'sealed'] as readonly string[],
  priceMin: '50,000',
  priceMax: '5,000,000',
  excludeSold: true,
  conditions: [] as readonly string[],
  trades: ['direct', 'delivery'] as readonly string[],
};

export const sortOptions: readonly SortOption[] = [
  { key: 'latest', label: '최신순' },
  { key: 'priceAsc', label: '낮은 가격순' },
  { key: 'priceDesc', label: '높은 가격순' },
  { key: 'popular', label: '인기순 (찜·조회수)' },
];

export const sortBarData = {
  countSuffix: '건',
  countText: '의 매물이 등록되어 있습니다.',
  badge: '정품 안심 검수 보증',
};

export const listingLabels = {
  wishAria: '찜하기',
  currency: '원',
  status: { selling: '판매중', reserved: '예약중' } as Record<ListingStatus, string>,
};

export const paginationData = {
  totalItems: 128,
  pageSize: 10,
  windowSize: 5,
  navAria: '검색 결과 페이지 이동',
  prevAria: '이전 페이지',
  nextAria: '다음 페이지',
  summaryPrefix: '총',
  summaryMiddle: '개의 등록 상품 중',
  summarySuffix: '번째 표시',
};

export const escrowBanner = {
  icon: 'verified_user',
  title: '리픽 100% 안심 에스크로 & 전문 그레이딩 감정',
  description: 'PSA, BGS 인증 카드는 검수 센터에서 위변조 및 홀로그램 시리얼 정밀 대조 후 구매자에게 안전 배송됩니다.',
  linkLabel: '검수 기준표 보기',
  linkTo: '/guide',
};

export const listings: readonly Listing[] = [
  {
    id: 'charizard-ex-sar-shiny-treasure-psa10',
    series: '샤이니트레저 ex',
    postedAgo: '30분 전',
    postedMinutes: 30,
    title: 'PSA 10 리자몽 ex SAR (샤이니트레저 ex 331/190)',
    price: 300000,
    priceDiff: '시세 대비 -6.3%',
    priceDiffTone: 'below',
    status: 'selling',
    likes: 24,
    wished: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwfJQzIlxFbybpTYPun2__FGqa3m_V0sj3AyTjiZ8FrWuj_HTWiBrW3fHCUP5urzh6HVAEavvXxRz7VC3jFYVIs4Ha-TCbC8YozigR2JiGq2nRLkEEAl7SwaxLPd-lOaxokaV2ClMHfATMSgcz2Uaw0R6dK0G5Em2MiNOIzJAJVPWIEWEqaunO-w7B2qMImQUuXxLQ-6m5KLn_FUw68AaKuYSGLtJEe2iXFsSg72Y',
    imageAlt:
      'A pristine PSA 10 gem mint graded Pokemon card featuring Charizard ex SAR from Shiny Treasure ex in a transparent protective acrylic slab with clean red PSA label on top, sharp studio lighting with neutral soft reflections',
  },
  {
    id: 'charizard-25th-promo-sealed',
    series: '25주년 프로모',
    postedAgo: '2시간 전',
    postedMinutes: 120,
    title: '25주년 프로모 리자몽 (미개봉 슬리브 보관)',
    price: 185000,
    priceDiff: '시세 대비 -12.4%',
    priceDiffTone: 'warning',
    cautionLabel: '시세보다 매우 낮음 (주의 요망)',
    status: 'selling',
    likes: 48,
    wished: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvyjf1CDsMKNHUhpO-Y-d0ByeH9EPbFqVSGf5pn7-KJ4QjRXgvj_17EuoywJMhjwA7B1ShbDRC-hHxTY7PUYRvsYfLJL2SBRxy_p_NWjzKLU8LMzIPLFcsFBqOibdSBj4eKxIgpXU9fXr2GXNic0G8qjtn1TzeNfUSi8kG5q6yteaBWUWp_yMJE7n-7BoCPSVxk10l7WNBFtdiSBU3WCp6aetgvCLS7vsiHOqy2-8',
    imageAlt:
      'Pokemon 25th Anniversary edition promo Charizard card in a protective semi-rigid clear sleeve unpeeled and factory sealed, vibrant orange fire artwork shining brightly under high contrast clean editorial studio spotlight',
  },
  {
    id: 'charizard-ex-sar-151-sv2a',
    series: '포켓몬 151 [SV2a]',
    postedAgo: '4시간 전',
    postedMinutes: 240,
    title: '포켓몬 151 리자몽 ex SAR [SV2a 201/165] 일판 S급',
    price: 280000,
    priceDiff: '시세 대비 -5.0%',
    priceDiffTone: 'below',
    status: 'selling',
    likes: 15,
    wished: false,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtj5hZfdsHZJOYIMFQGwsUbAGCUqaG41y-B_g5sxe0kevN67C3Vs8AsLBr8Mw4ZQDNcjw9DvERFHFR7ecLWeVzwXGCjfdLO5NAdzYCpSh6nS4LxVwQAnXc-SbGyBzeBaTfc044658jvt1T_BcAlQxRXeIbMTaE1lOQ2vgCFQGTiXfg06ukVvNDqkSIMTzqkT9JhWnyNwUPK7Oy6YIz2TnmjvD3cqWkOOocQXC7Td0',
    imageAlt:
      'Pokemon 151 Japanese expansion booster special illustration rare Charizard ex card, glowing fiery background canyon scenery, ultra-high resolution trading card centered inside minimalist gray setting',
  },
  {
    id: 'charizard-base-set-1st-shadowless-psa9',
    series: '베이스셋 초판',
    postedAgo: '1일 전',
    postedMinutes: 1440,
    title: '베이스셋 초판 섀도리스 리자몽 PSA 9 (전문 검수 센터 입고)',
    price: 4200000,
    priceDiff: '시세 대비 +1.2%',
    priceDiffTone: 'neutral',
    status: 'selling',
    likes: 112,
    wished: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1A9C6rN7X3QwIeLkA44EJ-BBqR48u63zKYHHP77JzPwfEOlF91MeWFdraU3-pLTk3hUvAT4PHRTDqNha7UFGYCvv1pZam8sv3EMC5cuEW0PYH0uumBsCO5yUYqwugdB0Py_Qo0FlTjwR-7JF2kS6Vj6M5LRSELUpVKPekmzew7Ixv7ISTREW3jE1siE20ELBXJ3XTyrSDY_4TnUNJtSSNq3ivH23hpdWo9YgndE',
    imageAlt:
      'Grail rare vintage 1999 Pokemon Base Set 1st Edition Shadowless Charizard holographic card graded PSA 9 mint condition in iconic certified case, pristine collectible presentation on deep emerald velvet surface',
  },
  {
    id: 'dark-charizard-team-rocket-psa9',
    series: '로켓단 팀 확장팩',
    postedAgo: '1일 전',
    postedMinutes: 1500,
    title: '다크 리자몽 홀로 1st 에디션 일본판 PSA 9',
    price: 520000,
    priceDiff: '시세 대비 -4.1%',
    priceDiffTone: 'below',
    status: 'selling',
    likes: 31,
    wished: false,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQEHxXV1oenBlvBwZL0Wt9hTsRfeB9GL0DAZ4vPyo88-70KDtyZWPCF6A7sZ1uA2MGF6d9b4z349IqI5X2-v-6hM8WHysTdTuyVoa9I4XA1cRqhm31E57li_xXjWG5Ds5lJp4GiVj32pqxEYHEBq2ZZ40NTG9RzDrHZRTggEZa8qaVc_0yaCv2whWuwwWwzcrPxKTxi2lb9TcWPG6samRvr2r5mPYu6ATTPKvhVsg',
    imageAlt:
      'Vintage Team Rocket expansion Dark Charizard holographic Pokemon card encased in PSA 9 grade certified plastic slab, moody dark art design with foil reflection highlights under gallery lighting',
  },
  {
    id: 'shiny-charizard-vmax-bgs95',
    series: '샤이니스타V',
    postedAgo: '2일 전',
    postedMinutes: 2880,
    title: 'BGS 9.5 샤이니스타 V 이로치 리자몽 VMAX SSR',
    price: 340000,
    priceDiff: '시세 대비 -2.8%',
    priceDiffTone: 'below',
    status: 'selling',
    likes: 56,
    wished: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjBLL5I9b0J52dMuoe7rFK-JM9e-KKmi3yu1y_GWTGutI8VxaGGguVBIkP7Ao_-GOw6AxwqSHwTrjfExDfUW5VGSJuH2aJe5Fp1dGoeWFIytsgcYrLovwWmXmRbPKWbB6h0x1UNbFcR_mVP4sXoJM45gj_ECb3rkGvA_y_V5UxU8YYLeEoOCJZp4DyeKCZMiRUqQDhs05RKO7OsatPmMWDJuqm_M-zgrc6OAHr6ik',
    imageAlt:
      'Beckett BGS 9.5 Gem Mint graded shiny black Charizard VMAX Pokemon card with premium metallic gold subgrade label slab, crystal clear high key modern studio photography',
  },
  {
    id: 'charizard-v-sa-brilliant-stars-psa10',
    series: '스타버스 영문판',
    postedAgo: '3일 전',
    postedMinutes: 4320,
    title: 'PSA 10 리자몽 V 특일 SA (Brilliant Stars #154)',
    price: 295000,
    priceDiff: '시세 대비 -7.2%',
    priceDiffTone: 'below',
    status: 'selling',
    likes: 19,
    wished: false,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVerSqqeFRVqQnuIsRSD-K7tVPICVnMblz_SpX5-0kFKjUEVsn14huFiG7U89NzdlLfibS-gjQQnu16GRoAsry0t12Ir0tfzaY3MigIgOV4IiEdxFN-L__6iYLIfJUf4a-AUGQGo3E_aqyS4yHYBzVZ1l2xzOubRP4WCSSn7Lj_SYxxVtW3C7YCpOdHDkradc_m80HXZD7SJY9uxJjuHp8BguLD69ZfS3fC1JFni4',
    imageAlt:
      'Charizard V Alternate Art Pokemon card from Brilliant Stars featuring battle confrontation with Venusaur in pristine PSA 10 certified case, high contrast vivid color rendering',
  },
  {
    id: 'charizard-classic-deck-set',
    series: '포켓몬 클래식',
    postedAgo: '3일 전',
    postedMinutes: 4400,
    title: '포켓몬 카드 게임 클래식 리자몽 덱 60장 완제 세트',
    price: 410000,
    priceDiff: '시세 대비 0.0%',
    priceDiffTone: 'neutral',
    status: 'reserved',
    likes: 67,
    wished: false,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7midesaepXl62hni4h4dUPOAYVWMrA3awaPskykZL_8MJ8piwnuLIq1cdI4B2CJBq63X6r2TUnd7_mi-4Z82jw0v5jPQxjwQESOFYHoBT3k5G9D1zCA26ADqD4febCm_FeqvGvSPQg3-A5p_bc4Bupr5363MR_ge3K0HhntYG6YD_shfjHoi5ZCc_fuILz-zYlo4NZgNYhtTqNAXeNL8hlFpFTvuRJ2WnWZ1Fjho',
    imageAlt:
      'Pokemon Trading Card Game Classic edition Charizard holo deck card in pristine unopened black premium frame display, elegant studio setting with warm directional rim lighting',
  },
  {
    id: 'terastal-dark-charizard-ex-sar-psa10',
    series: '흑염의 지배자',
    postedAgo: '5일 전',
    postedMinutes: 7200,
    title: 'PSA 10 테라스탈 악 리자몽 ex SAR (SV3 134/108) 일판',
    price: 260000,
    priceDiff: '시세 대비 -8.5%',
    priceDiffTone: 'below',
    status: 'selling',
    likes: 42,
    wished: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAo2lj0tOvmgxs4Xs6kC6vCRxFsTwoDc3W78xYpiGucTuuoDFYzNySKAvkw0LYbl-Egy0dTPg-1KtDAQ-a0BVytx_ugGbiwHOtfIuPchE0DCg4kpFFJ-0SxqP-OyYAFUilYLl_IqP8ctrhfwxwf7dmgf3NF2h3-EWq4bFXjc8-0vCue6WyIA1lg6dq-w4lS8zoUVRQEnCWi-jBhddQn4b5NdLuCOYrK9Vab_T23gO4',
    imageAlt:
      'Terastal Dark Charizard ex SAR card from Ruler of the Black Flame expansion in PSA 10 graded slab, crystalline crown headpiece shimmering with holographic foil pattern',
  },
  {
    id: 'pokemon-151-booster-box-sealed',
    series: '포켓몬 151 박스',
    postedAgo: '9일 전',
    postedMinutes: 12960,
    title: '포켓몬 카드 151 미개봉 슈링크 박스 (일판 20팩입)',
    price: 190000,
    priceDiff: '시세 대비 +0.5%',
    priceDiffTone: 'neutral',
    status: 'selling',
    likes: 89,
    wished: false,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAB0F-JmEsgSRX9GipIQ2yhVNDN35ZTpSmXkvrpIJipKMtYvTUymp-lfqhrd2aRceg-YLFBWXgCRWQOOLrEd448_jI7360hX8ukhdvwanyjvXSb6CSFAoPUCl4V2I4lzlnAPUElZuB7y9KsTGE17v_oOCIGpOkavraGnMAMTMB3LAZfxbWKnc4QZKF9vc3r-8rTvHXiCE5YlR56dqPGsIgM98ffb9TLfSPUNkBzDJk',
    imageAlt:
      'Factory sealed Pokemon Card 151 Japanese booster box featuring Charizard on packaging art with intact shrink wrap sealing tape and holographic authentication seal',
  },
];

import { ROUTES } from './layout';

export type PriceDiffTone = 'below' | 'warning' | 'neutral';
export type ListingStatus = 'selling' | 'reserved' | 'sold';
export type SortKey = 'latest' | 'priceAsc' | 'priceDesc' | 'popular';

export interface Breadcrumb {
  readonly label: string;
  readonly to?: string;
}

export interface CategoryOption {
  readonly id: string;
  readonly label: string;
  /** LISTING-01 category 파라미터(categories.code). 없으면 전체. */
  readonly code?: string;
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
  readonly title: string;
  readonly price: number;
  readonly priceDiff: string;
  readonly priceDiffTone: PriceDiffTone;
  readonly cautionLabel?: string;
  readonly status: ListingStatus;
  readonly likes: number;
  readonly wished: boolean;
  /** 판매 사진·품목 이미지가 모두 없으면 null → 카드에 빈 이미지 표시. */
  readonly imageUrl: string | null;
  readonly imageAlt: string;
}

export const searchHeaderData = {
  resultLabel: '검색 결과',
  /** 검색어 없이 들어왔을 때 제목 (카테고리를 고르면 카테고리 이름). */
  allTitle: '전체 판매글',
  totalPrefix: '총',
  totalSuffix: '개',
  home: { label: '홈', to: ROUTES.home } as Breadcrumb,
};

export const filterLabels = {
  category: { label: '카테고리', icon: 'category' },
  grade: {
    label: '등급',
    icon: 'verified',
    badge: '활성',
    disabledBadge: '비활성',
    hint: '카드 카테고리 전용 필터',
    disabledHint: '(카드 카테고리 선택 시 활성화)',
  },
  size: {
    label: '사이즈',
    icon: 'straighten',
    badge: '활성',
    disabledBadge: '해당 없음',
    hint: '운동화 카테고리 전용 필터',
    disabledHint: '(운동화 카테고리 선택 시 활성화)',
  },
  price: {
    label: '가격',
    icon: 'payments',
    minPlaceholder: '최소 가격',
    maxPlaceholder: '최대 가격',
    unit: '원',
    apply: '적용',
    rangeError: '최소 가격이 최대 가격보다 클 수 없습니다.',
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

/** 카테고리 칩 문구. 칩 목록 자체는 DB 카테고리(ITEM-01)로 만든다. */
export const categoryFilterCopy = {
  all: '전체',
  topSuffix: ' 전체',
};

/** 등급 필터가 의미 있는 대분류 (카드). 그 밖의 대분류를 고르면 등급 필터를 끈다. */
export const CARD_CATEGORY_CODE = 'cards';

/** 사이즈 필터가 의미 있는 대분류 (운동화). 운동화를 고를 때만 사이즈 필터를 켠다. */
export const SNEAKER_CATEGORY_CODE = 'sneakers';

export const gradeOptions: readonly CheckOption[] = [
  { id: 'psa10', label: 'PSA 10' },
  { id: 'psa9', label: 'PSA 9' },
  { id: 'bgs95', label: 'BGS 9.5 이상' },
  { id: 'sealed', label: '미개봉' },
  { id: 'ungraded', label: '그레이딩 없음' },
];

/** 운동화 사이즈(mm) 구간. id를 LISTING-01 sizes 값으로 그대로 보낸다. */
export const sizeOptions: readonly CheckOption[] = [
  { id: 'le230', label: '230 이하' },
  { id: '235-250', label: '235~250' },
  { id: '255-265', label: '255~265' },
  { id: '270-280', label: '270~280' },
  { id: 'ge285', label: '285 이상' },
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

/**
 * 검색 조건은 모두 주소(/search?...)에 둔다 — 새로고침·뒤로가기·링크 공유 때 그대로 유지된다.
 * 비어 있는 값은 "제한 없음"이고 주소에서 뺀다. 거래완료는 기본으로 제외(REQ-LIST-006)라
 * 포함할 때만 includeSold=1을 붙인다.
 */
export const SEARCH_PARAM = {
  q: 'q',
  category: 'category',
  grades: 'grades',
  sizes: 'size',
  states: 'state',
  trades: 'trade',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  includeSold: 'includeSold',
  sort: 'sort',
  page: 'page',
} as const;

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

/** 등급 체크박스 → LISTING-01 파라미터. 그레이딩 등급은 grades, 미개봉·노슬랩은 condition으로 보낸다. */
export const gradeFilterParams: Readonly<
  Record<string, { readonly grades?: readonly string[]; readonly condition?: 'unopened' | 'opened_raw' }>
> = {
  psa10: { grades: ['PSA-10'] },
  psa9: { grades: ['PSA-9'] },
  bgs95: { grades: ['BGS-9.5', 'BGS-10'] },
  sealed: { condition: 'unopened' },
  ungraded: { condition: 'opened_raw' },
};

/** P-009 API 연동 문구. */
export const searchApiCopy = {
  loading: '검색 결과를 불러오는 중입니다...',
  empty: '조건에 맞는 판매글이 없습니다.',
  emptyHint: '검색어나 필터를 바꿔 보세요.',
  error: '검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  retry: '다시 시도',
  resetFilters: '필터 초기화',
  priceDiff: (rate: number) => `시세 대비 ${rate > 0 ? '+' : ''}${rate}%`,
  noMarket: '시세 정보 없음',
  caution: '시세보다 매우 낮음 (주의 요망)',
};

export const listingLabels = {
  wishAria: '찜하기',
  currency: '원',
  status: { selling: '판매중', reserved: '예약중', sold: '거래완료' } as Record<ListingStatus, string>,
};

export const paginationData = {
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

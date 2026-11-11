/** Static copy, option lists and mock values for the listing create (P-014) / edit (P-015) form. */

export type FormVariant = 'create' | 'edit';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  /** Shorter label used by the compact (edit) layout. */
  readonly shortLabel?: string;
}

export interface ListingPhoto {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  /** Top-left badge text (e.g. 후면). The first photo always shows the 대표 사진 badge. */
  readonly label: string;
  /** Bottom-right caption (e.g. 정면 01). */
  readonly caption?: string;
}

export type ItemCondition = 'unopened' | 'opened_raw' | 'graded';

export interface ListingAttributes {
  readonly setName: string;
  readonly cardNo: string;
  readonly language: string;
  readonly rarity: string;
  readonly condition: ItemCondition;
  readonly gradingService: string;
  readonly grade: string;
}

export interface ListingFormValues {
  readonly photos: readonly ListingPhoto[];
  readonly authPhoto: ListingPhoto | null;
  readonly mainCategory: string;
  readonly subCategory: string;
  readonly catalogQuery: string;
  readonly catalogMatch: string | null;
  readonly attributes: ListingAttributes;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly delivery: boolean;
  readonly direct: boolean;
  readonly directLocation: string;
  readonly agreed: boolean;
}

export const MAX_PHOTOS = 10;
export const MAX_DESCRIPTION = 1000;
export const MARKET_PRICE = 320000;
/** Listing more than this ratio below market price raises the fraud warning flag. */
export const FRAUD_THRESHOLD_RATIO = 0.3;
export const NEW_LISTING_ID = 'RPC-2025-NEW';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export const mainCategoryOptions: readonly SelectOption[] = [
  { value: 'card', label: '트레이딩 카드 (TCG)' },
  { value: 'sneaker', label: '한정판 스니커즈 (운동화)' },
  { value: 'luxury', label: '하이엔드 명품 / 워치' },
];

export const subCategoryOptions: Readonly<Record<string, readonly SelectOption[]>> = {
  card: [
    { value: 'pokemon', label: '포켓몬 카드 (Pokemon)', shortLabel: '포켓몬 카드 (Pokemon TCG)' },
    { value: 'yugioh', label: '유희왕 (Yu-Gi-Oh!)' },
    { value: 'onepiece', label: '원피스 카드 게임' },
    { value: 'sports', label: '스포츠 수집 카드 (NBA/MLB)' },
    { value: 'magic', label: '매직 더 개더링 (MTG)' },
  ],
  sneaker: [
    { value: 'nike', label: '나이키 / 조던' },
    { value: 'adidas', label: '아디다스 / 이지' },
    { value: 'newbalance', label: '뉴발란스' },
  ],
  luxury: [
    { value: 'watch', label: '하이엔드 워치' },
    { value: 'bag', label: '명품 가방 / 잡화' },
  ],
};

export const languageOptions: readonly SelectOption[] = [
  { value: 'ko', label: '한국어 (Korean)', shortLabel: '한국어 (KOR)' },
  { value: 'ja', label: '일본어 (Japanese)', shortLabel: '일본어 (JPN)' },
  { value: 'en', label: '영어 (English)', shortLabel: '영어 (ENG)' },
  { value: 'zh', label: '중국어 (Simplified Chinese)', shortLabel: '중국어 (CHN)' },
];

export const rarityOptions: readonly SelectOption[] = [
  { value: 'SAR', label: 'SAR (스페셜 아트 레어)', shortLabel: 'SAR (스페셜 아트)' },
  { value: 'UR', label: 'UR (울트라 레어)' },
  { value: 'SR', label: 'SR (슈퍼 레어)' },
  { value: 'AR', label: 'AR (아트 레어)' },
  { value: 'etc', label: '기타 레어리티' },
];

export const gradingServiceOptions: readonly SelectOption[] = [
  { value: 'PSA', label: 'PSA (Professional Sports Authenticator)', shortLabel: 'PSA' },
  { value: 'BGS', label: 'BGS (Beckett Grading Services)', shortLabel: 'BGS' },
  { value: 'CGC', label: 'CGC (Certified Guaranty Company)', shortLabel: 'CGC' },
  { value: 'BRG', label: 'BRG (Break Research Group)', shortLabel: 'BRG' },
];

export const gradeOptions: readonly SelectOption[] = [
  { value: '10', label: '10 (Gem Mint)', shortLabel: 'GEM MT 10 (완전 무결)' },
  { value: '9.5', label: '9.5 (Mint+)', shortLabel: 'MINT+ 9.5' },
  { value: '9', label: '9 (Mint)', shortLabel: 'MINT 9' },
  { value: '8.5', label: '8.5 (Near Mint-Mint+)', shortLabel: 'NM-MT+ 8.5' },
  { value: '8', label: '8 (Near Mint-Mint)', shortLabel: 'NM-MT 8' },
  { value: '7', label: '7 이하', shortLabel: '7 이하' },
];

export interface ConditionOption {
  readonly value: ItemCondition;
  readonly label: string;
  readonly shortLabel: string;
}

export const conditionOptions: readonly ConditionOption[] = [
  { value: 'unopened', label: '미개봉 (Unopened Box/Pack)', shortLabel: '미개봉(씰)' },
  { value: 'opened_raw', label: '개봉 노슬랩 (Raw Card)', shortLabel: '개봉 노슬랩' },
  { value: 'graded', label: '공인 그레이딩 인증 슬랩 (Graded)', shortLabel: '개봉 후 그레이딩 슬랩' },
];

/** Edit mode only offers sealed vs graded, and a graded slab cannot revert to sealed. */
export const editConditionVisible: readonly ItemCondition[] = ['unopened', 'graded'];
export const editConditionDisabled: readonly ItemCondition[] = ['unopened'];

export const quickPriceSteps: readonly { readonly label: string; readonly amount: number }[] = [
  { label: '+1만', amount: 10000 },
  { label: '+5만', amount: 50000 },
  { label: '+10만', amount: 100000 },
];

// ---------------------------------------------------------------------------
// Images (from Stitch export)
// ---------------------------------------------------------------------------

export const createSamplePhotos: readonly ListingPhoto[] = [
  {
    id: 'c-1',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGvX0ff95trJj5WDKPLSegAXG7q7L-M9bee3JYav-8199Jktj4gkPyDMSWsasgaBqVUL6RfSbQM-wrT3oZvWk6bu2tx6LIfIvYmX4HdiobwgdmV7CdQddOtuM5ypjViEPVvfteTC5C0jglKhnYCzyY4r28sxFSUvRk-9nsjTp-XG_Cdn0H-IHJZH-K0FFE6JUyTLRuIZJqovEisqy3UoXa4_pcv7q2t3tWUvdVTu0',
    alt: 'Close up sharp photograph of Pokemon 151 Charizard ex SAR PSA 10 graded slab in crystal acrylic case with golden authentication stamp',
    label: '정면',
    caption: '정면 01',
  },
  {
    id: 'c-2',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK-m7LLPnEGrjFFVw7nXSqTXyRzTx13QTKh6kPb9vz981VLPicFwC0dYJuM3ovrsTe_VcSa_hFPCEZ3LfRALSsuUVD93C12koEbK4eE4dgsvVtLA4p_fkBnnEhV22hoswxro4jj8Ss1KkBqh3vYEeofxOQV7uk0uTnwy42U_pfkM4E0BGDRGJjpO1aSx_bZU9kOX2vqqdaK9C7UJTVlhda1msIfe1nbSJyHBhFQIU',
    alt: 'Reverse angle high resolution macro shot of PSA 10 graded trading card back side hologram seal and serial number detail',
    label: '후면',
    caption: '후면 02',
  },
  {
    id: 'c-3',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYI8JbuIxJC9cO274G0gToMsLkIedOQi00ROhthdrQDXc8YIt0r1lkZc8C3HjiXhNT6OTA_v2cnOabzkpxNPAYoAYpy7Ab1qRBGBz025ytuB2BVTTuixzr1CwWlLx-9qsm9leZgURAfzvPmb-F8b19O1eQdBN2uOIPkVLxMmGqUEOBlceW8D3hu2jIzqEXWuQLuGF3xqHRZBQovyFIkfuN6ErV_G89wIoLZAwZgpI',
    alt: 'Extreme macro shot of upper corner edges of Japanese trading card slab showing zero whitening or micro scratches',
    label: '상세 코너',
    caption: '모서리 03',
  },
];

/** Example auth-slip photo shown in the create form until the seller uploads their own. */
export const createAuthSamplePhoto: ListingPhoto = {
  id: 'c-auth',
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAleTMbndLQx5pOg-B4ag0Q966-VjxCGNZ-TRtsnHjelLxf8G0Bc7h92skmAJf7G2RKnNF91X6mHZu842CjGApWnzqavTusV0I1bSO5odo4bLzAcmSQSVspUdVGop8HqChcdpTHv4wU0Z-ByA3ZtcQ_1cVIYxDXbysQTtZdVS0RN1NdpLtjTTQ-8ep3PvPRoJps4feZovLl34KxWMi5mHMh41tqFOKjacIJLSCpt34',
  alt: 'Handwritten memo slip reading nickname REPICK_PRO and today date placed neatly beside an acrylic graded trading card case',
  label: '실물인증',
};

const editPhotos: readonly ListingPhoto[] = [
  {
    id: 'e-1',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1flcYEJ3fSC4J5M1jjDei8_GcHZrI9lQkvmkYRKv7kHdH-kZ_WU0o0zTDc0KWLeuMJSoRAFWzFr6Im4V2NRVcRKKeyLM0qUNMybW368PBZWm5CJBSaKTCYdhKSCBT64Xj5ZgmLunBUdOv7ghXV2zL-UbScrXZvW8lD-DITRNdFLYFGsBU7KB8MR5Wx8EbxgB9X4L0ukvy1Su2DaptEk0RXvPHNxct3nppwKGy0Nc',
    alt: 'PSA graded Charizard ex Special Art Rare pokemon card slab encased in pristine crystal clear plastic container with red PSA gem mint 10 certification label on neutral desk studio lighting',
    label: '정면',
  },
  {
    id: 'e-2',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0PE-ZLA4kZIUIRrRO8yMlpK62ukOyKeBeQufy2aA9ko8tggYrbavRk0EVu0fjJg0qPWceukKDEfjLyGpZEupnqKPGUbl9J9E2ca4ZvyI_CRsm7t_9ZOF9f__pMKdEgK7XijKNIVr8uFjSPmHZEBiewcHGGa4hqZgP8AAdN3rjA9FPLYmj13ADgdAk90fq0FKzMYCKLg0d0bFgxUbXJTmH5DGuZM4aibHLwPAGBCo',
    alt: 'Backside of graded PSA pokemon card showing standard blue Japanese or Korean Pokemon card back pattern through clear PSA slab under inspection loupe lamp',
    label: '후면',
  },
  {
    id: 'e-3',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1XZh0CbSFl0980towjeJ2-0izOV3Taqp7W97EgoVE4Vkh9QSzbYCLfLZIRcnJvQSW-OFrzPymgy-BVpnU6irvEwxxNPvSn4XzlyqHRTRZm-6_tt5ooiyZ0AL3GofbSjmY6bU4Wa4SBeR8afWkqxDxR8ZIkWTrpc7SmTnett5zZNG6n05fUgUCqkO5BeSqpIYC0B-p_DWG7APMqXvqagFeZJVqcpzNpRF8poeknbA',
    alt: 'Macro high-resolution close-up of graded card corner showing sharp pristine edges without whitening or foil scratches under sharp studio focus',
    label: '상세 코너',
  },
];

const editAuthPhoto: ListingPhoto = {
  id: 'e-auth',
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQCJzNuOOcwkBxuW9zIwXMJIcDiUI4vz95cCS5SRiJOAvs7y2RAr0D9UuxrcR_yqI16NtQlBBAPY6ggzUBXcTFlC8ThSoogdEsXjvCWYUIzPPfF4zImzWM98cKuL5T1n7sTn6C01F4nNilzYyLAvGLOyPoo-bAgtaInO1XxTkVBDWYDdRXAXz-5c2AmT97U8xiEjzW3jZy5-UEcRgJ9vwD1FOgLCvIZCVD6SHQmSk',
  alt: 'Trading card slab placed beside hand-written paper note showing user nickname REPICK_PRO and today date timestamp on light wooden desk',
  label: '실물인증',
};

// ---------------------------------------------------------------------------
// Initial values
// ---------------------------------------------------------------------------

export const emptyListingValues: ListingFormValues = {
  photos: [],
  authPhoto: null,
  mainCategory: 'card',
  subCategory: 'pokemon',
  catalogQuery: '',
  catalogMatch: null,
  attributes: {
    setName: '',
    cardNo: '',
    language: 'ko',
    rarity: 'SAR',
    condition: 'graded',
    gradingService: 'PSA',
    grade: '10',
  },
  title: '',
  price: 0,
  description: '',
  delivery: true,
  direct: false,
  directLocation: '',
  agreed: false,
};

export interface EditListingMock {
  readonly registrationNo: string;
  readonly originalPrice: number;
  readonly wishCount: number;
  readonly values: ListingFormValues;
}

/** Mock fetch for the edit page (prefilled listing). */
export const getEditListingMock = (id: string): EditListingMock => ({
  registrationNo: id || 'RPC-2025-08914',
  originalPrice: 320000,
  wishCount: 38,
  values: {
    photos: editPhotos,
    authPhoto: editAuthPhoto,
    mainCategory: 'card',
    subCategory: 'pokemon',
    catalogQuery: '리자몽 ex SAR #201',
    catalogMatch: '리자몽 ex SAR (스칼렛&바이올렛 151 #201/165)',
    attributes: {
      setName: 'SV2a 포켓몬 151',
      cardNo: '201/165',
      language: 'ko',
      rarity: 'SAR',
      condition: 'graded',
      gradingService: 'PSA',
      grade: '10',
    },
    title: '[PSA 10] 포켓몬 151 리자몽 ex SAR 민트급 풀박스 소장품',
    price: 295000,
    description:
      '공식 카드 팩에서 개봉 직후 슬리브와 탑로더에 이중 보관 후 PSA 일본 지사로 정밀 등급 접수 진행했던 정품입니다.\n\nGEM MT 10 최고 등급 판정받고 수령 즉시 UV 차단 슬랩 슬리브를 씌워 전용 제습 보관함(습도 45% 유지)에서만 안전하게 보관했습니다. 슬랩 케이스 자체에도 기스나 지문 일절 없습니다.\n\n카드 모서리 백화(Whitening)나 센터링 치우침 없는 최상급 개체입니다. 100% 에스크로 안심 검수 거래 환영합니다.',
    delivery: true,
    direct: true,
    directLocation: '서울 관악구 남현동 (사당역 인근)',
    agreed: true,
  },
});

/** Mock catalog lookup used by the create page's 공식 품목 DB 검색. */
export const catalogLookup = (query: string): string | null => {
  const q = query.trim();
  if (!q) return null;
  return `포켓몬 카드 151 - ${q.includes('리자몽') ? '리자몽 ex SAR (201/165)' : q}`;
};

// ---------------------------------------------------------------------------
// Copy — create (P-014)
// ---------------------------------------------------------------------------

export const createHeaderCopy = {
  code: 'P-014',
  title: '판매글 등록',
  subtitle: '| 안전 수집품 직거래 & 전문 에스크로 검수 등록',
  features: [
    { icon: 'verified', label: '실물 인증 필수' },
    { icon: 'analytics', label: '실시간 시세 연동' },
    { icon: 'lock', label: '에스크로 보증' },
  ],
} as const;

export const photoCopy = {
  create: {
    title: '상품 사진 등록',
    hint: '(최대 10장, 첫 장이 대표 사진으로 자동 지정됩니다)',
    countSuffix: '장 완료',
    addLabel: '사진 추가',
    addIcon: 'photo_camera',
    dragHint: '사진을 마우스로 끌어서 순서를 변경할 수 있습니다. 첫 번째 사진이 목록 대표 썸네일로 노출됩니다.',
  },
  edit: {
    title: '상품 사진 관리',
    hint: '대표 사진 및 등록 순서를 드래그하여 변경할 수 있습니다.',
    countSuffix: '',
    addLabel: '사진 추가',
    addIcon: 'add_photo_alternate',
    addSub: '최대 10장',
    dragHint: '',
  },
  mainBadge: '대표 사진',
  removeLabel: '삭제',
  previewLabel: '확대보기',
} as const;

export const authPhotoCopy = {
  create: {
    title: '실물 인증 사진',
    requiredBadge: '필수 등록',
    markBadge: '안심 보증 마크 부여',
    bodyPrefix: '상품 옆에 ',
    bodyStrong: '‘닉네임 + 오늘 날짜 (2025. 05. 14)’',
    bodySuffix: '를 직접 손글씨로 적은 쪽지를 두고 촬영해주세요.',
    body2Prefix: '이미지 도용 방지를 위해 판매글에 ',
    body2Badge: '[실물 인증 완료]',
    body2Suffix: ' 배지가 부여되며, 미등록 시 판매하기가 비활성화됩니다.',
    verifiedBadge: '실물인증',
    sampleBadge: '예시',
    changeLabel: '인증샷 변경',
    addLabel: '인증샷 등록',
  },
  edit: {
    title: '실물 인증 사진 검증 완료',
    badge: '인증 배지 부여됨',
    bodyPrefix: '상품 옆에 ',
    bodyStrong: '‘닉네임(민트컬렉터) + 오늘 날짜’',
    bodySuffix: ' 쪽지를 함께 촬영한 사진이 등록되어 도용 방지 안심 판매글로 노출됩니다. 사진 교체 시 재검수가 진행됩니다.',
    changeLabel: '사진 교체',
    pendingTitle: '실물 인증 사진 재검수 대기',
  },
} as const;

export const categoryCopy = {
  title: '카테고리 선택',
  hint: '(선택한 대분류에 따라 필수 속성 입력란이 자동 전환됩니다)',
  mainLabel: '대분류 (필수)',
  subLabel: '소분류 (필수)',
} as const;

export const catalogCopy = {
  title: '공식 품목 DB 검색 및 매핑',
  placeholder: '카드명 · 모델명 · 품번으로 검색',
  searchLabel: '검색',
  matchedPrefix: '[공식 품목 매핑 완료] ',
  matchedHint: '매핑 완료 시 실시간 체결가 데이터 차트와 시세 토론방에 자동 연결됩니다.',
  emptyHint: '품목을 검색해 공식 DB와 매핑하면 실시간 시세가 연동됩니다.',
  externalLinkTo: '/market',
  externalLinkLabel: '공식 품목 DB 열기',
} as const;

export const attributesCopy = {
  create: {
    title: '카테고리별 필수 속성 입력',
    badge: '카드 카테고리 기준',
    hint: '모든 항목 필수 기재',
    setName: '세트명 (Set Name)',
    cardNo: '카드 고유 번호 (Card No.)',
    language: '언어 (Language)',
    rarity: '희귀도 (Rarity)',
    condition: '보관 상태 및 그레이딩 여부',
    gradingService: '감정 회사 (Grading Service)',
    grade: '취득 등급 (Grade Score)',
  },
  edit: {
    title: '필수 속성 명세 (카드 전용)',
    hint: 'PSA 검수 기준 세부 항목',
    setName: '세트명',
    cardNo: '카드 번호',
    language: '발행 언어',
    rarity: '희귀도',
    condition: '개봉 상태',
    grading: '공인 인증 등급 (PSA/BGS)',
  },
  setNamePlaceholder: 'SV2a 151',
  cardNoPlaceholder: '201/165',
} as const;

export const lockedCategoryCopy = {
  title: '카테고리 및 등록 품목',
  lockBadge: '수정 불가 (시세 데이터 일관성 보호)',
  noticeStrong: '카테고리 및 등록된 품목은 수정이 불가능합니다.',
  noticeRest: ' 다른 수집품을 등록하시려면 현재 판매글을 삭제 후 새로 등록해 주세요.',
  mainLabel: '대분류 카테고리',
  subLabel: '소분류 브랜드',
  catalogLabel: '연동된 표준 품목 데이터',
  syncLabel: '시세 연동 중',
} as const;

export const pricingCopy = {
  create: {
    title: '판매 가격 & 시세 피드백',
    titleLabel: '판매글 제목 (필수)',
    titlePlaceholder: '포켓몬 151 리자몽 ex SAR PSA 10 급처합니다',
    priceLabel: '판매 희망 가격 (필수)',
    marketLabel: '현재 시장 시세',
    marketHint: '(최근 5건 평균 체결가)',
    warningStrong: '안심 거래 경고 기준 안내:',
    warningPrefix: ' 시세(320,000원) 대비 30% 이상 과도하게 저렴하게 등록할 경우, 구매자 보호를 위해 목록에 ',
    warningFlag: '‘시세 급락 사기 주의’',
    warningSuffix: ' 경고 플래그가 자동 노출되며 실물 인증 검증이 강화됩니다.',
  },
  edit: {
    title: '판매 가격 및 내용',
    hint: '허위 가격 등록 시 제재 조치됩니다.',
    titleLabel: '판매글 제목',
    titleHelp: '브랜드 규정 키워드가 자동으로 포함되어 검색 노출률이 향상됩니다.',
    priceLabel: '판매 희망 가격 (원)',
    marketLabel: '현재 공인 체결 시세: ',
    dropEmoji: '💡',
    dropStrong: '가격 인하 감지:',
    dropPrefix: ' 가격을 낮춰 저장하면 이 상품을 찜한 ',
    dropSuffix: '의 수집가에게 즉시 실시간 알림이 발송됩니다!',
  },
  currency: '원',
  diffPrefix: '시세 대비 ',
  tiers: {
    danger: '시세 급락 주의',
    fairCreate: '적정 수준',
    fairEdit: '적정 급매 구간',
    above: '시세 이상',
  },
} as const;

export const descriptionCopy = {
  create: { title: '상세 설명', counterSuffix: ' / 1000자' },
  edit: { title: '상세 설명', counterSuffix: ' / 1,000자' },
  placeholder:
    '구매 시기, 보관 상태, 슬랩 케이스 스크래치 유무, 환불 규정 등을 구체적으로 기재해주세요. 솔직한 상품 설명은 분쟁을 예방합니다.',
} as const;

export const tradeCopy = {
  create: {
    title: '거래 방식 & 필수 동의',
    delivery: '택배 거래 (안심 택배 & 에스크로 검수 가능)',
    direct: '직거래 희망',
    locationLabel: '직거래 가능 지역:',
    agreeStrong: '[필수]',
    agree:
      ' 등록된 판매 정보(속성, 상태 등)가 실제 물품과 상이하거나 가품/파손일 경우, 거래 취소 및 분쟁에 대한 모든 책임은 판매자 본인에게 있음을 충분히 숙지하였으며 이에 동의합니다.',
  },
  edit: {
    title: '거래 방식 및 판매자 서약',
    delivery: '안심 택배 거래 (에스크로 필수)',
    direct: '대면 직거래',
    locationLabel: '직거래 선호 지역:',
    agreeStrong: '[필수]',
    agree:
      ' 등록된 물품 정보(사진, 등급, 일련번호)가 실제 배송될 수집품과 불일치하거나 위조품으로 판명될 경우, 거래 취소 및 위약금 부과와 형사 책임이 판매자에게 귀속됨에 동의합니다.',
  },
  locationPlaceholder: '서울특별시 관악구 남현동 (사당역 인근)',
  locationSearchLabel: '지역 재검색',
} as const;

export const submitCopy = {
  create: {
    label: '검수 보증 판매글 등록하기',
    submitting: '등록 중...',
    promo: '신규 판매자 등록 시 첫 3건 에스크로 수수료 무료 프로모션이 자동 적용됩니다.',
  },
  edit: {
    delete: '판매글 삭제',
    cancel: '취소',
    submit: '수정 완료하기',
    submitting: '저장 중...',
    deleteConfirm: '정말로 이 판매글을 삭제하시겠습니까?\n삭제된 판매글과 누적된 찜 내역은 복구할 수 없습니다.',
  },
  toast: {
    createTitle: '판매글이 정상 등록되었습니다!',
    createBody: '안심 검수 대기 상태로 전환되며 상세 페이지로 이동합니다.',
    editTitle: '판매글 수정이 정상적으로 저장되었습니다!',
    editBody: '찜한 사용자에게 가격 변동 알림이 발송됩니다.',
  },
} as const;

export const validationMessages = {
  photos: '상품 사진을 1장 이상 등록해주세요.',
  authPhoto: '실물 인증 사진을 등록해주세요.',
  title: '판매글 제목을 입력해주세요.',
  price: '판매 희망 가격을 입력해주세요.',
  description: '상세 설명은 1000자 이내로 작성해주세요.',
  tradeMethod: '거래 방식을 하나 이상 선택해주세요.',
  directLocation: '직거래 가능 지역을 입력해주세요.',
  agreed: '판매 정보 확인 및 책임 동의 항목에 체크해주세요.',
} as const;

// ---------------------------------------------------------------------------
// Sidebars
// ---------------------------------------------------------------------------

export interface GuideCategory {
  readonly key: string;
  readonly icon: string;
  readonly title: string;
  readonly editTitle: string;
  readonly body: string;
  readonly editBody: string;
}

export const guideCategories: readonly GuideCategory[] = [
  {
    key: 'card',
    icon: 'style',
    title: '[카드] TCG 수집품',
    editTitle: '[트레이딩 카드]',
    body: '세트명, 카드 번호, 언어, 희귀도, 상태(미개봉/개봉/그레이딩), 공인 등급(PSA/BGS 점수)',
    editBody: '세트명, 카드 공식 번호, 발행 언어, 공식 희귀도, 봉인 상태(미개봉/그레이딩 슬랩), 공인 등급사 및 점수 필수.',
  },
  {
    key: 'sneaker',
    icon: 'steps',
    title: '[운동화] 한정판 스니커즈',
    editTitle: '[한정판 스니커즈]',
    body: '모델명, 스타일 코드(SKU), 사이즈(mm 단위), 발매 연도, 착용 상태, 정품 박스·여분 끈·인보이스 부속품 유무',
    editBody: '공식 브랜드명, 모델명, 9자리 스타일 코드, 단위(mm) 사이즈, 발매 연도, 착용 횟수, 오리지널 슈박스 및 여분 끈 유무.',
  },
  {
    key: 'luxury',
    icon: 'diamond',
    title: '[명품] 워치 / 잡화',
    editTitle: '[명품 잡화 & 시계]',
    body: '브랜드, 모델명/레퍼런스, 구매 연도, 구매처(국내 백화점/부티크/직구), 감정 등급(S/A/B), 구성품(보증서·영수증·더스트백 등)',
    editBody: '하우스 브랜드, 모델 라인, 구매 연도 및 구매처, 보증 등급(S/A/B), 구성품 목록(정품 보증서, 인보이스 영수증 등).',
  },
];

export const createSidebarCopy = {
  stepNo: '10',
  title: '카테고리별 필수 속성 안내',
  intro: '정확한 속성을 기재해야 품목 검색 매핑 및 시세 랭킹에 정상 노출되며, 구매자 신뢰도가 상승합니다.',
  activeBadge: '현재 적용중',
  benefitTitle: 'RE:PICK 안심 검수 센터 혜택',
  benefitBody: '전문 감정사가 실물 검수를 진행하는 에스크로 직거래 선택 시, 정품 인증서 발급 및 거래 안전 수수료 0원 혜택이 적용됩니다.',
  qnaTitle: '판매글 등록 가이드 Q&A',
  qna: [
    {
      q: '실물 인증 쪽지는 왜 필요한가요?',
      a: '타 플랫폼 이미지 무단 도용 및 가짜 매물 등록 사기를 방지하기 위해 오늘 날짜와 판매자 닉네임이 자필로 적힌 쪽지를 함께 촬영해야 합니다.',
    },
    {
      q: '시세 기준치보다 비싸게 팔아도 되나요?',
      a: '자유롭게 희망 가격을 입력할 수 있습니다. 단, 시세보다 현저히 낮을 경우에만 경고 알림이 표시됩니다.',
    },
  ],
} as const;

export const editSidebarCopy = {
  guideTitle: '카테고리별 필수 속성 기준',
  activeBadge: '현재 적용중',
  policyTitle: '시세 데이터 보호 정책',
  policies: [
    { strong: '품목 변경 불가:', text: ' 최초 승인된 실물 수집품과 시세 데이터베이스의 일치를 위해 카테고리와 품목은 변경할 수 없습니다.' },
    { strong: '가격 하향 알림:', text: ' 기존 등록가 대비 인하 시 위시리스트 유저에게 푸시 발송으로 체결 확률이 42% 증가합니다.' },
    { strong: '에스크로 의무:', text: ' 20만 원 이상 수집품은 사기 방지를 위해 안전결제(에스크로) 검수 절차를 거칩니다.' },
  ],
  contact: '문의사항: 고객센터 1588-0000',
  guideLinkLabel: '검수 가이드 전문 →',
  guideLinkTo: '/guide',
  statsLabel: '현재 판매글 조회 현황',
  stats: '조회 412회 · 찜 38명 · 채팅 3건',
} as const;

// ---------------------------------------------------------------------------
// Edit header
// ---------------------------------------------------------------------------

export const editHeaderCopy = {
  breadcrumb: [
    { label: '마켓플레이스', to: '/' },
    { label: '마이페이지', to: '/my' },
    { label: '판매 관리', to: '/my/listings' },
  ],
  current: '판매글 수정 (P-015)',
  statusBadge: '검수 대기 등록 물품',
  regPrefix: '등록번호: ',
  eyebrow: 'EDIT LISTING',
  modeLabel: '수정 모드 활성화',
  title: '판매글 수정하기',
  subtitle: '등록된 수집품 정보를 최신 상태로 갱신합니다. 품목 정보는 시세 데이터 무결성을 위해 보호됩니다.',
  cancelLabel: '수정 취소',
} as const;

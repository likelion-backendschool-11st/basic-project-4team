
/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface GalleryImage {
  readonly src: string;
  readonly alt: string;
  readonly thumbSrc?: string;
  readonly label: string;
  /** Highlighted "실물인증" style badge instead of the neutral one. */
  readonly verified?: boolean;
  /** Slide index the thumbnail points to (defaults to its own index). */
  readonly targetIndex?: number;
}

export interface BreadcrumbItem {
  readonly label: string;
  readonly to?: string;
}

export type AttributeKind = 'chips' | 'location' | 'status' | 'verified' | 'text' | 'badge' | 'mono';

export interface ListingAttribute {
  readonly label: string;
  readonly kind: AttributeKind;
  readonly value: string;
  readonly chips?: readonly string[];
}

export interface SpecItem {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'default' | 'primary' | 'grade';
}

export interface RelatedListing {
  readonly id: string;
  readonly title: string;
  readonly price: string;
  /** 대표 사진·품목 이미지가 모두 없으면 null. */
  readonly imageSrc: string | null;
  readonly imageAlt: string;
  readonly location: string;
  readonly timeAgo: string;
  readonly category?: string;
  readonly condition?: string;
  readonly conditionTone?: 'primary' | 'muted';
}

export interface SellerOtherItem {
  readonly id: string;
  readonly title: string;
  readonly price: string;
  readonly condition: string;
  readonly conditionTone: 'primary' | 'muted';
  /** 대표 사진·품목 이미지가 모두 없으면 null. */
  readonly imageSrc: string | null;
  readonly imageAlt: string;
}

export type ListingStatus = '판매중' | '예약중' | '거래완료';

export interface StatusOption {
  readonly status: ListingStatus;
  readonly label: string;
  readonly hint: string;
  readonly dotClass: string;
  readonly opensDealModal?: boolean;
}

/* ------------------------------------------------------------------ */
/* Shared listing core                                                 */
/* ------------------------------------------------------------------ */

export const listingCore = {
  currency: '원',
};

/** URL 복사 버튼 (REQ-DETAIL-003). */
export const copyUrlCopy = {
  label: 'URL 복사',
  buyerTitle: '판매글 링크 복사',
  sellerTitle: '판매글 공유 링크 복사',
};

export const toastMessages = {
  copied: '판매글 링크가 클립보드에 복사되었습니다.',
  copyFailed: '링크를 복사하지 못했습니다. 주소창의 링크를 직접 복사해 주세요.',
  copyFailedIcon: 'error',
  wishAdded: '찜 목록에 추가되었습니다.',
  wishRemoved: '찜이 해제되었습니다.',
  statusChanged: (status: string) => `상품 상태가 '${status}'(으)로 변경되었습니다.`,
  deleted: '판매글이 성공적으로 삭제되었습니다.',
  dealCompleted: (price: string) => `거래완료 처리되었습니다. (반영시세: ${price}원)`,
  statusFailed: '상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  dealFailed: '거래완료 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  soldLocked: '거래완료된 판매글은 상태를 변경할 수 없습니다.',
  invalidFinalPrice: '최종 체결 가격을 1원 이상 숫자로 입력해 주세요.',
};

/** 화면의 판매 상태 표기 → API 값 (LISTING-06·07). */
export const statusToApi: Readonly<Record<ListingStatus, 'selling' | 'reserved' | 'sold'>> = {
  판매중: 'selling',
  예약중: 'reserved',
  거래완료: 'sold',
};

/* ------------------------------------------------------------------ */
/* 찜 API 연동 문구 (LIST-02 / LIST-03) — 판매글 상세·검색 결과 공통        */
/* ------------------------------------------------------------------ */

// 성공 토스트는 toastMessages.wishAdded / wishRemoved를 쓴다.
export const wishCopy = {
  notFound: '삭제된 판매글입니다.',
  failed: '찜 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  errorIcon: 'error',
  /** 비로그인으로 하트를 누르면 띄우는 팝업. */
  loginRequired: {
    icon: 'lock',
    title: '로그인이 필요합니다',
    message: '로그인하면 마음에 드는 판매글을 찜해 두고 나중에 다시 볼 수 있습니다.',
    confirmLabel: '로그인하기',
    cancelLabel: '닫기',
  },
};

/* ------------------------------------------------------------------ */
/* P-010 API 연동 문구 (LISTING-02 응답 → 화면)                          */
/* ------------------------------------------------------------------ */

export const listingDetailCopy = {
  loading: '판매글을 불러오는 중입니다...',
  notFoundTitle: '판매글을 찾을 수 없습니다',
  notFoundBody: '삭제되었거나 존재하지 않는 판매글입니다.',
  errorTitle: '판매글을 불러오지 못했습니다',
  errorBody: '잠시 후 다시 시도해 주세요.',
  homeLabel: '홈으로',
  home: '홈',
  noImage: '등록된 사진이 없습니다',
  photoMain: '대표',
  photoLabel: (n: number) => `사진 ${n}`,
  authPhoto: '실물인증',
  tradeLabel: '거래 방식',
  delivery: '택배거래',
  direct: '직거래',
  directLocationLabel: '직거래 가능지역',
  conditionLabel: '제품 상태',
  conditions: { unopened: '미개봉', opened_raw: '개봉 (그레이딩 없음)', graded: '그레이딩 슬랩' },
  statusLabel: '판매 상태',
  statuses: { selling: '판매중', reserved: '예약중', sold: '거래완료' },
  authLabel: '인증 여부',
  authYes: '실물 인증 사진 등록',
  authNo: '실물 인증 사진 없음',
  specSetName: '세트명',
  specCardNo: '카드 번호',
  specLanguage: '발행 언어',
  specRarity: '희귀도',
  specGrade: '공식 등급',
  languages: { ko: '한국어', ja: '일본어', en: '영어', zh: '중국어' } as Readonly<Record<string, string>>,
  avgLabel: (price: string) => `최근 30일 평균 체결가 ${price}원`,
  noMarket: '최근 30일 거래 이력 없음',
  cheaper: (rate: number) => `▼ ${rate}% 저렴`,
  pricier: (rate: number) => `▲ ${rate}% 높음`,
  samePrice: '시세와 동일',
  cheaperNote: '시세보다 저렴',
  pricierNote: '시세보다 높음',
  registered: (timeAgo: string) => `등록: ${timeAgo}`,
  views: (count: string) => `조회 ${count}`,
  updatedAt: (date: string) => `최종 수정일: ${date}`,
  eyebrowCard: (setName: string, cardNo: string) => `${setName} 번호 ${cardNo}`,
  setLabel: (setName: string) => `세트: ${setName}`,
  sellerGrade: '판매자',
  sellerBadge: 'RE:PICK 회원',
  timeAgo: {
    justNow: '방금 전',
    minutes: (n: number) => `${n}분 전`,
    hours: (n: number) => `${n}시간 전`,
    days: (n: number) => `${n}일 전`,
    months: (n: number) => `${n}개월 전`,
    years: (n: number) => `${n}년 전`,
  },
};

/** P-010 상세에서 작성자 본인에게만 보이는 관리 버튼 문구 (isOwner = true). */
export const ownerActionCopy = {
  notice: '내가 등록한 판매글입니다.',
  editLabel: '수정하기',
  deleteLabel: '삭제하기',
  deletingLabel: '삭제 중...',
  manageLabel: '내 판매글 관리',
};

/** P-013 내 판매글 상세 API 연동 문구 (LISTING-02 응답 → 판매자 화면). */
export const sellerDetailCopy = {
  notOwnerTitle: '내 판매글이 아닙니다',
  notOwnerBody: '판매글 작성자 본인만 관리 화면을 볼 수 있습니다. 로그인 상태를 확인해 주세요.',
  buyerViewLabel: '판매글 보기',
  registered: (timeAgo: string, date: string) => `등록시간: ${timeAgo} (${date})`,
  avgValue: (price: string) => `${price}원`,
  cheaperNote: (rate: number) => `시장 평균보다 약 ${rate}% 저렴하게 등록되어 빠른 판매가 예상됩니다.`,
  pricierNote: (rate: number) => `시장 평균보다 약 ${rate}% 높게 등록되어 있습니다.`,
  sameNote: '시장 평균과 같은 가격으로 등록되어 있습니다.',
  noMarketNote: '최근 30일 거래 이력이 없어 시세와 비교할 수 없습니다.',
  tradeDelivery: '택배 배송',
  tradeDirect: (location: string | null) => (location ? `직거래 (${location})` : '직거래'),
  tradeSeparator: ' / ',
  languageLabel: '카드 언어판본',
  rarityLabel: '레어도/일련번호',
  deleteFailedIcon: 'error',
};

/* ------------------------------------------------------------------ */
/* P-010 Buyer view                                                    */
/* ------------------------------------------------------------------ */

export const buyerListing = {
  escrowBadge: 'RE:PICK 안심 에스크로 적용 대상',
  listingNoLabel: '상품 등록번호:',
  price: { label: '판매 희망가' },
  stats: { wishLabel: '찜' },
  specTitle: '카테고리별 필수 스펙 요약',
  actions: {
    discussionLabel: '토론방',
    discussionTitle: '품목 토론방 바로가기',
    discussionChipLabel: '품목 토론방',
    wishLabel: '찜',
    chatLabel: '1:1 채팅하기 (안심 안전거래)',
  },
  description: {
    title: '상품 정보',
    /** 실물 인증 사진(authImage)이 있을 때만 보여준다. */
    possessionTitle: '실물 인증 사진 등록',
    possessionBody: '판매자가 실물 인증 사진을 함께 등록했습니다. 사진 속 닉네임·날짜와 실물 상태를 직접 확인해 보세요.',
    expandLabel: '상품 설명 더보기',
    collapseLabel: '상품 설명 접기',
    escrowNotice: 'RE:PICK 안전결제 시 구매 확정 전까지 결제 대금이 안전하게 보호됩니다.',
  },
  seller: {
    tradesLabel: '누적 거래 횟수',
    tradesUnit: ' 회 완료',
    otherTitle: (count: number) => `판매자의 다른 상품 (${count})`,
    otherEmpty: '판매 중인 다른 상품이 없습니다.',
    /** "판매자의 다른 상품"에 보여줄 최대 개수. */
    otherSize: 3,
  },
  related: {
    title: '같은 품목의 다른 매물',
    subtitle: '(판매중 · 최신 등록순)',
    description: (itemName: string) => `동일 품목 [${itemName}]의 판매중 매물입니다.`,
  },
};

/** Rich-text description paragraphs (strong segments marked with `strong`). */
export interface DescriptionSegment {
  readonly text: string;
  readonly strong?: boolean;
}
export type DescriptionLine = readonly DescriptionSegment[];
export type DescriptionParagraph = readonly DescriptionLine[];

/* ------------------------------------------------------------------ */
/* P-013 Seller (my listing) view                                      */
/* ------------------------------------------------------------------ */

export const sellerListing = {
  /** 시세 안내 문구. 금액·차이율은 LISTING-02 응답으로 채운다. */
  price: {
    label: '내 등록 판매 희망가',
    avgPrefix: '최근 30일 체결 평균가:',
  },
  stats: { viewsLabel: '조회수', wishLabel: '관심(찜)' },
  management: {
    title: '판매자 전용 관리 도구',
    note: '구매자 화면의 [채팅하기] 버튼 대신 관리 도구가 활성화되었습니다.',
    discussionLabel: '품목 토론방 보기',
    editLabel: '1. 상품수정',
    statusPrefix: '2. 상태: ',
    deleteLabel: '3. 상품삭제',
  },
  statusOptions: [
    { status: '판매중', label: '판매중', hint: '노출 활성', dotClass: 'bg-primary' },
    { status: '예약중', label: '예약중', hint: '거래 협의중', dotClass: 'bg-logo-lime' },
    { status: '거래완료', label: '거래완료', hint: '시세 반영', dotClass: 'bg-muted', opensDealModal: true },
  ] as readonly StatusOption[],
  description: {
    title: '상품 정보 및 상세 설명',
    expandLabel: '상품 정보 더보기',
    collapseLabel: '상품 정보 접기',
  },
  related: {
    title: '같은 품목의 다른 판매중 매물',
    description: '같은 품목을 판매 중인 다른 판매자의 등록 가격을 비교해 보세요.',
    /** 불러올 최대 개수 (현재 판매글은 빼고 보여준다). */
    size: 12,
    deliveryOnly: '택배 거래',
  },
  deleteModal: {
    title: '판매글 삭제 확인',
    question: '정말 해당 판매글을 영구 삭제하시겠습니까?',
    warning: (wishCount: number, viewCount: number) =>
      `삭제 시 현재까지 누적된 관심(찜 ${wishCount.toLocaleString('ko-KR')}명)과 조회수(${viewCount.toLocaleString('ko-KR')}회) 데이터가 모두 삭제되며 복구할 수 없습니다. 이미 구매 희망자와 채팅 중인 경우 거래 내역을 반드시 확인하세요.`,
    cancelLabel: '취소',
    confirmLabel: '삭제하기',
  },
  dealModal: {
    title: '거래완료 및 시세 등록',
    closeLabel: '닫기',
    intro: [
      { text: '거래가 완료되었나요? 최종 판매가를 확인하여 주시면 ' },
      { text: 'RE:PICK 실시간 시세 데이터베이스', strong: true },
      { text: '에 정식 반영되며, 구매자에게 ' },
      { text: '거래 후기 작성 안내 알림', strong: true },
      { text: '이 즉시 발송됩니다.' },
    ] as readonly DescriptionSegment[],
    priceLabel: '최종 체결 가격',
    priceHint: '등록 판매가와 다를 경우 실제 거래 금액으로 수정해 주세요.',
    buyerLabel: '구매 상대 회원 (채팅자 선택)',
    // 채팅 API가 없어 구매 상대를 고를 수 없다. 지금은 외부 거래(buyerId = null)로 처리한다.
    buyerOptions: ['기타 외부 거래 / 미등록 구매자 (채팅 상대 선택은 준비 중)'],
    reviewLabel: '구매자에게 매너 온도 및 구매 후기 작성 요청 푸시 알림 전송 (권장)',
    cancelLabel: '취소',
    submitLabel: '거래완료 처리 및 시세 반영',
  },
};

export const sellerDescription: readonly DescriptionParagraph[] = [
  [[{ text: "포켓몬 카드 정규 팩 '포켓몬 151' 한국어 발매 당일 직접 개봉하여 즉시 슬리브 및 PSA 공식 슬랩 검수를 거친 리자몽 ex SAR 카드입니다." }]],
  [
    [
      { text: '보시다시피 PSA 공식 10등급(Gem Mint) 최고 등급을 획득하였으며, 모서리(Centering, Edges, Corners, Surface) 모두 흠결 없이 완벽한 상태를 유지하고 있습니다. 케이스에는 수령 즉시 UV 자외선 차단 전용 프로텍트 필름을 씌워 암소에서 방습 보관 중입니다.' },
    ],
  ],
  [
    [{ text: '• 거래 방식: 직거래의 경우 서울 관악구 남현동 (사당역 인근) 협의 가능합니다. 택배 거래 시 우체국 안심보험 택배로 완충재(뽁뽁이 5겹 + 전용 하드박스) 포장하여 당일 발송해 드립니다.' }],
    [{ text: '• 에스크로 안심 결제 언제든 환영합니다.' }],
    [{ text: '• 네고(가격 조정)는 시장 체결 시세를 고려하여 정중히 사양합니다.' }],
  ],
];

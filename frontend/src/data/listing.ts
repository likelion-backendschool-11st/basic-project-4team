import { ROUTES } from './layout';

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
  readonly imageSrc: string;
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
  readonly imageSrc: string;
  readonly imageAlt: string;
}

export interface InspectionPoint {
  readonly label: string;
  readonly value: string;
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

export const MOCK_LISTING_ID = 'P-010-882194';

export const listingCore = {
  id: MOCK_LISTING_ID,
  itemId: 'charizard-ex-sar-sv2a-201',
  title: '[PSA 10] 리자몽 ex SAR (SV2a 201/165)',
  price: '300,000',
  currency: '원',
  discussionCount: 21,
  wishCount: 38,
};

export const toastMessages = {
  copied: '판매글 링크가 클립보드에 복사되었습니다.',
  copiedFallback: 'URL이 복사되었습니다.',
  wishAdded: '찜 목록에 추가되었습니다.',
  wishRemoved: '찜이 해제되었습니다.',
  chatSent: '메시지가 전송되었습니다.',
  statusChanged: (status: string) => `상품 상태가 '${status}'(으)로 변경되었습니다.`,
  deleted: '판매글이 성공적으로 삭제되었습니다.',
  dealCompleted: (price: string) => `거래완료 처리되었습니다. (반영시세: ${price}원)`,
};

/* ------------------------------------------------------------------ */
/* P-010 Buyer view                                                    */
/* ------------------------------------------------------------------ */

const IMG = {
  front:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBz6f5RB_Wu1rjJSocCNZRzZGPaNxwKouAjsEDZMLYhz5h2DuFAT89nl-IITFebBSH8CSuvWRJDROqC0hzCfe4PxMaXnPpoJpo3mmoofRuHyimt2mgKeQjJ812s5pb3PD6hXCFFG5uN0DJUBoOOTxmTFtN36ejzs-IibTxckKlKBycWv0vL4c5Gkmtj1ohZXiJQMpAbycWF-mXX5cpOzE5N7cMPN-xCnIuqIbUlUDs',
  back: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_y3X02C2Lb3Bat1Vk4VhGMWPfE8Q34PO3iu54um1gLnpX1u6jQNdv0he3AnDCJSXDAF_7cK8PvZmTiG4zMgt_6YK3HjaLr-8pyWcK5VC-rVynWmDgc8oPJbYSD2JqDvAkDhKfEmJ6DJxjAuozgx1BJPhbv1JRgZ7g-L-0Ek6HvN-5ISF_dYKsHMin87USw2DqNDn0iYcJo5Q-huwKm_7cWgmt2CQgIHrW4t0TSCY',
  corner:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQeI2PNeoNd89MnjgZUhdzZueVf2ksinibQSU0B26UyXb6VkHWP6Oqc7PdsjnjZ2UegZpDTWRjS3EeQ7N43tmpNsp2vzh7FIc8U_qSJH7ey9o7UX3aTsm2e6O7s2DrSRjKojavXZxwgMb_Oz8IA88Fx8J_Of_4aePzEQL8szsyNmZBuOaeWO1dhDh-2MSTtcZSqy0iTSRHuexRKBH-ujsoFvU8CaOJNwLy63UFBqI',
  holo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLyvGJdN3n_Qlhae5aMXkQKmNS7njyl9i0FyhU1P--1FXtZNKJfSi-jE6eqPtBJP678nRtnL5mysy9Jc8HxxbOOP8CQYj1TjHRKjBXt5Zq2yVW5ETy8BRwOEv946z8g8XIrSEtWcj__rGb71bqeX_ZkXOHGiZghFgV36-StZOEL3H_kqVBxYjRtWOxdSvjhk2DIWSqHwsbiC7MWFXKEE-rnCZW5VG1ECTecPrTH98',
  label:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUkz3a_q2GLIzAbqIZo1sXBCNMQ6EZtJi9_0BGIHYR5tOUabKxlSJc8CnyBA1EdDfQl-FtqPNtbt6gsBA0cnQQX7rFZcA0lBkhsMysZt3NA-HtZ_M3Qegg6a8CIlVJw08qidBjntkmeS6BXV20kafuZTZ1lAUT7bg22YLTmarWmii1lFVx7pi_V7zSz7il2YLAUU2pUFq5-nl-N6KPDKzLczz4HdmT1lmw7VP_Zbo',
  chatThumb:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBH4RVB3a0FTyLcRIxlvUkveRavWLbU9_GuaSZJDQubOrl6x0KfQjXlrSW9YXRntzCHPhIEv-V6_4Vv4vw1V0BChOOAChgvWH31zEUbM8oV8ssCAuZQnX7qE1v1Z42qKby-1UMftselI8ByipKRuziAs1p4SrjfoCso4EZvm5NuHt1dvq0cuUliFqS3hPshrdS7aQEhvfN8lLwYeaq_JoQqP4tAemrkWzEOaeimDqo',
};

export const buyerListing = {
  breadcrumbs: [
    { label: '홈', to: ROUTES.home },
    { label: '트레이딩 카드', to: `${ROUTES.search}?category=trading-card` },
    { label: '포켓몬 카드', to: `${ROUTES.search}?category=pokemon` },
    { label: '포켓몬 151 (SV2a)' },
  ] as readonly BreadcrumbItem[],
  escrowBadge: 'RE:PICK 안심 에스크로 적용 대상',
  listingNoLabel: '상품 등록번호:',
  gallery: [
    { src: IMG.front, alt: '[PSA 10] 리자몽 ex SAR 카드 전면', label: '대표' },
    { src: IMG.back, alt: '[PSA 10] 리자몽 ex SAR 카드 후면', label: '후면' },
    { src: IMG.corner, alt: '실물 인증 포스트잇 및 모서리 확대', label: '상세 코너' },
    { src: IMG.holo, alt: '홀로그램 표면 텍스처 무결성', label: '실물인증', verified: true },
    { src: IMG.label, alt: 'PSA 공식 바코드 및 라벨 인증', label: 'PSA 라벨' },
  ] as readonly GalleryImage[],
  eyebrow: '포켓몬 151 번호 201',
  setLabel: '세트: 한국어 정식발매 SV2a',
  price: {
    label: '판매 희망가',
    avgLabel: '최근 30일 평균 체결가 320,000원',
    deltaBadge: '▼ 6.3% 저렴',
    deltaNote: '시세 최저가 수준',
  },
  stats: { registered: '등록: 9일 전', views: '조회 1,420', wishLabel: '찜' },
  attributes: [
    { label: '거래 방식', kind: 'chips', value: '', chips: ['택배거래', '직거래'] },
    { label: '직거래 가능지역', kind: 'location', value: '서울 관악구 남현동 (사당역)' },
    { label: '제품 상태', kind: 'status', value: '미개봉 수집품 / 슬랩 완벽 보관' },
    { label: '인증 여부', kind: 'verified', value: 'PSA 공식 정품 일련번호 등록' },
  ] as readonly ListingAttribute[],
  specTitle: '카테고리별 필수 스펙 요약',
  specs: [
    { label: '세트명', value: '포켓몬 151' },
    { label: '카드 번호', value: '201/165' },
    { label: '발행 언어', value: '한국어 정품' },
    { label: '희귀도', value: 'SAR (스페셜아트)', tone: 'primary' },
    { label: '공식 등급', value: 'PSA 10', tone: 'grade' },
  ] as readonly SpecItem[],
  actions: {
    discussionLabel: '토론방',
    discussionTitle: '품목 토론방 바로가기',
    discussionChipLabel: '품목 토론방',
    wishLabel: '찜',
    chatLabel: '1:1 채팅하기 (안심 안전거래)',
  },
  description: {
    title: '상품 정보',
    badge: '검수 보증 가능',
    updatedAt: '최종 수정일: 2025.02.15',
    possessionTitle: '실물 보유 및 위변조 인증 완료',
    possessionBody:
      '판매자가 포스트잇 닉네임과 당일 날짜를 슬랩과 함께 촬영하여 등록하였으며, RE:PICK 검수팀 1차 이미지 데이터 무결성 검증을 통과했습니다.',
    expandLabel: '상품 설명 더보기',
    collapseLabel: '상품 설명 접기',
    escrowNotice: 'RE:PICK 안전결제 시 구매 확정 전까지 결제 대금이 안전하게 보호됩니다.',
    escrowLinkLabel: '안심 기준 >',
    escrowLinkTo: '/guide',
  },
  seller: {
    initial: '포',
    name: '포케마스터99',
    grade: '안전판매자 1급',
    badge: '100% 에스크로 준수 회원',
    profileLabel: '프로필',
    profileTo: '/users/pokemaster99',
    tradesLabel: '누적 거래 횟수',
    trades: '42',
    tradesUnit: ' 회 완료',
    ratingLabel: '구매자 만족도 (리뷰)',
    reviewsLabel: '리뷰 보기',
    rating: '4.9',
    ratingCount: '(39개 평가)',
    otherTitle: '판매자의 다른 상품 (3)',
    otherAllLabel: '전체보기 >',
    otherAllTo: '/users/pokemaster99/listings',
    otherItems: [
      {
        id: 'P-010-771201',
        title: '뮤 ex SAR 205',
        price: '145,000원',
        condition: '미개봉/새상품',
        conditionTone: 'primary',
        imageAlt: '뮤 ex SAR PSA 슬랩',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCxXs0udx7Ht6gQgdm9G5vxfzbf5fUFuJJza03CW9zbboUHAgUx1MwOJVOlhKXi5v1oxi37u3rIX9SYsSXnC1_6fOAMszaHgn7QBVDRulcmSlDYFl32Rh536XWENFxtCsHyoCA17JkqdGY1vjKRa6AEcD-co56fFtoLZ3UD-nl1qnBGXb47h8MJWWTydXNAEs6xLiZLNhWPb9T2VsyHx5h8XWCiJFLWtlj0mQMnRjI',
      },
      {
        id: 'P-010-771202',
        title: '에리카의 초대 SR',
        price: '180,000원',
        condition: '새상품',
        conditionTone: 'primary',
        imageAlt: '에리카의 초대 SR 카드',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCFSQMqjpan3OzQY-NFGrIPD61DxiYe3IBSzKx7E4LHyVwGZBq4Yq9fr-jbn7sj9Pbu6oKWWuqeTP2R-76x4nMySXglx29SxmF7Esh4gplF-PE-E1t0Wf1m6vwUKHShklnWrgxuNQ_iJc0cZAB2K-gkBQ1zIuis6Ug4IFWbp-UkETd19TzZ3vDxLasWyn5CPXUozazwJyw9TBIO4F5NNwT2RJMQ8s60aZEdFo7XgwI',
      },
      {
        id: 'P-010-771203',
        title: '거북왕 ex SAR',
        price: '110,000원',
        condition: '거의새것',
        conditionTone: 'muted',
        imageAlt: '거북왕 ex SAR PSA 케이스',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCg8eqbbZTJxhIOeqevr5lKkw-yuDp7swZeVgnw1N2IuhP_Xeja7gbKNrfAn09gWVp2jFTCwwyGhkzzlF01lcfTRVjpJ8-bURlWrpXvO4pnLibmnOTEeni0BkmSkuQ_12jYWBXmkAGxkml7yuXLEbm2j9Llfk5LiZnHRoCiaF5VjYGnc4OFa5qp7YCidA1QrE1LtssL7Y8Veww7o9hZBx-biZIYkatIcjcqipHxsfM',
      },
    ] as readonly SellerOtherItem[],
  },
  related: {
    title: '같은 품목의 다른 매물',
    subtitle: '(실시간 시세 및 낮은 가격순 정렬)',
    description: '동일 품목 [리자몽 ex SAR SV2a 201/165] 거래 활성 리스팅 목록입니다.',
    items: [
      {
        id: 'P-010-880101',
        title: '[PSA 9] 리자몽 ex SAR',
        price: '255,000원',
        location: '경기 성남시 분당구',
        timeAgo: '3일 전',
        condition: '새상품 상태',
        conditionTone: 'primary',
        imageAlt: 'PSA 9 리자몽 ex SAR',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuApc4oSfsCl2GVZRCNYBV3GRODaI9pHUTV8dO68NPJD5ZER88f1_Sl-TbzXCQIHTAVF6rYRjXTvb7w2SNwhEwQrmjuiFlf1FP_GklNaebPmIKU1XcwF-hwUKlwWz25QOYoQyoczPxHMiEwAfQJEe36r9mrSO9_91wJaW587p-7oEnmZV_iCJ1Z4rvd2SALRKIzlz0CbP-I5o7vnECK6-lwj0p4GWR2K5MBItkcsYy0',
      },
      {
        id: 'P-010-880102',
        title: '[PSA 10] 리자몽 ex SAR',
        price: '310,000원',
        location: '서울 강남구 역삼동',
        timeAgo: '5일 전',
        condition: '미개봉/새상품',
        conditionTone: 'primary',
        imageAlt: 'PSA 10 리자몽 ex SAR',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBbEeuKTA2GCiyLm53ybcb4k8FOKNcFDUWlpE3-FkNweCG61P6YOjJ267l0kxUQjPwAN5mlJQRMZVjVX4nannN6Je_8PxS4tqgdu8bsuNznwHwf970uNi9yJwTtMzEKertfQIzMw9u29WS0VgQaa7IoNAsUp4su317LdtNX17hDSZSZ2Pr8tafAh6cnPUwBabqeB_daTQ2R6vvYhksHxFjSrwksRwNixylWTWzbgkI',
      },
      {
        id: 'P-010-880103',
        title: '[BGS 9.5] 리자몽 ex SAR 골드',
        price: '295,000원',
        location: '인천 연수구 송도동',
        timeAgo: '7일 전',
        condition: '새상품 상태',
        conditionTone: 'primary',
        imageAlt: 'BGS 9.5 리자몽 ex SAR',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBV4A8nyMEluyCwBNaQhcmto4QAp2yPf_HKxMWAiQXY9WyFM5TjasdTycZKu4pgSXn8iUl_4DPIGtKTHJwMYK_xNcBoSmsNJpXfXmrNSh9FCsi5Tkx-AQi5G2Rwbar_d2BDqjJ0joGgR7Wvq0n7QaRxsQqlJwu4aUfAtGgJbiwPfh2biMbJi9NzX-_tPBWfdu0FXfvrNU-7PL0nlnaPHXi0ul9KD3KsflhLZuFNL1o',
      },
      {
        id: 'P-010-880104',
        title: '리자몽 ex SAR 노등급 싱글',
        price: '140,000원',
        location: '대구 수성구 범어동',
        timeAgo: '9일 전',
        condition: '상태: S급',
        conditionTone: 'muted',
        imageAlt: '노등급 리자몽 ex SAR',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD-g15mgDKzNQbPWAtV3OUZcjOJvzr8PtHMaij-pRCPDBNXSJKvPkzAn5v48C1gimQUCAxy3rQJOSzNOB_EWXSZBaV9b8GUD5OgHcOJmWH8xHKKpNSzS-8eK4QgBOZl2a4DR5h_3Ay8bqa2sCMpYzbfRVWSsr9YRikepA63ykdE_8dcAsJjwzL9CAthkBqV8nL8OHTZEDRk18InRyO5raA91e1AkjGLcrwpnPVT8Dw',
      },
      {
        id: 'P-010-880105',
        title: '[일판 PSA 10] 리자몽 ex SAR',
        price: '365,000원',
        location: '부산 해운대구 우동',
        timeAgo: '12일 전',
        condition: '새상품 상태',
        conditionTone: 'primary',
        imageAlt: '일본판 PSA 10 리자몽 SAR',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCJmItatlLoSF8bZqzFyUMP3rBlxceE4sWUwd-zKqvY3wKq6O0KDco-PFEPmc9nY_GuGwJLF2U9H-hkAJ1cCVLwHo-fzsJej4u_umexufeAc3HPk39W2tdrRCr6h7wt-ToUSozkH0-5LUCrxSf8POr4R9UwEJHsl7Yqr5GF0__GJuVX-PEJqvHZwpuUL3fSVpEvQUNwcnGV6gFoenebI7ldcPByvVIQ4rbrRRojpo8',
      },
      {
        id: 'P-010-880106',
        title: '[PSA 10] 리자몽 ex 직거래',
        price: '298,000원',
        location: '서울 서초구 방배동',
        timeAgo: '14일 전',
        condition: '직거래 우선',
        conditionTone: 'primary',
        imageAlt: '마그네틱 탑로더 리자몽 ex',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAfCyP-vzLTSU05nbIZqgbI1SxG-DtDcg6EInOo2LfKZ0irAQsoxVf6OHP17chgCknRIAQotOy05B23Knkhl9YxMwSTxwPeh4LNa2CqlmdHVJpzwfuvPLDG4S0ka0cROWRq3G0_tDKej-iwh6UP47wjQCuIeJEHIlFf8E1gFiJK2BHjKZg9VEqQHHQ7Xj8V834hg8oW9bKueWalbvaO8GNZ5cC64_9_9YLR-aInuWA',
      },
    ] as readonly RelatedListing[],
  },
  chat: {
    responseTime: '평균 응답시간 5분 이내',
    onlineTitle: '현재 온라인',
    productTitle: '[PSA 10] 리자몽 ex SAR',
    productPrice: '300,000원',
    productThumb: IMG.chatThumb,
    escrowBadge: '에스크로 보호',
    privacyNotice: '개인정보 보호를 위해 전화번호, 외부 메신저 유도는 자동 필터링됩니다.',
    welcomeMeta: '포케마스터99 · 오후 2:10',
    welcomeMessage:
      '안녕하세요! [PSA 10 리자몽 ex SAR] 문의 주셔서 감사합니다. 안전거래(에스크로) 및 서울 사당역 부근 직거래 모두 환영합니다. 편하게 문의주세요!',
    quickReplies: [
      { label: '💬 아직 구매 가능한가요?', message: '아직 구매 가능한가요?' },
      { label: '📍 직거래 일정 조율', message: '직거래 일정 조율 가능한가요?' },
      { label: '🛡️ 안심 검수 센터 경유 희망', message: '안심 검수 센터 경유로 신청하겠습니다.' },
    ],
    placeholder: '메시지를 입력하세요 (안전결제 지원)...',
    photoTitle: '사진 전송',
    closeLabel: '채팅 닫기',
    sendLabel: '메시지 전송',
  },
};

/** Rich-text description paragraphs (strong segments marked with `strong`). */
export interface DescriptionSegment {
  readonly text: string;
  readonly strong?: boolean;
}
export type DescriptionLine = readonly DescriptionSegment[];
export type DescriptionParagraph = readonly DescriptionLine[];

export const buyerDescription: readonly DescriptionParagraph[] = [
  [
    [
      { text: '안녕하세요. 포켓몬 카드 컬렉터입니다. 직접 한국판 포켓몬 151 박스를 개봉하여 얻은 후 바로 미국 PSA 본사로 그레이딩을 대행 접수해 수령한 ' },
      { text: '리자몽 ex SAR (201/165) PSA 10', strong: true },
      { text: ' 원오너 소장품입니다.' },
    ],
  ],
  [
    [
      { text: '• ' },
      { text: '보관 상태:', strong: true },
      { text: ' PSA 슬랩 전용 오피셜 슬리브 + 제습 캐비닛(습도 45% 유지)에 암실 보관했습니다. 케이스 외부 스크래치 일절 없으며 모서리 및 홀로그램 코팅 상태 극상입니다.' },
    ],
    [
      { text: '• ' },
      { text: '거래 방식:', strong: true },
      { text: ' 사당역, 이수역, 남현동 부근에서 직접 상태 육안 확인 후 직거래 가능하며, 택배 거래 시 뽁뽁이 3중 완충 포장 + 우체국 안심택배(보험 적용)로 당일 발송해 드립니다.' },
    ],
    [
      { text: '• ' },
      { text: '에스크로 안심 검수:', strong: true },
      { text: ' RE:PICK 전문 검수 센터를 통한 중간 에스크로 배송도 전액 동의합니다. 검수비 절반 지원해 드립니다.' },
    ],
  ],
  [
    [
      { text: '네고는 정중히 사양하며, PSA 일련번호는 보안을 위해 일부 모자이크 처리했으나 구매자분께는 채팅 시 전체 번호 및 PSA 공홈 조회 링크 실시간 전송 가능합니다. 쿨거래 시 151 팩 슬리브 미개봉 서비스로 챙겨드립니다.' },
    ],
  ],
];

/* ------------------------------------------------------------------ */
/* P-013 Seller (my listing) view                                      */
/* ------------------------------------------------------------------ */

const SELLER_IMG = {
  front:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBEGcd3IITTzwYdDbBG4jnGa8vy1s9IwJwLzL2UmLuFpvC9RepBLq_lkzpAsVTwUgs2cXcxzZ65yUQmPIW_SteKKz5NGckxILXILSiHYMf8strYjR6AYeMDbYW4d_bOs7TQhwTwJzt5CCY6YUyWZ4I-6h7ofG5W12XmJmhV40SxQ014MCSbhGwzcBVyX7tfUCOpNPJ-PZNjxJD8rETF5kFeZhqPjUpODxGincPN8ps',
  back: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqhHaG6AjMWzjpXOAYrDfdLDQhG5VaxF42w5bkqCHsFQTdEgxQefsKCGY8a0qt2LPvhfZcvrMpPDCaxdWU1vJfOwMzl7F6NnivybZgdr9mI1QtWN3jSI2NesNfY1iOGrx6ygmSXD-5sPwJ0E1N6jl-JcP-MO_B9ioiTIy1uWigoviQryfwZTliJqw3REsY4HJsugJ-pgLt9JDyXjD-gTblBYm1mcrZbeKDOafP378',
  macro:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC7hM62YuQdwGBSOLZTcOduC6WIubRg8sa3cWaDDTsYIXERyEkoWLJqGWW20jTAvaM88XFiEq0cp7-pYOe6n0Vb_iAFk9UCor3DQintbbnqJg5LYjvbcsT2XiOW--iDYc0rqSMhT2m3ZWGCF_a1XpUek-DMeQTTcuaum1dx04q7Qct1nnei78xL3OUUfG3KUaKr-6njrO9BLbgl6kJJaTE4M1DKysps44_JYszolbQ',
  thumbFront:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDeH2cZVt5L9ym_V7YMjDnK3DdVdiS4TrNb0OY7FLSGJRs4H9-TI6gYmqBjvGwC5QYOrallrjN6EL5WmMKXS2zxCuSIL3k02ql0kXg3YN7knJwrxiUjOmnrmXzVdNwS1aEzJfFqbhOFXlgLSe4gcHLycpjvR0T94BkhaQGvJkF9mZPUEAesbHfVlim0OMX-eQy2MVqS4zL4_Kr6Etgbxdahnh4-kDCpvHQ8YojqYCY',
  thumbBack:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuApJ27B8ovZrt3VYYBVdppklPENMxrTijMfTszvLEjLFRJdwLBQRLphBJLHz0TjhlUkQRfSwzXuwBBxYeosMEXULHX5Y1CKINuV7PQzVS2Vvv3RUtOLUG3hxXNQVLyJmptIW54fPUonR3-nbQ91FAHe0RupvkgfWpvh_lx0oUjTGaYgnvczZ61mYWvVlt7oqqstYan0LkBp9FaDqIds-1SEOCg-wRkkcQXRynOByOU',
  thumbMacro:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBuLAxQIo5XMujeVZDsnuMVVXkgz4mcersUTu5n9vaCeFmlzhib669KUtjCCI2SjZSPWPo5tCWICciegkZ_f4rg3EgleANZOfzAyQGYiseRZoFQM4EJwJ8B_9_EYfzW5SQDiTiyS0TiK0CLUfHgKyG9rYnNqDK9O0rKXoSI9LvjDVdE2Gmolzk3JeTwPmToWpx8lz27sI1BkX6sR6BPqeZ8VNVmbfntZHPbE2V8bx8',
};

export const sellerListing = {
  /** Slides shown in the main viewer (3) — the 4th thumbnail jumps back to slide 0. */
  gallery: [
    { src: SELLER_IMG.front, thumbSrc: SELLER_IMG.thumbFront, alt: 'PSA 10 리자몽 ex SAR 슬랩 전면', label: '대표' },
    { src: SELLER_IMG.back, thumbSrc: SELLER_IMG.thumbBack, alt: 'PSA 슬랩 후면 바코드', label: '후면' },
    { src: SELLER_IMG.macro, thumbSrc: SELLER_IMG.thumbMacro, alt: '카드 표면 홀로그램 확대', label: '상세 코너' },
  ] as readonly GalleryImage[],
  extraThumbs: [
    { src: SELLER_IMG.front, alt: '실물 인증 QR 태그', label: '실물인증', verified: true, targetIndex: 0 },
  ] as readonly GalleryImage[],
  breadcrumbs: [
    { label: '카드', to: `${ROUTES.search}?category=card` },
    { label: '포켓몬 카드', to: `${ROUTES.search}?category=pokemon` },
    { label: '포켓몬 151 (SV2a)' },
  ] as readonly BreadcrumbItem[],
  price: {
    label: '내 등록 판매 희망가',
    avgPrefix: '최근 실시간 체결 평균가:',
    avgValue: '320,000원',
    deltaNote: '시장 평균보다 약 6.2% 저렴하게 등록되어 빠른 판매가 예상됩니다.',
  },
  stats: { registered: '등록시간: 9일 전 (2025.02.16)', viewsLabel: '조회수', views: '1,420', wishLabel: '관심(찜)' },
  attributes: [
    { label: '거래 방식', kind: 'text', value: '택배 배송 / 직거래 (서울 남현동)' },
    { label: '제품 상태', kind: 'badge', value: 'PSA 10 (Gem Mint)' },
    { label: '카드 언어판본', kind: 'text', value: '한국어판 (SV2a 151)' },
    { label: '레어도/일련번호', kind: 'text', value: 'SAR (스페셜 아트 레어) / 201/165' },
    { label: 'PSA 인증 번호', kind: 'mono', value: '#84209184 (QR 조회 일치)' },
    { label: '에스크로 안전결제', kind: 'text', value: '전액 보호 보증 지원' },
  ] as readonly ListingAttribute[],
  management: {
    title: '판매자 전용 관리 도구',
    note: '구매자 화면의 [채팅하기] 버튼 대신 관리 도구가 활성화되었습니다.',
    discussionLabel: '품목 토론방 보기 (💬 21)',
    editLabel: '1. 상품수정',
    statusPrefix: '2. 상태: ',
    deleteLabel: '3. 상품삭제',
  },
  statusOptions: [
    { status: '판매중', label: '판매중 (현재)', hint: '노출 활성', dotClass: 'bg-primary' },
    { status: '예약중', label: '예약중', hint: '거래 협의중', dotClass: 'bg-logo-lime' },
    { status: '거래완료', label: '거래완료', hint: '시세 반영', dotClass: 'bg-muted', opensDealModal: true },
  ] as readonly StatusOption[],
  description: {
    title: '상품 정보 및 상세 설명',
    note: '작성자 본인 검증 승인 완료',
    expandLabel: '상품 정보 더보기',
    collapseLabel: '상품 정보 접기',
  },
  inspection: {
    title: '전문 검수 센터 기준 실물 상태 체결 보증표',
    badge: '100% 정품 인증 통과',
    points: [
      { label: '모서리 마모 (Edges)', value: '결점 없음 (0 Pt)' },
      { label: '표면 인쇄선 (Print Line)', value: '발견되지 않음' },
      { label: '좌우 밸런스 (Centering)', value: '55/45 표준 부합' },
      { label: '슬랩 케이스 스크래치', value: '미세 흠집 무결' },
    ] as readonly InspectionPoint[],
  },
  related: {
    title: '같은 품목의 다른 매물 실시간 시세',
    description: '경쟁 판매자의 등록 가격 및 거래 현황을 비교 분석하여 최적의 판매 전략을 수립하세요.',
    items: [
      {
        id: 'P-013-990101',
        category: '포켓몬 151 한국어판',
        title: '[PSA 10] 리자몽 ex SAR 풀세트',
        price: '315,000',
        location: '경기 성남시',
        timeAgo: '2일 전',
        imageAlt: 'PSA 10 리자몽 SAR 하드 슬랩',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDcg31K0ixd5WV1DthKFjN20KWSNaPfbXGILoWOZM6BvlEgzhIofxVfMwPIYEa01AVCjhnpIJLy9HZtNiXJ4IWZHpGJSWfORDTSs6b1kqlAPvvaCnyXtyCKTBIGeBT7TLbjv6IO5f34f_yRdrCXaBPJPeXLDFS4F-xuzmScC_fsEXQiLkGbnudc2NUA9PRJcJzA7VO0qi-JSH748xaUQpP5DaI_A3gYotjidYbUMTw',
      },
      {
        id: 'P-013-990102',
        category: '포켓몬 151 일본판',
        title: '[PSA 9] 리자몽 ex SAR 일판',
        price: '240,000',
        location: '서울 강남구',
        timeAgo: '4일 전',
        imageAlt: 'PSA 9 리자몽 일본판',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCzr9IdJFVgYekktxSLf4DVAKAxlcoLl1Ogvd9072E5tsDtWXL0AlUEV96VBLbypsgA7is3_MvvKrSW7ta8Uz7vUq_m1cjpFcRCx49nRLHBEqzaxzbHFwDXKux4sFht77k2m4gVdu4r3HL8Jci8ErCe8LimZJX7fvpVnwRu-seIUdpwaRvHQbZQR-2lw-Pl1lMYmvvJvn4zPmtivQnKIfWVY8XJDGC2fLLRPb3cRWw',
      },
      {
        id: 'P-013-990103',
        category: '포켓몬 151 한국어판',
        title: '리자몽 ex SAR 미등급 탑로더 포함',
        price: '185,000',
        location: '인천 송도',
        timeAgo: '5일 전',
        imageAlt: '미등급 리자몽 ex 탑로더',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCR34WN67UpON4ME67Bq3KE7nFpSz9OK6UUzxSj1nuzde5CHcm_p2t1peKQhy107gJ0ubHhTcAvA7LT2bfeyBP9yHv0goxwTA0n0kMjsbOLNRiEKUwBpaunCVoy0OLM5dlUA-RvGX46IS_-pu4NOVd5py2S-PpZwZW3sCISAJA6as5A5l95rwXUsAtSJN78Ig1mbvi-V4ofYJ4SBIq_dEq2dknCuiM9tEbnltXxtow',
      },
      {
        id: 'P-013-990104',
        category: '포켓몬 151 한국어판',
        title: '[BGS 9.5] 리자몽 ex SAR',
        price: '290,000',
        location: '부산 해운대구',
        timeAgo: '6일 전',
        imageAlt: 'BGS 9.5 포켓몬 카드',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlDKerWKtL_6RP76bJL0e-XV_KIWyqqV8werFAArAwzyQ1v1aDvJf9BhOs8BX9sqWaiCzUmeYTjs5gcN4QaBRD_1P2UBqtIx9eeKVnQ1xpxnZ9a0HhM8ZcptFjT7W38KYG-qT1njN-IIlvxutS05nnS5lQVQTcvOeMfs_cZexjAJpRtOJr_5bQaJAaWZP_3cFUea-aP0DdtckHZUsCK307RkAyjJClJH3jBKgwpE8',
      },
      {
        id: 'P-013-990105',
        category: '포켓몬 151 한국어판',
        title: '[PSA 10] 리자몽 ex SAR 직거래우대',
        price: '325,000',
        location: '대구 수성구',
        timeAgo: '1주일 전',
        imageAlt: 'PSA 10 리자몽 아크릴 케이스',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCOtSZVftadXZIWnBZ2c0Z1cZlUbqyHCfv7zbSWsSPgVnmLGewCBnnXrOfpUidkAEUIEP01oIewrAEu9B8myYKYtfa7UMnc9RjVXlal1cBEXFhUHVO7l3BmwBaWi_v02PTVfEJtWSmrtlAgWu0fN-wgbN_nBgQyQNIWqQEA6kz5KcSNdSSago6N3AntGq3MSPjQ2F6SZXThqDLHTujxVrYCt7NrmW4earlvdw6RVXs',
      },
      {
        id: 'P-013-990106',
        category: '포켓몬 151 일본판',
        title: '[CGC 10 Pristine] 리자몽 ex',
        price: '340,000',
        location: '대전 유성구',
        timeAgo: '8일 전',
        imageAlt: 'CGC 10 Pristine 슬랩',
        imageSrc:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCydm31WuNfj_xJdS5EFcrpdySHuSqvPDhg-3RfpP2r61nVSYS0an2b6fpEtQFU_ApuxtdU43oSJ2aepdO7j1kOeW_UWqVmazl-vCLAv2jWSIuOqnLHPwvVcMTw6Yn7X9OoIZtA1ccQySvP85VRovYia9Nsyyd4Qt_Dp3EPdN_6lqTEsh1U37ki2yhmXbPlc1B1iCJI2JWL1SL0MjNqDzGgMindf6VU12wkjPxJLE4',
      },
    ] as readonly RelatedListing[],
  },
  deleteModal: {
    title: '판매글 삭제 확인',
    question: '정말 해당 판매글을 영구 삭제하시겠습니까?',
    warning:
      '삭제 시 현재까지 누적된 관심(찜 38명)과 조회수 데이터가 모두 삭제되며 복구할 수 없습니다. 이미 구매 희망자와 채팅 중인 경우 거래 내역을 반드시 확인하세요.',
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
    buyerOptions: [
      '포켓몬수집왕 (채팅 내역 있음 - 직거래 협의 완료)',
      '카드마스터77 (채팅 내역 있음)',
      '기타 외부 거래 / 미등록 구매자',
    ],
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

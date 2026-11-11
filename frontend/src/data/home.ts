import { brand, ROUTES } from './layout';

export type Tone = 'brand' | 'info' | 'tertiary' | 'lime' | 'neutral';

export interface CategoryLink {
  readonly label: string;
  readonly to: string;
  readonly title?: string;
  readonly highlighted?: boolean;
}

export interface CategoryColumn {
  readonly id: string;
  readonly emoji: string;
  readonly tone: Tone;
  readonly title: string;
  readonly viewAllLabel: string;
  readonly viewAllTo: string;
  readonly links: readonly CategoryLink[];
  readonly footnote?: string;
}

export const categoryExplorer = {
  toggleLabel: '카테고리',
  title: '전체 수집 카테고리 (Category Explorer)',
  subtitle: '선택한 품목의 전문 검수 기준과 실거래 체결 데이터를 제공합니다.',
  columns: [
    {
      id: 'cards',
      emoji: '🃏',
      tone: 'lime',
      title: '카드 (Cards & TCG)',
      viewAllLabel: '전체보기 →',
      viewAllTo: `${ROUTES.search}?category=cards`,
      links: [
        { label: '포켓몬 (Pokemon TCG)', to: `${ROUTES.search}?category=pokemon`, title: '포켓몬 카드 전문 거래관 (P-009)', highlighted: true },
        { label: '원피스 (One Piece Card Game)', to: `${ROUTES.search}?category=onepiece` },
        { label: '스포츠 (NBA / MLB / 축구 카드)', to: `${ROUTES.search}?category=sports` },
        { label: '유희왕 (Yu-Gi-Oh!)', to: `${ROUTES.search}?category=yugioh` },
      ],
    },
    {
      id: 'sneakers',
      emoji: '👟',
      tone: 'info',
      title: '운동화 (Sneakers)',
      viewAllLabel: '전체보기 →',
      viewAllTo: `${ROUTES.search}?category=sneakers`,
      links: [
        { label: '나이키 조던 (Air Jordan 1~14)', to: `${ROUTES.search}?category=jordan` },
        { label: '콜라보 제품 (트래비스 스캇 / 사카이 / 오프화이트)', to: `${ROUTES.search}?category=collab` },
        { label: '덩크 (Nike Dunk Low / High / SB)', to: `${ROUTES.search}?category=dunk` },
      ],
    },
    {
      id: 'luxury',
      emoji: '💎',
      tone: 'brand',
      title: '명품 (Luxury)',
      viewAllLabel: '전체보기 →',
      viewAllTo: `${ROUTES.search}?category=luxury`,
      links: [
        { label: '가방 (샤넬 / 루이비통 / 에르메스)', to: `${ROUTES.search}?category=bags` },
        { label: '지갑 (카드홀더 / 장지갑 / 클러치)', to: `${ROUTES.search}?category=wallets` },
        { label: '시계 (롤렉스 / 오메가 / 까르띠에)', to: `${ROUTES.search}?category=watches` },
        { label: '주얼리 (티파니 / 반클리프 아펠)', to: `${ROUTES.search}?category=jewelry` },
      ],
      footnote: '* 하위 세부 분류 정밀검수 기준 확정 운영 중',
    },
  ] as readonly CategoryColumn[],
  banner: {
    title: '⚡ 오늘의 신규 등록 수집품:',
    body: '포켓몬 151 마스터볼 미러 18건, 조던 1 하이 시카고 6건이 방금 업데이트되었습니다.',
    linkLabel: '실시간 매물 보기 →',
    linkTo: ROUTES.search,
  },
};

export const heroData = {
  /** Original design image (broken placeholder) kept for reference; rendered with brand.logoDarkSrc. */
  designLogoSrc:
    'https://lh3.googleusercontent.com/aida/ALJJyrAv8esW7-afjVePDDktq3C2-TUVd_JDLd2FOX1RUDqngvzyreOUX_iMWYynht7GMymdy-YHID9VDuR2B_Mbga55XXowZzrfLJvELgX3tZymBmWLQdYG1GpfQgHopKAn4dM6VcYNks03Hx2cbbUIO51Dn0TXod_Wb-7up7OW1bJTaM1U46IOxoxmEyUAdoGt8C3HZJmzAIPwL5QZygmSYK-oowCy7iN8cE0UX6y7NOCf',
  logoSrc: brand.logoDarkSrc,
  logoAlt: brand.name,
  badgeParts: ['● 실시간 검수 에스크로 연동', '·', '공식 시세 엔진'],
  slogan: brand.slogan,
  description: '한정판 수집품 & 트레이딩 카드, 정확한 실거래가 기반으로 안전하게 거래하세요',
  trustChips: ['에스크로 안전 대금 보호'],
};

export type ProductVisualShape = 'card' | 'box' | 'circle';

export interface RankingProduct {
  readonly id: string;
  readonly filter: RankingFilterId;
  readonly categoryLabel: string;
  readonly tone: Tone;
  readonly change: string;
  readonly trend: 'up' | 'flat';
  readonly visual: {
    readonly shape: ProductVisualShape;
    readonly tone: Tone;
    readonly emoji: string;
    readonly title: string;
    readonly caption?: string;
  };
  readonly name: string;
  readonly subtitle: string;
  readonly priceLabel: string;
  readonly price: string;
}

export type RankingFilterId = 'all' | 'pokemon' | 'sneakers' | 'watches';

export interface RankingFilter {
  readonly id: RankingFilterId;
  readonly label: string;
}

export const rankingSection = {
  eyebrow: 'MARKET RANKING',
  eyebrowNote: '· 방금 체결 완료된 거래 목록',
  title: '실시간 급상승 및 거래량 TOP 수집품',
  buyLabel: '즉시구매',
  sellLabel: '판매등록',
  emptyLabel: '해당 카테고리의 거래 내역이 없습니다.',
  filters: [
    { id: 'all', label: '전체' },
    { id: 'pokemon', label: '포켓몬 카드' },
    { id: 'sneakers', label: '스니커즈' },
    { id: 'watches', label: '명품 시계' },
  ] as readonly RankingFilter[],
};

export const rankingProducts: readonly RankingProduct[] = [
  {
    id: 'P010-pokemon-151',
    filter: 'pokemon',
    categoryLabel: '포켓몬 TCG',
    tone: 'brand',
    change: '▲ 12.8%',
    trend: 'up',
    visual: { shape: 'card', tone: 'lime', emoji: '⚡', title: 'POKEMON 151', caption: 'EN/JP BOOSTER' },
    name: '포켓몬 카드 151 부스터 박스 (미개봉)',
    subtitle: '일본 정품 슈링크 보존팩',
    priceLabel: '최근 거래가',
    price: '215,000원',
  },
  {
    id: 'P010-aj1-chicago',
    filter: 'sneakers',
    categoryLabel: '나이키 조던',
    tone: 'info',
    change: '▲ 3.4%',
    trend: 'up',
    visual: { shape: 'box', tone: 'neutral', emoji: '👟', title: 'AIR JORDAN 1 HIGH' },
    name: '에어 조던 1 레트로 하이 OG 시카고 2022',
    subtitle: 'Lost & Found (270mm 기준)',
    priceLabel: '최근 거래가',
    price: '489,000원',
  },
  {
    id: 'P010-op05-luffy',
    filter: 'all',
    categoryLabel: '원피스 카드',
    tone: 'tertiary',
    change: '▲ 24.1%',
    trend: 'up',
    visual: { shape: 'card', tone: 'tertiary', emoji: '🏴‍☠️', title: 'ONE PIECE', caption: 'OP-05 PARALLEL' },
    name: '신시대의 주역 루피 기어5 만화 패러렐',
    subtitle: '슈퍼패러렐 SEC 등급카드',
    priceLabel: '최근 거래가',
    price: '3,200,000원',
  },
  {
    id: 'P010-rolex-submariner',
    filter: 'watches',
    categoryLabel: '명품 시계',
    tone: 'brand',
    change: '- 0.2%',
    trend: 'flat',
    visual: { shape: 'circle', tone: 'neutral', emoji: '⌚', title: 'SUBMARINER' },
    name: '롤렉스 서브마리너 데이트 41mm 스틸',
    subtitle: 'Ref. 126610LN 국내백화점',
    priceLabel: '최근 거래가',
    price: '18,400,000원',
  },
];

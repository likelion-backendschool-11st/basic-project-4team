import { ROUTES } from './layout';

export type ChartMode = 'line' | 'bar';
export type ViewMode = 'grid' | 'list';
export type PriceSortKey = 'volume' | 'priceDesc' | 'priceAsc' | 'rising' | 'falling';

export interface LabeledCount {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

export interface InsightCard {
  readonly id: string;
  readonly emoji: string;
  readonly title: string;
  readonly value: string;
  readonly changeLabel: string;
  /** up → error(red), accent → primary(green), flat → muted. */
  readonly tone: 'up' | 'accent' | 'flat';
  readonly caption: string;
}

export interface HeadlineStat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone: 'neutral' | 'down' | 'up';
  readonly emphasis?: boolean;
  readonly helpIcon?: boolean;
}

export interface ChartPoint {
  readonly date: string;
  readonly price: number;
  readonly volume: number;
  readonly highlight?: boolean;
}

export interface TopGainer {
  readonly id: string;
  readonly rank: number;
  readonly name: string;
  readonly imageAlt: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly change: number;
  readonly volume: number;
  /** SVG path in a 60x24 viewBox. */
  readonly sparkline: string;
}

export interface PriceCard {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];
  readonly subOptionId: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly change1d: number;
  readonly change7d: number;
  readonly change30d: number;
  readonly volume30d: number;
  /** SVG path in a 200x40 viewBox. */
  readonly sparkline: string;
}

const IMG_A =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTIXsmhj7prA6OZNt7v9NW4Rt1DJd7IWcyEmOfgOUO2CbEvkbCSSeZo5jfpYnOJcfWG-u5APLIDWZbabc7l2TgnICHJTxXbeEHh3AhCxnGc0YW2_VyZyi10UasjGY6AcjB246jwBHmEDStfNfW9FGTN-kj5swk2iZ9u1_Cw86yPiX1mHHUVLOR_BoWPJwMC-gHlbNshUc9iuY2wHfdM9pJwyMK5cce2kgxbLHjQm8';
const IMG_B =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD9VwvHg5HT3RgCxKiF3RWH2Wp47R_TVH6CoXDGDYlaMCIdQaexDpXXhnBFUB4gtlQA74jj9VfEF1XGK6V34IQYoUYYu8ZSW1oS4r6aYeMmtwMRZ6SGkeoHomyfivefjzs3mIOKTIYoAduszBnjflyd5NhpqqCBpob-wMt90ca8lAQQ0sePLbflyIUsEson8MQn1QdGkAu0_J82Nu6oCWqxVzApQyH0hSIbNeCVTLU';
const IMG_C =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAYQ9W-qiyhg1d8AzMRJwPcwFL4KNR-8Y4OvXFMFCLILYKZF-j3SssZHjIq-bEUhAm0CZBXS8BRJhr10qMwzIHX8pydX1Kt3DHOKP4gms2nJ8dRFxHrrveVRMQbrup_w28V7J9ehj3gH7BxY2f15JwpXmcn-adcuolQGMZVhN26z29SVVhn4CsZu7rVc8GArFJS_RJG2J7wqPTDwq37FfToCrz5fDiN3m3ci8mls5I';

export const marketHeader = {
  title: '포켓몬 카드 시세',
  badge: 'Beta',
  syncLabel: '실시간 체결 시세 연동',
  gradeLabel: '등급',
  noticePrefix: '최근 30일 동안 RE:PICK에서 거래된',
  noticeStrong: 'Ungraded 싱글카드',
  noticeSuffix: '시세입니다.',
  chips: ['기준일: 25/11/10 (최근 30일)', '차트 기준: Ungraded A'],
};

export const categoryTabs: readonly LabeledCount[] = [
  { id: 'pokemon', label: '포켓몬', count: 0 },
  { id: 'onepiece', label: '원피스', count: 0 },
];

export const gradeFilters: readonly LabeledCount[] = [
  { id: 'ungraded', label: 'Ungraded', count: 824 },
  { id: 'psa10', label: 'PSA 10', count: 1357 },
  { id: 'psa9', label: 'PSA 9', count: 176 },
  { id: 'psa8', label: 'PSA 8', count: 7 },
  { id: 'brg10', label: 'BRG 10', count: 383 },
  { id: 'brg9', label: 'BRG 9', count: 239 },
  { id: 'brg85', label: 'BRG 8.5', count: 3 },
  { id: 'brg8', label: 'BRG 8', count: 8 },
];

export const insightSection = {
  title: '어제 시장 인사이트',
  cards: [
    { id: 'rising', emoji: '🔥', title: '가격 상승', value: '18종', changeLabel: '+19.5%', tone: 'up', caption: '전일 대비 가격 상승' },
    { id: 'reversal', emoji: '↗️', title: '상승 전환', value: '10종', changeLabel: '+17.6%', tone: 'accent', caption: '하락 후 상승 전환' },
    { id: 'value', emoji: '💎', title: '거래량 대비 저렴', value: '5종', changeLabel: '0.0%', tone: 'flat', caption: '거래량 급증 · 시세 안정' },
  ] as readonly InsightCard[],
};

export const chartSection = {
  title: '30일 시세 · 거래량',
  modes: [
    { id: 'line' as ChartMode, label: '선', icon: 'show_chart' },
    { id: 'bar' as ChartMode, label: '막대', icon: 'bar_chart' },
  ],
  stats: [
    { id: 'median', label: '최근 체결가 중앙값', value: '32,417원', tone: 'neutral', emphasis: true, helpIcon: true },
    { id: 'd1', label: '1일 전', value: '-21.2%', tone: 'down' },
    { id: 'd7', label: '7일 전', value: '-11.2%', tone: 'down' },
    { id: 'd30', label: '30일 전', value: '-11.9%', tone: 'down' },
    { id: 'volume', label: '30일 총 거래량', value: '4,664건', tone: 'neutral' },
  ] as readonly HeadlineStat[],
  priceDomain: [20000, 50000] as const,
  volumeMax: 400,
  priceTicks: ['5만', '4만', '3만', '2만'],
  volumeTicks: ['400건', '300건', '200건', '100건', '0건'],
  xLabels: ['10/11', '10/16', '10/21', '10/26', '10/31', '11/05', '11/10'],
  legend: { price: '시세(원)', volume: '거래량(건)' },
  points: [
    { date: '10/11', price: 27100, volume: 240 },
    { date: '10/12', price: 30300, volume: 300 },
    { date: '10/14', price: 32600, volume: 180 },
    { date: '10/15', price: 30300, volume: 220 },
    { date: '10/16', price: 33400, volume: 270 },
    { date: '10/18', price: 29500, volume: 160 },
    { date: '10/19', price: 31800, volume: 280 },
    { date: '10/20', price: 31100, volume: 260 },
    { date: '10/21', price: 31800, volume: 250 },
    { date: '10/23', price: 27900, volume: 190 },
    { date: '10/24', price: 25500, volume: 140 },
    { date: '10/26', price: 38200, volume: 380, highlight: true },
    { date: '10/27', price: 28700, volume: 260 },
    { date: '10/28', price: 31100, volume: 170 },
    { date: '10/30', price: 29500, volume: 200 },
    { date: '10/31', price: 27100, volume: 230 },
    { date: '11/01', price: 27900, volume: 180 },
    { date: '11/03', price: 30300, volume: 210 },
    { date: '11/04', price: 26300, volume: 160 },
    { date: '11/05', price: 29500, volume: 190 },
    { date: '11/07', price: 23900, volume: 120 },
    { date: '11/08', price: 32600, volume: 340, highlight: true },
    { date: '11/10', price: 27100, volume: 240 },
  ] as readonly ChartPoint[],
};

export const topGainersSection = {
  title: '전일 상승 Top 5',
  caption: '체결가 기준',
  volumePrefix: '거래량',
  volumeSuffix: '건',
  items: [
    {
      id: 'reshiram-ex-bwr',
      rank: 1,
      name: '레시라무 ex BWR 화이트플레어...',
      imageAlt: '레시라무 ex BWR',
      imageUrl: IMG_A,
      price: 179000,
      change: 57.0,
      volume: 17,
      sparkline: 'M2,20 L15,18 L28,14 L38,16 L50,6 L58,4',
    },
    {
      id: 'sylveon-ex-sar-30th',
      rank: 2,
      name: '님피아 ex SAR 30주년 기념',
      imageAlt: '님피아 ex SAR',
      imageUrl: IMG_B,
      price: 30000,
      change: 50.0,
      volume: 58,
      sparkline: 'M2,18 L10,22 L20,8 L30,19 L45,7 L58,10',
    },
    {
      id: 'mew-ex-p-sv-promo',
      rank: 3,
      name: '뮤 ex P 스칼렛 & 바이올렛 프로...',
      imageAlt: '뮤 ex P 스칼렛',
      imageUrl: IMG_C,
      price: 140000,
      change: 40.0,
      volume: 2,
      sparkline: 'M2,22 L20,18 L40,11 L58,4',
    },
    {
      id: 'mega-charizard-x-ex-sar',
      rank: 4,
      name: '메가리자몽X ex SAR 메가 확장...',
      imageAlt: '메가리자몽X ex SAR',
      imageUrl: IMG_A,
      price: 189000,
      change: 30.3,
      volume: 47,
      sparkline: 'M2,16 L12,20 L25,12 L38,19 L48,9 L58,12',
    },
    {
      id: 'museum-pikachu',
      rank: 5,
      name: '박물관 피카츄 자연사 박물관 한...',
      imageAlt: '박물관 피카츄',
      imageUrl: IMG_B,
      price: 65000,
      change: 30.0,
      volume: 55,
      sparkline: 'M2,19 L14,14 L26,20 L38,9 L49,17 L58,12',
    },
  ] as readonly TopGainer[],
};

export const priceGridSection = {
  title: '카드 시세 (실시간 품목별 체결가 및 추이)',
  caption: '체결 완료 데이터 기반 실시간 반영',
  searchPlaceholder: '🔍 카드명, 세트명, 모델명 검색...',
  subOptionLabel: '세부 옵션',
  subOptions: [
    { id: 'all', label: '전체', count: 824 },
    { id: 'ungraded-a', label: 'Ungraded A', count: 743 },
    { id: 'ungraded-a-card', label: 'Ungraded A (Card Ver.)', count: 62 },
    { id: 'ungraded-a-pack', label: 'Ungraded A (Pack Ver.)', count: 19 },
  ] as readonly LabeledCount[],
  sortOptions: [
    { key: 'volume' as PriceSortKey, label: '거래순' },
    { key: 'priceDesc' as PriceSortKey, label: '가격높은순' },
    { key: 'priceAsc' as PriceSortKey, label: '가격낮은순' },
    { key: 'rising' as PriceSortKey, label: '급상승순' },
    { key: 'falling' as PriceSortKey, label: '급하락순' },
  ],
  viewModes: [
    { id: 'grid' as ViewMode, icon: 'grid_view', label: '그리드 보기' },
    { id: 'list' as ViewMode, icon: 'view_list', label: '리스트 보기' },
  ],
  medianLabel: '최근 체결가 중앙값',
  metricLabels: { d1: '1일 변동', d7: '7일 변동', d30: '30일 변동', volume: '30일 거래량' },
  volumeSuffix: '건',
  currency: '원',
  loadMoreLabel: '더 많은 싱글카드 시세 보기',
  totalItems: 824,
  pageSize: 9,
  summary: (total: number, shown: number) => `총 ${total}개 품목 중 ${shown}개 표시 중`,
  emptyLabel: '검색 결과가 없습니다.',
};

export const priceCards: readonly PriceCard[] = [
  {
    id: 'magikarp-mega-festa-2026-promo',
    name: '메가 페스타 2026 프로모 카드 잉어킹',
    tags: ['Ungraded A (Pack Ver.)'],
    subOptionId: 'ungraded-a-pack',
    imageUrl: IMG_A,
    price: 32000,
    change1d: 0,
    change7d: 10.3,
    change30d: -3.0,
    volume30d: 565,
    sparkline: 'M 5,20 Q 25,22 45,18 T 85,24 T 125,20 T 165,22 T 195,20',
  },
  {
    id: 'charizard-rh-30th-kr',
    name: '리자몽 RH 30주년 기념 (한글판)',
    tags: ['Ungraded A', 'KR'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_B,
    price: 58000,
    change1d: 1.8,
    change7d: -7.9,
    change30d: -28.4,
    volume30d: 134,
    sparkline: 'M 5,25 Q 35,28 65,22 T 110,26 T 150,15 T 195,12',
  },
  {
    id: 'mew-ex-fur-30th-kr',
    name: '뮤 ex FUR 30주년 기념 (한글판)',
    tags: ['Ungraded A', 'KR'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_C,
    price: 27000,
    change1d: 0,
    change7d: -6.9,
    change30d: -35.7,
    volume30d: 125,
    sparkline: 'M 5,20 Q 30,22 55,18 T 105,24 T 150,19 T 195,20',
  },
  {
    id: 'mewtwo-ex-fur-30th-kr',
    name: '뮤츠 ex FUR 30주년 기념 (한글판)',
    tags: ['Ungraded A', 'KR'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_A,
    price: 20000,
    change1d: 0,
    change7d: -20.0,
    change30d: -45.9,
    volume30d: 125,
    sparkline: 'M 5,20 Q 30,22 55,20 T 105,25 T 150,18 T 195,20',
  },
  {
    id: 'pikachu-ex-sar-30th-kr',
    name: '피카츄 ex SAR 30주년 기념 (한글판)',
    tags: ['Ungraded A', 'KR'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_B,
    price: 27000,
    change1d: 22.7,
    change7d: 0,
    change30d: -25.0,
    volume30d: 113,
    sparkline: 'M 5,30 Q 35,28 65,26 T 110,24 T 150,15 T 195,10',
  },
  {
    id: 'lugia-rs-30th-kr',
    name: '루기아 RS 30주년 기념 (한글판)',
    tags: ['Ungraded A', 'KR'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_C,
    price: 39000,
    change1d: -4.9,
    change7d: -9.3,
    change30d: -29.1,
    volume30d: 108,
    sparkline: 'M 5,14 Q 35,12 65,18 T 110,22 T 150,26 T 195,30',
  },
  {
    id: 'mew-ex-fur-30th-jp',
    name: '뮤 ex FUR 30주년 기념',
    tags: ['Ungraded A', 'JP'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_A,
    price: 53000,
    change1d: 15.2,
    change7d: -3.6,
    change30d: -28.4,
    volume30d: 103,
    sparkline: 'M 5,28 Q 35,26 65,22 T 110,20 T 150,14 T 195,10',
  },
  {
    id: 'mew-ex-sar-30th-jp',
    name: '뮤 ex SAR 30주년 기념',
    tags: ['Ungraded A', 'JP'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_B,
    price: 44000,
    change1d: -2.2,
    change7d: -17.0,
    change30d: -34.3,
    volume30d: 100,
    sparkline: 'M 5,20 Q 30,12 60,18 T 110,22 T 160,25 T 195,26',
  },
  {
    id: 'pikachu-ex-sar-30th-jp',
    name: '피카츄 ex SAR 30주년 기념',
    tags: ['Ungraded A', 'JP'],
    subOptionId: 'ungraded-a',
    imageUrl: IMG_C,
    price: 51000,
    change1d: 15.9,
    change7d: 0,
    change30d: -24.0,
    volume30d: 148,
    sparkline: 'M 5,26 Q 30,28 60,20 T 110,18 T 160,12 T 195,10',
  },
];

/** Where price-related cards/rows navigate to. */
export const marketLinks = {
  item: (id: string) => ROUTES.itemDiscussion(id),
};

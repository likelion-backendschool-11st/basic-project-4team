import type { MarketGradeOption, MarketPriceSort } from '../api/types';
import { ROUTES } from './layout';

export type ChartMode = 'line' | 'bar';
export type ViewMode = 'grid' | 'list';
export type PriceSortKey = MarketPriceSort;

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
  readonly slug: string;
  readonly rank: number;
  readonly name: string;
  readonly imageAlt: string;
  readonly imageUrl: string | null;
  readonly price: number;
  readonly change: number;
  readonly volume: number;
  /** SVG path in a 60x24 viewBox. */
  readonly sparkline: string;
}

export interface PriceCard {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly tags: readonly string[];
  readonly imageUrl: string | null;
  readonly price: number;
  /** 기준이 될 거래가 없으면 null ("-"로 표시). */
  readonly change1d: number | null;
  readonly change7d: number | null;
  readonly change30d: number | null;
  readonly volume30d: number;
  /** SVG path in a 200x40 viewBox. */
  readonly sparkline: string;
}

/** 등급 필터의 "전체" id — API에는 grade=all로 보낸다. */
export const ALL_GRADES = 'all';

const CONDITION_LABELS: Readonly<Record<string, string>> = {
  unopened: '미개봉',
  opened_raw: '개봉 (Raw)',
};

const LANGUAGE_LABELS: Readonly<Record<string, string>> = { ko: 'KR', ja: 'JP', en: 'EN', zh: 'CN' };

/** 등급 키 표시 이름: psa-10 → "PSA 10", unopened → "미개봉". */
export const gradeLabel = (grade: Pick<MarketGradeOption, 'key' | 'gradingService' | 'grade'>): string =>
  grade.gradingService && grade.grade ? `${grade.gradingService} ${grade.grade}` : (CONDITION_LABELS[grade.key] ?? grade.key);

/** 카드 태그: 등급 + 언어. */
export const priceCardTags = (
  grade: Pick<MarketGradeOption, 'key' | 'gradingService' | 'grade'>,
  language: string | null,
): readonly string[] => [gradeLabel(grade), ...(language && LANGUAGE_LABELS[language] ? [LANGUAGE_LABELS[language]] : [])];

/** 'YYYY-MM-DD' → 'MM/DD'. */
export const shortDate = (date: string): string => `${date.slice(5, 7)}/${date.slice(8, 10)}`;

export const marketHeader = {
  title: (categoryName: string) => `${categoryName} 시세`,
  emptyTitle: '시세',
  badge: 'Beta',
  syncLabel: '거래완료 체결가 기준',
  gradeLabel: '등급',
  allGradesLabel: '전체',
  noticePrefix: '최근 30일 동안 RE:PICK에서 거래완료된',
  noticeSuffix: '체결가 기준 시세입니다. (참고용)',
  allGradesNotice: '전체 등급',
  chips: (to: string, grade: string) => [`기준일: ${to.slice(2).replace(/-/g, '/')} (최근 30일)`, `차트 기준: ${grade}`],
  loading: '시세를 불러오는 중입니다…',
  error: '시세를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  empty: '최근 30일 동안 거래완료된 품목이 없습니다.',
};

export const insightSection = {
  title: '시장 인사이트',
  rising: { id: 'rising', emoji: '🔥', title: '가격 상승', caption: '직전 거래일 대비 시세 상승 품목 · 평균 상승률' },
  falling: { id: 'falling', emoji: '🧊', title: '가격 하락', caption: '직전 거래일 대비 시세 하락 품목 · 평균 하락률' },
  volume: { id: 'volume', emoji: '📦', title: '최근 7일 거래', caption: '그 전 7일 대비 거래 건수 증감' },
  itemUnit: '종',
  tradeUnit: '건',
};

export const chartSection = {
  title: '30일 시세 · 거래량',
  modes: [
    { id: 'line' as ChartMode, label: '선', icon: 'show_chart' },
    { id: 'bar' as ChartMode, label: '막대', icon: 'bar_chart' },
  ],
  statLabels: {
    average: '30일 평균 체결가',
    d1: '직전 거래일',
    d7: '7일 전',
    d30: '30일 전',
    volume: '30일 총 거래량',
  },
  volumeSuffix: '건',
  currency: '원',
  legend: { price: '일 평균 체결가(원)', volume: '거래량(건)' },
  empty: '최근 30일 거래가 없습니다.',
  xLabelCount: 7,
};

export const topGainersSection = {
  title: '전일 상승 Top 5',
  caption: '직전 거래일 대비',
  volumePrefix: '30일 거래',
  volumeSuffix: '건',
  limit: 5,
  empty: '시세가 오른 품목이 없습니다.',
};

export const priceGridSection = {
  title: '품목별 시세 (체결가 및 추이)',
  caption: '거래완료 즉시 반영',
  searchPlaceholder: '품목명, 세트명, 카드번호 검색...',
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
  medianLabel: '최근 거래일 체결가 중앙값',
  metricLabels: { d1: '전일 변동', d7: '7일 변동', d30: '30일 변동', volume: '30일 거래량' },
  volumeSuffix: '건',
  currency: '원',
  loadMoreLabel: '더 많은 품목 시세 보기',
  pageSize: 9,
  searchDelayMs: 300,
  summary: (total: number, shown: number) => `총 ${total}개 품목 중 ${shown}개 표시 중`,
  emptyLabel: '검색 결과가 없습니다.',
  error: '품목 시세를 불러오지 못했습니다.',
};

/** Where price-related cards/rows navigate to. */
export const marketLinks = {
  item: (slug: string) => ROUTES.itemDiscussion(slug),
};

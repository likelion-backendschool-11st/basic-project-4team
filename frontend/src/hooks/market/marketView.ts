import type { MarketChart, MarketFilters, MarketInsights, MarketTopGainer } from '../../api/types';
import { toAssetUrl } from '../../api/client';
import {
  ALL_GRADES,
  type ChartPoint,
  chartSection,
  gradeLabel,
  type HeadlineStat,
  type InsightCard,
  insightSection,
  type LabeledCount,
  marketHeader,
  shortDate,
  type TopGainer,
} from '../../data/market';
import { formatCompactWon, formatNumber, formatPercent, niceCeil, sparklinePath, trendOf } from './marketFormat';

const toneOf = (value: number | null): HeadlineStat['tone'] => {
  const trend = trendOf(value);
  return trend === 'flat' ? 'neutral' : trend;
};

/** 카테고리 탭 + 등급 필터("전체" 포함) + 선택한 등급 이름. */
export const toHeaderView = (filters: MarketFilters, grade: string) => {
  const grades: LabeledCount[] = [
    { id: ALL_GRADES, label: marketHeader.allGradesLabel, count: filters.totalTradeCount },
    ...filters.grades.map((g) => ({ id: g.key, label: gradeLabel(g), count: g.tradeCount })),
  ];
  const selected = filters.grades.find((g) => g.key === grade);
  const selectedLabel = selected ? gradeLabel(selected) : marketHeader.allGradesNotice;
  return {
    title: filters.category ? marketHeader.title(filters.category.name) : marketHeader.emptyTitle,
    tabs: filters.categories.map((c) => ({ id: c.code, label: c.name, count: c.tradeCount })),
    grades,
    noticeStrong: selectedLabel,
    chips: marketHeader.chips(filters.period.to, selectedLabel),
  };
};

/** 상승·하락 품목 수, 최근 7일 거래 건수 카드. */
export const toInsightCards = (insights: MarketInsights): readonly InsightCard[] => [
  {
    ...insightSection.rising,
    value: `${insights.rising.count}${insightSection.itemUnit}`,
    changeLabel: formatPercent(insights.rising.averageChangeRate),
    tone: 'up',
  },
  {
    ...insightSection.falling,
    value: `${insights.falling.count}${insightSection.itemUnit}`,
    changeLabel: formatPercent(insights.falling.averageChangeRate),
    tone: 'accent',
  },
  {
    ...insightSection.volume,
    value: `${formatNumber(insights.volume.tradeCount7d)}${insightSection.tradeUnit}`,
    changeLabel: formatPercent(insights.volume.changeRate),
    tone: 'flat',
  },
];

/** 차트 위 요약 숫자. */
export const toHeadlineStats = ({ summary }: MarketChart): readonly HeadlineStat[] => [
  {
    id: 'average',
    label: chartSection.statLabels.average,
    value: summary.averagePrice === null ? '-' : `${formatNumber(summary.averagePrice)}${chartSection.currency}`,
    tone: 'neutral',
    emphasis: true,
  },
  { id: 'd1', label: chartSection.statLabels.d1, value: formatPercent(summary.change1d), tone: toneOf(summary.change1d) },
  { id: 'd7', label: chartSection.statLabels.d7, value: formatPercent(summary.change7d), tone: toneOf(summary.change7d) },
  { id: 'd30', label: chartSection.statLabels.d30, value: formatPercent(summary.change30d), tone: toneOf(summary.change30d) },
  {
    id: 'volume',
    label: chartSection.statLabels.volume,
    value: `${formatNumber(summary.tradeCount)}${chartSection.volumeSuffix}`,
    tone: 'neutral',
  },
];

/** 일별 포인트 → 차트 축 범위·눈금. 거래량이 가장 많은 날을 강조한다. */
export const toChartView = ({ points: raw }: MarketChart) => {
  const maxVolume = Math.max(0, ...raw.map((p) => p.tradeCount));
  const points: ChartPoint[] = raw.map((p) => ({
    date: shortDate(p.date),
    price: p.averagePrice,
    volume: p.tradeCount,
    highlight: maxVolume > 0 && p.tradeCount === maxVolume,
  }));
  const prices = raw.map((p) => p.averagePrice);
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : 1;
  const pad = Math.max((high - low) * 0.15, high * 0.05, 1);
  const priceDomain: readonly [number, number] = [Math.max(0, low - pad), high + pad];
  const volumeMax = niceCeil(maxVolume);

  // 위에서 아래로 4개 가격 눈금, 5개 거래량 눈금
  const priceTicks = [0, 1, 2, 3].map((i) =>
    formatCompactWon(priceDomain[1] - ((priceDomain[1] - priceDomain[0]) * i) / 3),
  );
  const volumeTicks = [0, 1, 2, 3, 4].map((i) => `${formatNumber(Math.round((volumeMax * (4 - i)) / 4))}${chartSection.volumeSuffix}`);
  const labelEvery = Math.max(1, Math.ceil(points.length / chartSection.xLabelCount));
  const xLabels = points.filter((_, i) => i % labelEvery === 0).map((p) => p.date);

  return { points, priceDomain, volumeMax, priceTicks, volumeTicks, xLabels };
};

/** 상승 Top 행. 같은 품목의 다른 등급이 함께 오를 수 있어 id는 품목+등급. */
export const toTopGainers = (items: readonly MarketTopGainer[]): readonly TopGainer[] =>
  items.map((item) => ({
    id: `${item.itemId}:${item.gradeKey}`,
    slug: item.slug,
    rank: item.rank,
    name: `${item.name} · ${gradeLabel({ key: item.gradeKey, gradingService: item.gradingService, grade: item.grade })}`,
    imageAlt: item.name,
    imageUrl: item.imageUrl ? toAssetUrl(item.imageUrl) : null,
    price: item.price,
    change: item.change1d ?? 0,
    volume: item.tradeCount30d,
    sparkline: sparklinePath(item.sparkline, 60, 24),
  }));

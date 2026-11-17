export type Trend = 'up' | 'down' | 'flat';

/** 변동률 → 방향. 기준이 없어 null이면 flat. */
export const trendOf = (value: number | null): Trend =>
  value === null ? 'flat' : value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

/** +10.3% / -3.0% / 0.0%. 기준이 없어 null이면 "-". */
export const formatPercent = (value: number | null): string =>
  value === null ? '-' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export const formatNumber = (value: number): string => value.toLocaleString('ko-KR');

/** 축 눈금용 짧은 금액: 1억 2,000만 → "1.2억", 35,000 → "3.5만", 900 → "900". */
export const formatCompactWon = (value: number): string => {
  const trim = (n: number) => String(Math.round(n * 10) / 10);
  if (value >= 100_000_000) return `${Math.round((value / 100_000_000) * 100) / 100}억`;
  if (value >= 10_000) return `${trim(value / 10_000)}만`;
  return formatNumber(Math.round(value));
};

/** max 이상인 1·2·5×10ⁿ 꼴의 보기 좋은 수. */
export const niceCeil = (max: number): number => {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 5, 10].find((n) => n * magnitude >= max) ?? 10;
  return step * magnitude;
};

/** 가격 배열 → width×height 박스의 꺾은선 SVG path. 값이 1개면 가운데 수평선. */
export const sparklinePath = (values: readonly number[], width: number, height: number, padding = 2): string => {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const usable = height - padding * 2;
  const y = (v: number) => (max === min ? height / 2 : padding + (1 - (v - min) / (max - min)) * usable);
  if (values.length === 1) return `M${padding},${y(values[0]).toFixed(1)} L${width - padding},${y(values[0]).toFixed(1)}`;
  const step = (width - padding * 2) / (values.length - 1);
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(padding + step * i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
};

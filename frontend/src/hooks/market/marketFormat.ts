export type Trend = 'up' | 'down' | 'flat';

export const trendOf = (value: number): Trend => (value > 0 ? 'up' : value < 0 ? 'down' : 'flat');

/** +10.3% / -3.0% / 0.0% */
export const formatPercent = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export const formatNumber = (value: number): string => value.toLocaleString('ko-KR');

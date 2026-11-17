import { apiRequest } from './client';
import type {
  MarketChart,
  MarketFilters,
  MarketInsights,
  MarketPricePage,
  MarketPriceSort,
  MarketTopGainer,
} from './types';

/** 카테고리 코드 + 등급 키('all'이면 전체). */
export interface MarketQuery {
  readonly category: string;
  readonly grade: string;
}

const toQuery = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

/** MARKET-01 카테고리 탭·등급별 거래 건수. category를 비우면 최근 거래가 있는 첫 카테고리. */
export const getMarketFilters = (category?: string): Promise<MarketFilters> =>
  apiRequest<MarketFilters>(`/market/filters${toQuery({ category })}`);

/** MARKET-02 상승·하락 품목 수, 거래량 증감. */
export const getMarketInsights = ({ category, grade }: MarketQuery): Promise<MarketInsights> =>
  apiRequest<MarketInsights>(`/market/insights${toQuery({ category, grade })}`);

/** MARKET-03 30일 일별 평균 체결가·거래량. */
export const getMarketChart = ({ category, grade }: MarketQuery): Promise<MarketChart> =>
  apiRequest<MarketChart>(`/market/chart${toQuery({ category, grade })}`);

/** MARKET-04 전일 대비 상승 Top N. */
export const getMarketTopGainers = ({ category, grade }: MarketQuery, limit: number): Promise<readonly MarketTopGainer[]> =>
  apiRequest<{ items: readonly MarketTopGainer[] }>(`/market/top-gainers${toQuery({ category, grade, limit })}`).then(
    (data) => data.items,
  );

/** MARKET-05 품목별 시세 목록. */
export const getMarketPrices = (
  { category, grade }: MarketQuery,
  options: { readonly q: string; readonly sort: MarketPriceSort; readonly page: number; readonly size: number },
): Promise<MarketPricePage> =>
  apiRequest<MarketPricePage>(`/market/prices${toQuery({ category, grade, ...options })}`);

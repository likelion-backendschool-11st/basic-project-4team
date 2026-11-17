import { useEffect, useState } from 'react';
import { getMarketChart, getMarketFilters, getMarketInsights, getMarketTopGainers } from '../../api/market';
import type { MarketChart, MarketFilters, MarketInsights, MarketTopGainer } from '../../api/types';
import { ALL_GRADES, topGainersSection } from '../../data/market';

export type MarketStatus = 'loading' | 'ready' | 'error';

interface Overview {
  readonly insights: MarketInsights;
  readonly chart: MarketChart;
  readonly topGainers: readonly MarketTopGainer[];
}

/**
 * 시세 대시보드 상단 — 카테고리 탭·등급 필터(MARKET-01)와 선택에 따른 인사이트·차트·상승 Top(MARKET-02~04).
 * 카테고리를 바꾸면 등급은 "전체"로 돌아간다.
 */
export const useMarketDashboard = () => {
  const [category, setCategory] = useState('');
  const [grade, setGrade] = useState(ALL_GRADES);
  const [filters, setFilters] = useState<MarketFilters | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [status, setStatus] = useState<MarketStatus>('loading');

  // 필터 메타 — 처음엔 서버가 고른 기본 카테고리, 이후엔 선택한 카테고리.
  useEffect(() => {
    let cancelled = false;
    getMarketFilters(category || undefined)
      .then((data) => {
        if (cancelled) return;
        setFilters(data);
        if (!data.category) setStatus('ready');
        else if (!category) setCategory(data.category.code);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!category) return undefined;
    let cancelled = false;
    setStatus('loading');
    const query = { category, grade };
    Promise.all([getMarketInsights(query), getMarketChart(query), getMarketTopGainers(query, topGainersSection.limit)])
      .then(([insights, chart, topGainers]) => {
        if (cancelled) return;
        setOverview({ insights, chart, topGainers });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category, grade]);

  return {
    category,
    grade,
    filters,
    overview,
    status,
    selectCategory: (code: string) => {
      setCategory(code);
      setGrade(ALL_GRADES);
    },
    selectGrade: setGrade,
  };
};

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { conditionOptions, gradeOptions, tradeOptions, type PricePreset } from '../../data/search';
import {
  SEARCH_URL_KEYS,
  formatWon,
  parseFilterState,
  parseWon,
  presetIdFor,
  writeFilterState,
  type PriceRange,
  type UrlFilterState,
} from './searchUrlState';

export type { PriceRange } from './searchUrlState';

const toggleIn = (list: readonly string[], id: string): readonly string[] =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

const ALLOWED = {
  grades: gradeOptions.map((o) => o.id),
  conditions: conditionOptions.map((o) => o.id),
  trades: tradeOptions.map((o) => o.id),
};

const FILTER_KEYS = [
  SEARCH_URL_KEYS.category,
  SEARCH_URL_KEYS.grades,
  SEARCH_URL_KEYS.minPrice,
  SEARCH_URL_KEYS.maxPrice,
  SEARCH_URL_KEYS.excludeSold,
  SEARCH_URL_KEYS.conditions,
  SEARCH_URL_KEYS.trades,
];

/**
 * 필터 패널 상태 (카테고리·등급·가격·옵션).
 * 적용된 필터는 URL 쿼리가 기준이다 (#27) — 새로고침·뒤로가기 후에도 유지되고,
 * 헤더 카테고리 메뉴(/search?category=코드)로 들어오면 그 카테고리로 시작한다.
 * 가격 입력칸은 "적용"을 누르기 전까지 화면에만 둔다.
 */
export const useSearchFilters = () => {
  const [params, setParams] = useSearchParams();
  const state = parseFilterState(params, ALLOWED);

  /** 필터를 바꾸면 URL에 쓰고 1페이지로 돌아간다 (기록은 남기지 않음 — 뒤로가기는 이전 화면으로). */
  const update = useCallback(
    (patch: Partial<UrlFilterState>) => {
      setParams(
        (prev) => {
          const next = writeFilterState(prev, { ...parseFilterState(prev, ALLOWED), ...patch });
          next.delete(SEARCH_URL_KEYS.page);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const [priceMin, setPriceMinRaw] = useState<string>(formatWon(state.appliedRange.min));
  const [priceMax, setPriceMaxRaw] = useState<string>(formatWon(state.appliedRange.max));
  // 적용된 가격이 바뀌면(프리셋·초기화·뒤로가기) 입력칸도 맞춘다.
  useEffect(() => {
    setPriceMinRaw(formatWon(state.appliedRange.min));
    setPriceMaxRaw(formatWon(state.appliedRange.max));
  }, [state.appliedRange.min, state.appliedRange.max]);

  const setPriceMin = useCallback((value: string) => setPriceMinRaw(formatWon(parseWon(value))), []);
  const setPriceMax = useCallback((value: string) => setPriceMaxRaw(formatWon(parseWon(value))), []);

  const applyPrice = useCallback(() => {
    update({ appliedRange: { min: parseWon(priceMin), max: parseWon(priceMax) } });
  }, [priceMin, priceMax, update]);

  const applyPreset = useCallback(
    (preset: PricePreset) => update({ appliedRange: { min: preset.min, max: preset.max } }),
    [update],
  );

  const reset = useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        [...FILTER_KEYS, SEARCH_URL_KEYS.page].forEach((key) => next.delete(key));
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  const appliedRange: PriceRange = state.appliedRange;

  return {
    categoryId: state.categoryId,
    selectCategory: (id: string) => update({ categoryId: id }),
    grades: state.grades,
    toggleGrade: (id: string) => update({ grades: toggleIn(state.grades, id) }),
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    applyPrice,
    appliedRange,
    activePresetId: presetIdFor(appliedRange),
    applyPreset,
    excludeSold: state.excludeSold,
    toggleExcludeSold: () => update({ excludeSold: !state.excludeSold }),
    conditions: state.conditions,
    toggleCondition: (id: string) => update({ conditions: toggleIn(state.conditions, id) }),
    trades: state.trades,
    toggleTrade: (id: string) => update({ trades: toggleIn(state.trades, id) }),
    reset,
  };
};

export type SearchFiltersState = ReturnType<typeof useSearchFilters>;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  conditionOptions,
  gradeOptions,
  pricePresets,
  SEARCH_PARAM,
  sizeOptions,
  sortOptions,
  tradeOptions,
  type PricePreset,
  type SortKey,
} from '../../data/search';

export interface PriceRange {
  readonly min: number | null;
  readonly max: number | null;
}

const parseWon = (value: string | null): number | null => {
  const digits = (value ?? '').replace(/[^0-9]/g, '');
  return digits.length > 0 ? Number(digits) : null;
};

const formatWon = (value: number | null): string => (value === null ? '' : value.toLocaleString('ko-KR'));

const toggleIn = (list: readonly string[], id: string): readonly string[] =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

/** 쉼표 목록 → 허용된 id만 (주소를 손으로 고쳐도 잘못된 값은 무시). */
const readList = (value: string | null, allowed: readonly { readonly id: string }[]): readonly string[] => {
  const ids = new Set((value ?? '').split(','));
  return allowed.filter((option) => ids.has(option.id)).map((option) => option.id);
};

const isSortKey = (value: string | null): value is SortKey => sortOptions.some((option) => option.key === value);

type ParamValue = string | number | readonly string[] | null | undefined;

/**
 * 검색 화면(P-009)의 모든 조건 — 검색어·카테고리·등급·가격·옵션·정렬·페이지.
 * 상태는 주소(/search?...)에만 두고 여기서 읽고 쓴다. 가격 입력칸만 "적용" 전까지 화면 안에 둔다.
 */
export const useSearchFilters = () => {
  const [params, setParams] = useSearchParams();

  const q = params.get(SEARCH_PARAM.q)?.trim() ?? '';
  const categoryCode = params.get(SEARCH_PARAM.category) ?? '';
  const gradesParam = params.get(SEARCH_PARAM.grades);
  const sizesParam = params.get(SEARCH_PARAM.sizes);
  const statesParam = params.get(SEARCH_PARAM.states);
  const tradesParam = params.get(SEARCH_PARAM.trades);
  const grades = useMemo(() => readList(gradesParam, gradeOptions), [gradesParam]);
  const sizes = useMemo(() => readList(sizesParam, sizeOptions), [sizesParam]);
  const conditions = useMemo(() => readList(statesParam, conditionOptions), [statesParam]);
  const trades = useMemo(() => readList(tradesParam, tradeOptions), [tradesParam]);
  const minPrice = parseWon(params.get(SEARCH_PARAM.minPrice));
  const maxPrice = parseWon(params.get(SEARCH_PARAM.maxPrice));
  const appliedRange = useMemo<PriceRange>(() => ({ min: minPrice, max: maxPrice }), [minPrice, maxPrice]);
  const excludeSold = params.get(SEARCH_PARAM.includeSold) !== '1';
  const sortParam = params.get(SEARCH_PARAM.sort);
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'latest';
  const pageParam = Number(params.get(SEARCH_PARAM.page));
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  /**
   * 주소의 일부만 바꾼다. 조건이 바뀌면 1페이지로 돌아간다(page 키를 직접 넘길 때만 유지).
   * 페이지 이동은 뒤로가기로 돌아올 수 있게 기록을 남기고, 필터 변경은 기록을 덮어쓴다.
   */
  const update = useCallback(
    (patch: Readonly<Partial<Record<keyof typeof SEARCH_PARAM, ParamValue>>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!('page' in patch)) next.delete(SEARCH_PARAM.page);
          Object.entries(patch).forEach(([key, value]) => {
            const name = SEARCH_PARAM[key as keyof typeof SEARCH_PARAM];
            const text = Array.isArray(value)
              ? value.join(',')
              : value === null || value === undefined
                ? ''
                : String(value);
            if (text === '') next.delete(name);
            else next.set(name, text);
          });
          return next;
        },
        { replace: !('page' in patch) },
      );
    },
    [setParams],
  );

  // 가격 입력칸: 적용 전까지는 화면에만 둔다. 주소의 가격이 바뀌면(초기화·프리셋·뒤로가기) 맞춘다.
  const [priceMin, setPriceMinRaw] = useState(formatWon(minPrice));
  const [priceMax, setPriceMaxRaw] = useState(formatWon(maxPrice));
  const [priceError, setPriceError] = useState(false);
  useEffect(() => {
    setPriceMinRaw(formatWon(minPrice));
    setPriceMaxRaw(formatWon(maxPrice));
    setPriceError(false);
  }, [minPrice, maxPrice]);

  const setPriceMin = useCallback((value: string) => {
    setPriceMinRaw(formatWon(parseWon(value)));
    setPriceError(false);
  }, []);

  const setPriceMax = useCallback((value: string) => {
    setPriceMaxRaw(formatWon(parseWon(value)));
    setPriceError(false);
  }, []);

  /** REQ-LIST-005: 최소 > 최대면 적용하지 않고 안내한다. */
  const applyPrice = useCallback(() => {
    const min = parseWon(priceMin);
    const max = parseWon(priceMax);
    if (min !== null && max !== null && min > max) {
      setPriceError(true);
      return;
    }
    update({ minPrice: min, maxPrice: max });
  }, [priceMax, priceMin, update]);

  const applyPreset = useCallback(
    (preset: PricePreset) => update({ minPrice: preset.min, maxPrice: preset.max }),
    [update],
  );

  return {
    q,
    categoryCode,
    /** 다른 대분류로 옮기면 그 대분류에 없는 등급 조건은 빼야 하므로 함께 넘길 수 있다. */
    /** 카테고리를 바꾼다. 새 카테고리에 맞지 않는 등급·사이즈 조건은 함께 지운다. */
    selectCategory: (code: string, options?: { readonly clearGrades?: boolean; readonly clearSizes?: boolean }) =>
      update({
        category: code,
        ...(options?.clearGrades ? { grades: null } : {}),
        ...(options?.clearSizes ? { sizes: null } : {}),
      }),
    grades,
    toggleGrade: (id: string) => update({ grades: toggleIn(grades, id) }),
    sizes,
    toggleSize: (id: string) => update({ sizes: toggleIn(sizes, id) }),
    priceMin,
    priceMax,
    priceError,
    setPriceMin,
    setPriceMax,
    applyPrice,
    appliedRange,
    activePresetId: pricePresets.find((p) => p.min === minPrice && p.max === maxPrice)?.id ?? null,
    applyPreset,
    excludeSold,
    toggleExcludeSold: () => update({ includeSold: excludeSold ? '1' : null }),
    conditions,
    toggleCondition: (id: string) => update({ states: toggleIn(conditions, id) }),
    trades,
    toggleTrade: (id: string) => update({ trades: toggleIn(trades, id) }),
    sortKey,
    setSortKey: (key: SortKey) => update({ sort: key === 'latest' ? null : key }),
    page,
    setPage: (next: number) => update({ page: next > 1 ? next : null }),
    /** 검색어는 남기고 나머지 조건을 모두 지운다. */
    reset: () => setParams(q ? { [SEARCH_PARAM.q]: q } : {}, { replace: true }),
  };
};

export type SearchFiltersState = ReturnType<typeof useSearchFilters>;

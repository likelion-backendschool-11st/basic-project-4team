import { categoryOptions, initialFilterState, pricePresets, sortOptions, type SortKey } from '../../data/search';

/**
 * P-009 검색 조건 ↔ URL 쿼리 (#27).
 * 정렬·페이지·필터를 URL에 남겨 새로고침·뒤로가기(상세 → 목록) 후에도 같은 화면을 보여준다.
 * 기본값과 같은 조건은 URL에 쓰지 않는다 (`/search?q=리자몽` 처럼 짧게 유지).
 */
export const SEARCH_URL_KEYS = {
  sort: 'sort',
  page: 'page',
  category: 'category',
  grades: 'grades',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  excludeSold: 'excludeSold',
  conditions: 'conditions',
  trades: 'trades',
} as const;

/** 카테고리 "전체"는 코드가 없어서 URL에서는 이 값으로 표시한다. */
const ALL_CATEGORY = 'all';

export interface PriceRange {
  readonly min: number | null;
  readonly max: number | null;
}

export interface UrlFilterState {
  readonly categoryId: string;
  readonly grades: readonly string[];
  readonly appliedRange: PriceRange;
  readonly excludeSold: boolean;
  readonly conditions: readonly string[];
  readonly trades: readonly string[];
}

export const parseWon = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length > 0 ? Number(digits) : null;
};

export const formatWon = (value: number | null): string => (value === null ? '' : value.toLocaleString('ko-KR'));

export const defaultRange: PriceRange = {
  min: parseWon(initialFilterState.priceMin),
  max: parseWon(initialFilterState.priceMax),
};

const sameList = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((v) => b.includes(v));

/** 쉼표 목록. 키가 없으면 기본값, 빈 문자열이면 빈 목록. 모르는 값은 버린다. */
const readList = (params: URLSearchParams, key: string, allowed: readonly string[], fallback: readonly string[]) => {
  const raw = params.get(key);
  if (raw === null) return fallback;
  return raw.split(',').filter((v) => allowed.includes(v));
};

/** 가격. 키가 없으면 기본값, 빈 문자열이면 제한 없음(null). */
const readPrice = (params: URLSearchParams, key: string, fallback: number | null): number | null => {
  const raw = params.get(key);
  return raw === null ? fallback : parseWon(raw);
};

const readCategoryId = (params: URLSearchParams): string => {
  const raw = params.get(SEARCH_URL_KEYS.category);
  if (raw === ALL_CATEGORY) return ALL_CATEGORY;
  return (raw && categoryOptions.find((c) => c.code === raw)?.id) || initialFilterState.categoryId;
};

export const parseFilterState = (
  params: URLSearchParams,
  allowed: { readonly grades: readonly string[]; readonly conditions: readonly string[]; readonly trades: readonly string[] },
): UrlFilterState => ({
  categoryId: readCategoryId(params),
  grades: readList(params, SEARCH_URL_KEYS.grades, allowed.grades, initialFilterState.grades),
  appliedRange: {
    min: readPrice(params, SEARCH_URL_KEYS.minPrice, defaultRange.min),
    max: readPrice(params, SEARCH_URL_KEYS.maxPrice, defaultRange.max),
  },
  excludeSold: params.get(SEARCH_URL_KEYS.excludeSold) !== 'false',
  conditions: readList(params, SEARCH_URL_KEYS.conditions, allowed.conditions, initialFilterState.conditions),
  trades: readList(params, SEARCH_URL_KEYS.trades, allowed.trades, initialFilterState.trades),
});

/** 필터 상태를 URL 쿼리에 쓴다. q·sort 등 다른 키는 그대로 두고, 기본값이면 키를 지운다. */
export const writeFilterState = (params: URLSearchParams, state: UrlFilterState): URLSearchParams => {
  const next = new URLSearchParams(params);
  const put = (key: string, value: string | null) => (value === null ? next.delete(key) : next.set(key, value));

  const category =
    state.categoryId === initialFilterState.categoryId
      ? null
      : (categoryOptions.find((c) => c.id === state.categoryId)?.code ?? ALL_CATEGORY);
  put(SEARCH_URL_KEYS.category, category);
  put(SEARCH_URL_KEYS.grades, sameList(state.grades, initialFilterState.grades) ? null : state.grades.join(','));
  put(SEARCH_URL_KEYS.minPrice, state.appliedRange.min === defaultRange.min ? null : String(state.appliedRange.min ?? ''));
  put(SEARCH_URL_KEYS.maxPrice, state.appliedRange.max === defaultRange.max ? null : String(state.appliedRange.max ?? ''));
  put(SEARCH_URL_KEYS.excludeSold, state.excludeSold === initialFilterState.excludeSold ? null : String(state.excludeSold));
  put(
    SEARCH_URL_KEYS.conditions,
    sameList(state.conditions, initialFilterState.conditions) ? null : state.conditions.join(','),
  );
  put(SEARCH_URL_KEYS.trades, sameList(state.trades, initialFilterState.trades) ? null : state.trades.join(','));
  return next;
};

/** 가격 범위가 프리셋과 같으면 그 프리셋 id (새로고침 후에도 프리셋 버튼을 강조). */
export const presetIdFor = (range: PriceRange): string | null =>
  pricePresets.find((p) => p.min === range.min && p.max === range.max)?.id ?? null;

export const parseSort = (params: URLSearchParams): SortKey => {
  const raw = params.get(SEARCH_URL_KEYS.sort);
  return sortOptions.find((o) => o.key === raw)?.key ?? 'latest';
};

/** 1 이상 정수가 아니면 1페이지. */
export const parsePage = (params: URLSearchParams): number => {
  const raw = params.get(SEARCH_URL_KEYS.page);
  return raw !== null && /^[1-9]\d*$/.test(raw) ? Number(raw) : 1;
};

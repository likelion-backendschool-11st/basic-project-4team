import { useCallback, useState } from 'react';
import { initialFilterState, type PricePreset } from '../../data/search';

export interface PriceRange {
  readonly min: number | null;
  readonly max: number | null;
}

const parseWon = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length > 0 ? Number(digits) : null;
};

const formatWon = (value: number | null): string => (value === null ? '' : value.toLocaleString('ko-KR'));

const toggleIn = (list: readonly string[], id: string): readonly string[] =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

const initialRange: PriceRange = {
  min: parseWon(initialFilterState.priceMin),
  max: parseWon(initialFilterState.priceMax),
};

/** All state of the structural filter panel (category, grade, price, options). */
export const useSearchFilters = () => {
  const [categoryId, setCategoryId] = useState<string>(initialFilterState.categoryId);
  const [grades, setGrades] = useState<readonly string[]>(initialFilterState.grades);
  const [priceMin, setPriceMinRaw] = useState<string>(initialFilterState.priceMin);
  const [priceMax, setPriceMaxRaw] = useState<string>(initialFilterState.priceMax);
  const [appliedRange, setAppliedRange] = useState<PriceRange>(initialRange);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [excludeSold, setExcludeSold] = useState<boolean>(initialFilterState.excludeSold);
  const [conditions, setConditions] = useState<readonly string[]>(initialFilterState.conditions);
  const [trades, setTrades] = useState<readonly string[]>(initialFilterState.trades);

  const setPriceMin = useCallback((value: string) => {
    setPriceMinRaw(formatWon(parseWon(value)));
    setActivePresetId(null);
  }, []);

  const setPriceMax = useCallback((value: string) => {
    setPriceMaxRaw(formatWon(parseWon(value)));
    setActivePresetId(null);
  }, []);

  const applyPrice = useCallback(() => {
    setAppliedRange({ min: parseWon(priceMin), max: parseWon(priceMax) });
  }, [priceMin, priceMax]);

  const applyPreset = useCallback((preset: PricePreset) => {
    setPriceMinRaw(formatWon(preset.min));
    setPriceMaxRaw(formatWon(preset.max));
    setAppliedRange({ min: preset.min, max: preset.max });
    setActivePresetId(preset.id);
  }, []);

  const reset = useCallback(() => {
    setCategoryId(initialFilterState.categoryId);
    setGrades(initialFilterState.grades);
    setPriceMinRaw(initialFilterState.priceMin);
    setPriceMaxRaw(initialFilterState.priceMax);
    setAppliedRange(initialRange);
    setActivePresetId(null);
    setExcludeSold(initialFilterState.excludeSold);
    setConditions(initialFilterState.conditions);
    setTrades(initialFilterState.trades);
  }, []);

  return {
    categoryId,
    selectCategory: setCategoryId,
    grades,
    toggleGrade: (id: string) => setGrades((prev) => toggleIn(prev, id)),
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    applyPrice,
    appliedRange,
    activePresetId,
    applyPreset,
    excludeSold,
    toggleExcludeSold: () => setExcludeSold((prev) => !prev),
    conditions,
    toggleCondition: (id: string) => setConditions((prev) => toggleIn(prev, id)),
    trades,
    toggleTrade: (id: string) => setTrades((prev) => toggleIn(prev, id)),
    reset,
  };
};

export type SearchFiltersState = ReturnType<typeof useSearchFilters>;

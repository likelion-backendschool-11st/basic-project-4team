import { useMemo } from 'react';
import { mainCategoryOptions, subCategoryOptions, type SelectOption } from '../../data/listingForm';

export interface CategorySelection {
  readonly mainOptions: readonly SelectOption[];
  readonly subOptions: readonly SelectOption[];
  readonly mainLabel: string;
  readonly subLabel: string;
}

/** Resolves option lists and display labels for the selected main/sub category. */
export const useCategorySelection = (main: string, sub: string): CategorySelection =>
  useMemo(() => {
    const subOptions = subCategoryOptions[main] ?? [];
    const mainOpt = mainCategoryOptions.find((o) => o.value === main);
    const subOpt = subOptions.find((o) => o.value === sub);
    return {
      mainOptions: mainCategoryOptions,
      subOptions,
      mainLabel: mainOpt?.label ?? '',
      subLabel: subOpt?.shortLabel ?? subOpt?.label ?? '',
    };
  }, [main, sub]);

/** First sub-category value for a main category (used when main changes). */
export const firstSubCategory = (main: string): string => subCategoryOptions[main]?.[0]?.value ?? '';

import { useCallback, useEffect } from 'react';
import type { ItemSummary } from '../../api/types';
import type { SelectOption } from '../../data/listingForm';
import { useCatalogSearch, type CatalogSearchApi } from './useCatalogSearch';
import { useCategoryTree, type LoadStatus } from './useCategoryTree';
import type { ListingFormApi } from './useListingForm';

export interface CatalogMappingApi {
  readonly categoryStatus: LoadStatus;
  readonly mainOptions: readonly SelectOption[];
  readonly subOptions: readonly SelectOption[];
  readonly onMainChange: (main: string) => void;
  readonly onSubChange: (sub: string) => void;
  readonly catalog: Pick<CatalogSearchApi, 'status' | 'results' | 'totalCount'>;
  readonly onSearch: () => void;
  readonly onSelectItem: (item: ItemSummary) => void;
}

/**
 * 판매글 등록(P-014) 3·4단계 — DB 카테고리 선택 + 공식 품목 검색·선택을 폼 상태와 묶는다.
 * 카테고리를 불러오면 첫 대분류·소분류로 채우고, 검색은 선택한 대분류(하위 포함) 안에서 한다.
 */
export const useCatalogMapping = (form: ListingFormApi): CatalogMappingApi => {
  const tree = useCategoryTree();
  const search = useCatalogSearch();
  const { mainCategory, catalogQuery } = form.values;
  const { setCategory, selectCatalogItem } = form;

  useEffect(() => {
    if (tree.status !== 'ready' || mainCategory) return;
    const main = tree.mainOptions[0]?.value;
    if (main) setCategory(main, tree.subOptionsOf(main)[0]?.value ?? '');
  }, [tree, mainCategory, setCategory]);

  const onMainChange = useCallback(
    (main: string) => {
      setCategory(main, tree.subOptionsOf(main)[0]?.value ?? '');
      search.reset();
    },
    [tree, setCategory, search],
  );

  const onSubChange = useCallback((sub: string) => setCategory(mainCategory, sub), [mainCategory, setCategory]);

  const onSearch = useCallback(() => search.search(catalogQuery, mainCategory), [search, catalogQuery, mainCategory]);

  const onSelectItem = useCallback(
    (item: ItemSummary) => selectCatalogItem(item, tree.parentOf(item.category.code) ?? mainCategory),
    [selectCatalogItem, tree, mainCategory],
  );

  return {
    categoryStatus: tree.status,
    mainOptions: tree.mainOptions,
    subOptions: tree.subOptionsOf(mainCategory),
    onMainChange,
    onSubChange,
    catalog: { status: search.status, results: search.results, totalCount: search.totalCount },
    onSearch,
    onSelectItem,
  };
};

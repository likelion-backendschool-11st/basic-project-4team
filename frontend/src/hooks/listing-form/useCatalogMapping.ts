import { useCallback, useEffect } from 'react';
import type { ItemSummary } from '../../api/types';
import type { SelectOption } from '../../data/listingForm';
import { useCatalogSearch, type CatalogSearchApi } from './useCatalogSearch';
import { useCategoryTree, type CategoryTreeApi, type LoadStatus } from './useCategoryTree';
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
  /** 품목 등록 요청 팝업이 카테고리 선택지·id를 쓰도록 같은 트리를 넘긴다. */
  readonly categoryTree: CategoryTreeApi;
  /** 이미 있는 품목으로 돌려보낼 때 — 카테고리를 맞추고 그 이름으로 소분류 안에서 다시 검색한다. */
  readonly searchExisting: (name: string, main: string, sub: string) => void;
}

/**
 * 판매글 등록(P-014) 3·4단계 — DB 카테고리 선택 + 공식 품목 검색·선택을 폼 상태와 묶는다.
 * 카테고리를 불러오면 첫 대분류·소분류로 채우고, 검색은 선택한 대분류(하위 포함) 안에서 한다.
 */
export const useCatalogMapping = (form: ListingFormApi): CatalogMappingApi => {
  const tree = useCategoryTree();
  const search = useCatalogSearch();
  const { mainCategory, catalogQuery } = form.values;
  const { setCategory, selectCatalogItem, setField } = form;

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

  const searchExisting = useCallback(
    (name: string, main: string, sub: string) => {
      setCategory(main, sub);
      setField('catalogQuery', name);
      search.search(name, sub || main);
    },
    [setCategory, setField, search],
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
    categoryTree: tree,
    searchExisting,
  };
};

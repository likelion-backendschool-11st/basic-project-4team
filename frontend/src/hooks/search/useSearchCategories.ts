import { useMemo } from 'react';
import type { CategoryNode } from '../../api/types';
import {
  CARD_CATEGORY_CODE,
  SNEAKER_CATEGORY_CODE,
  categoryFilterCopy,
  searchHeaderData,
  type Breadcrumb,
  type CategoryOption,
} from '../../data/search';
import { categoryMenuCopy } from '../../data/layout';
import { useCategoryTree } from '../layout/useCategoryTree';

const ALL_ID = 'all';

/** DB 카테고리 트리 → 필터 칩 (전체 | 대분류 전체, 소분류… | …). id는 카테고리 code. */
const toOptions = (tree: readonly CategoryNode[]): readonly CategoryOption[] => [
  { id: ALL_ID, label: categoryFilterCopy.all },
  ...tree.flatMap((top) => [
    {
      id: top.code,
      code: top.code,
      label: `${top.name}${categoryFilterCopy.topSuffix}`,
      dividerBefore: true,
    },
    ...top.children.map((child) => ({
      id: child.code,
      code: child.code,
      label: child.name,
    })),
  ]),
];

/**
 * 검색 화면의 카테고리: 칩 목록, 고른 카테고리의 이름·경로(breadcrumb), 등급 필터를 쓸 수 있는지.
 * 헤더 카테고리 메뉴와 같은 트리(캐시)를 쓴다.
 */
export const useSearchCategories = (selectedCode: string) => {
  const tree = useCategoryTree();
  const categories = tree.status === 'success' ? tree.categories : null;

  return useMemo(() => {
    const options = categories ? toOptions(categories) : [{ id: ALL_ID, label: categoryFilterCopy.all }];
    const top = categories?.find(
      (node) => node.code === selectedCode || node.children.some((child) => child.code === selectedCode),
    );
    const child = top?.children.find((c) => c.code === selectedCode);
    const breadcrumbs: readonly Breadcrumb[] = [
      searchHeaderData.home,
      ...(top
        ? [
            {
              label: top.name,
              to: child ? categoryMenuCopy.searchTo(top.code) : undefined,
            },
          ]
        : []),
      ...(child ? [{ label: child.name }] : []),
      ...(top ? [] : [{ label: searchHeaderData.allTitle }]),
    ];
    return {
      options,
      /** 칩에서 선택 표시할 id. 없는(모르는) code면 전체. */
      selectedId: top ? selectedCode : ALL_ID,
      selectedName: child?.name ?? top?.name ?? null,
      /** 주소의 카테고리 code가 DB 카테고리에 없음 (트리를 불러온 뒤에만 판단). 화면은 전체로 되돌린다. */
      unknownCode: categories !== null && selectedCode !== '' && !top,
      breadcrumbs,
      /** 등급(PSA·BGS·미개봉) 필터: 전체 또는 카드 카테고리일 때만 (REQ-LIST-003). */
      gradeEnabled: !selectedCode || !top || top.code === CARD_CATEGORY_CODE,
      /** 사이즈 필터: 운동화 카테고리일 때만 (REQ-LIST-004). */
      sizeEnabled: top?.code === SNEAKER_CATEGORY_CODE,
      /** 칩 id → 주소에 넣을 code ('전체'는 빈 값), 등급·사이즈 조건을 지워야 하는지. */
      toSelection: (id: string) => {
        const code = id === ALL_ID ? '' : id;
        const nextTop = categories?.find((n) => n.code === code || n.children.some((c) => c.code === code));
        return {
          code,
          clearGrades: Boolean(nextTop && nextTop.code !== CARD_CATEGORY_CODE),
          clearSizes: nextTop?.code !== SNEAKER_CATEGORY_CODE,
        };
      },
    };
  }, [categories, selectedCode]);
};

export type SearchCategories = ReturnType<typeof useSearchCategories>;

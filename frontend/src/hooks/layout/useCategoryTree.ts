import { useEffect, useState } from 'react';
import { getCategories } from '../../api/catalog';
import type { CategoryNode } from '../../api/types';

export type CategoryTreeState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'success'; readonly categories: readonly CategoryNode[] };

// 카테고리는 거의 바뀌지 않아 페이지를 옮겨도 다시 부르지 않는다 (ITEM-01 비고: 프론트 캐싱 권장).
let cache: Promise<readonly CategoryNode[]> | null = null;

const loadCategories = (): Promise<readonly CategoryNode[]> => {
  if (!cache) {
    cache = getCategories().catch((err: unknown) => {
      cache = null; // 실패하면 다음에 다시 시도한다.
      throw err;
    });
  }
  return cache;
};

/** 헤더 카테고리 메뉴용 트리. */
export const useCategoryTree = (): CategoryTreeState => {
  const [state, setState] = useState<CategoryTreeState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadCategories()
      .then((categories) => {
        if (!cancelled) setState({ status: 'success', categories });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};

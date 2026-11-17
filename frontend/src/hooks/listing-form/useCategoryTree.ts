import { useEffect, useMemo, useState } from 'react';
import { getCategories } from '../../api/catalog';
import type { CategoryNode } from '../../api/types';
import type { SelectOption } from '../../data/listingForm';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface CategoryTreeApi {
  readonly status: LoadStatus;
  readonly mainOptions: readonly SelectOption[];
  /** 대분류 code → 소분류 선택지. */
  readonly subOptionsOf: (main: string) => readonly SelectOption[];
  /** 소분류 code → 대분류 code. 모르면 null. */
  readonly parentOf: (sub: string) => string | null;
  /** 소분류 code → 카테고리 id (품목 등록 요청에 보냄). 모르면 null. */
  readonly subIdOf: (sub: string) => number | null;
}

const toOption = ({ code, name }: { readonly code: string; readonly name: string }): SelectOption => ({
  value: code,
  label: name,
});

/** DB 카테고리 트리(ITEM-01)를 한 번 불러와 등록 폼 선택지로 바꾼다. */
export const useCategoryTree = (): CategoryTreeApi => {
  const [tree, setTree] = useState<readonly CategoryNode[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((nodes) => {
        if (cancelled) return;
        setTree(nodes);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<CategoryTreeApi>(() => {
    const parentByChild = new Map<string, string>();
    const idByChild = new Map<string, number>();
    tree.forEach((node) =>
      node.children.forEach((child) => {
        parentByChild.set(child.code, node.code);
        idByChild.set(child.code, child.id);
      }),
    );
    return {
      status,
      mainOptions: tree.map(toOption),
      subOptionsOf: (main) => tree.find((node) => node.code === main)?.children.map(toOption) ?? [],
      parentOf: (sub) => parentByChild.get(sub) ?? null,
      subIdOf: (sub) => idByChild.get(sub) ?? null,
    };
  }, [tree, status]);
};

import { useCallback, useRef, useState } from 'react';
import { searchCatalogItems } from '../../api/catalog';
import type { ItemSummary } from '../../api/types';

export type CatalogSearchStatus = 'idle' | 'loading' | 'ready' | 'error';

/** 한 번에 보여줄 검색 결과 수. 더 많으면 검색어를 좁히도록 안내한다. */
export const CATALOG_SEARCH_SIZE = 10;

export interface CatalogSearchApi {
  readonly status: CatalogSearchStatus;
  readonly results: readonly ItemSummary[];
  readonly totalCount: number;
  /** 검색 실행. category는 대분류·소분류 code(하위 포함). */
  readonly search: (q: string, category: string) => void;
  readonly reset: () => void;
}

/** 공식 품목 DB 검색(ITEM-02). 마지막 요청의 결과만 반영한다. */
export const useCatalogSearch = (): CatalogSearchApi => {
  const [status, setStatus] = useState<CatalogSearchStatus>('idle');
  const [results, setResults] = useState<readonly ItemSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const requestSeq = useRef(0);

  const search = useCallback((q: string, category: string) => {
    requestSeq.current += 1;
    const seq = requestSeq.current;
    setStatus('loading');
    searchCatalogItems({ q: q.trim(), category: category || undefined, size: CATALOG_SEARCH_SIZE })
      .then((res) => {
        if (seq !== requestSeq.current) return;
        setResults(res.items);
        setTotalCount(res.totalCount);
        setStatus('ready');
      })
      .catch(() => {
        if (seq === requestSeq.current) setStatus('error');
      });
  }, []);

  const reset = useCallback(() => {
    requestSeq.current += 1;
    setStatus('idle');
    setResults([]);
    setTotalCount(0);
  }, []);

  return { status, results, totalCount, search, reset };
};

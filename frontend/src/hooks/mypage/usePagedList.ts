import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageQuery } from '../../api/mypage';
import type { PagedList } from '../../api/types';

export type PagedListStatus = 'loading' | 'ready' | 'error';

/** 현재 페이지 기준으로 가운데 정렬한 페이지 번호 창 (예: 3 4 [5] 6 7). */
const pageWindow = (page: number, totalPages: number, windowSize: number): readonly number[] => {
  const half = Math.floor(windowSize / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

interface UsePagedListOptions<T> {
  /** 페이지를 불러오는 함수. 필터가 바뀌면 새 함수를 넘긴다(useCallback). */
  readonly fetchPage: (query: PageQuery) => Promise<PagedList<T>>;
  /** 이 값이 바뀌면 1페이지로 돌아간다 (예: 상태 필터). */
  readonly resetKey?: string;
  readonly pageSize: number;
  readonly windowSize: number;
}

/** 서버 페이지네이션 목록: 불러오기, 페이지 이동, 다시 불러오기. */
export const usePagedList = <T>({ fetchPage, resetKey = '', pageSize, windowSize }: UsePagedListOptions<T>) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PagedList<T> | null>(null);
  const [status, setStatus] = useState<PagedListStatus>('loading');
  const [reloadToken, setReloadToken] = useState(0);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // 필터가 바뀌면 렌더 중에 1페이지로 되돌린다 — effect에서 바꾸면 이전 페이지로 한 번 더 요청하게 된다.
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchPage({ page, size: pageSize })
      .then((result) => {
        if (cancelled) return;
        // 마지막 페이지의 항목을 지워 빈 페이지가 되면 한 페이지 앞으로
        if (result.items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setData(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, page, pageSize, reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pages = useMemo(() => pageWindow(page, totalPages, windowSize), [page, totalPages, windowSize]);

  const goTo = useCallback((next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const items = data?.items ?? [];
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  const next = useCallback(() => goTo(page + 1), [goTo, page]);

  return {
    items,
    /** MyListShell에 그대로 넘기는 값. */
    shellProps: {
      status,
      totalCount,
      itemCount: items.length,
      page,
      pages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      onPage: goTo,
      onPrev: prev,
      onNext: next,
      onRetry: reload,
    },
    totalCount,
    status,
    page,
    pages,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goTo,
    prev,
    next,
    reload,
  };
};

export type PagedListState<T> = ReturnType<typeof usePagedList<T>>;

export default usePagedList;

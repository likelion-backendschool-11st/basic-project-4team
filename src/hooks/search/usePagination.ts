import { useCallback, useMemo, useState } from 'react';

export interface PaginationOptions {
  readonly totalItems: number;
  readonly pageSize: number;
  readonly windowSize: number;
}

/** Page state plus a sliding window of visible page numbers. */
export const usePagination = ({ totalItems, pageSize, windowSize }: PaginationOptions) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [page, setPageState] = useState(1);

  const setPage = useCallback(
    (next: number) => setPageState(Math.min(totalPages, Math.max(1, next))),
    [totalPages],
  );

  const pages = useMemo(() => {
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, Math.min(page - half, totalPages - windowSize + 1));
    const end = Math.min(totalPages, start + windowSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages, windowSize]);

  return {
    page,
    pages,
    totalPages,
    setPage,
    prev: () => setPage(page - 1),
    next: () => setPage(page + 1),
    hasPrev: page > 1,
    hasNext: page < totalPages,
    rangeStart: (page - 1) * pageSize + 1,
    rangeEnd: Math.min(totalItems, page * pageSize),
  };
};

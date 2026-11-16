import { useMemo } from 'react';

export interface PaginationOptions {
  readonly totalItems: number;
  readonly pageSize: number;
  readonly windowSize: number;
  /** 현재 페이지 (주소 ?page= 등 바깥에서 관리). */
  readonly page: number;
  readonly onPageChange: (page: number) => void;
}

/** 페이지 번호 창(windowSize개)과 이전·다음 상태. 페이지 값은 바깥에서 받는다. */
export const usePagination = ({ totalItems, pageSize, windowSize, page, onPageChange }: PaginationOptions) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pages = useMemo(() => {
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, Math.min(page - half, totalPages - windowSize + 1));
    const end = Math.min(totalPages, start + windowSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages, windowSize]);

  const setPage = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped !== page) onPageChange(clamped);
  };

  return {
    page,
    pages,
    totalPages,
    setPage,
    prev: () => setPage(page - 1),
    next: () => setPage(page + 1),
    hasPrev: page > 1,
    hasNext: page < totalPages,
    rangeStart: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    rangeEnd: Math.min(totalItems, page * pageSize),
  };
};

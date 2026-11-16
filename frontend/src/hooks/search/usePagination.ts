import { useMemo } from 'react';

export interface PaginationOptions {
  readonly totalItems: number;
  readonly pageSize: number;
  /** 한 번에 보여줄 페이지 번호 수 (REQ-LIST-011: 5). */
  readonly blockSize: number;
  /** 현재 페이지 (주소 ?page= 등 바깥에서 관리). */
  readonly page: number;
  readonly onPageChange: (page: number) => void;
}

/**
 * 페이지 번호를 blockSize 단위 묶음으로 보여준다 (REQ-LIST-011, #27).
 * 1~5페이지 → "다음"을 누르면 6페이지(6~10 묶음)로, "이전"을 누르면 앞 묶음의 마지막 페이지로 이동한다.
 * 페이지 값은 바깥에서 받는다.
 */
export const usePagination = ({ totalItems, pageSize, blockSize, page: rawPage, onPageChange }: PaginationOptions) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // 주소의 page가 마지막 페이지를 넘어도 번호 표시는 마지막 페이지 기준으로 한다 (보정 요청은 useListingSearch).
  const page = Math.min(Math.max(1, rawPage), totalPages);

  const blockStart = Math.floor((page - 1) / blockSize) * blockSize + 1;
  const blockEnd = Math.min(totalPages, blockStart + blockSize - 1);

  const pages = useMemo(
    () => Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i),
    [blockStart, blockEnd],
  );

  const setPage = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped !== page) onPageChange(clamped);
  };

  return {
    page,
    pages,
    totalPages,
    setPage,
    /** 앞 묶음의 마지막 페이지로. */
    prev: () => setPage(blockStart - 1),
    /** 다음 묶음의 첫 페이지로. */
    next: () => setPage(blockEnd + 1),
    hasPrev: blockStart > 1,
    hasNext: blockEnd < totalPages,
    rangeStart: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    rangeEnd: Math.min(totalItems, page * pageSize),
  };
};

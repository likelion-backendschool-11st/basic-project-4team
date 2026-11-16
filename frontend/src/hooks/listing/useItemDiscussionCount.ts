import { useEffect, useState } from 'react';
import { getPosts } from '../../api/community';

/**
 * 품목 토론방 글 수 — 토론글 목록 API의 totalCount (LISTING-02 비고: board API가 제공).
 * 불러오기 전이거나 실패하면 null → 숫자를 숨긴다.
 */
export const useItemDiscussionCount = (itemSlug: string): number | null => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCount(null);
    getPosts({ itemId: itemSlug, size: 1 })
      .then((result) => {
        if (!cancelled) setCount(result.totalCount);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [itemSlug]);

  return count;
};

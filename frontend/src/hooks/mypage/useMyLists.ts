import { useCallback, useState } from 'react';
import { getMyWishes, removeWish } from '../../api/layout';
import { getMyComments, getMyListings, getMyPosts, getMyPurchases } from '../../api/mypage';
import type { MyListingStatus } from '../../api/types';
import { myListCopy, myWishesCopy } from '../../data/mypage';
import { usePagedList } from './usePagedList';

const PAGING = { pageSize: myListCopy.pageSize, windowSize: myListCopy.windowSize };

/** 판매 내역 탭: 상태 필터 + 목록. */
export const useMySales = () => {
  const [status, setStatus] = useState<MyListingStatus | null>(null);
  const fetchPage = useCallback(
    (query: { page: number; size: number }) => getMyListings({ ...query, status: status ?? undefined }),
    [status],
  );
  const list = usePagedList({ fetchPage, resetKey: status ?? 'all', ...PAGING });
  return { status, setStatus, list };
};

/** 구매 내역 탭. */
export const useMyPurchases = () => usePagedList({ fetchPage: getMyPurchases, ...PAGING });

/** 내 토론글 탭. */
export const useMyPosts = () => usePagedList({ fetchPage: getMyPosts, ...PAGING });

/** 내 댓글 탭. */
export const useMyComments = () => usePagedList({ fetchPage: getMyComments, ...PAGING });

const fetchWishes = ({ page, size }: { page: number; size: number }) => getMyWishes(page, size);

/** 찜한 상품 탭: 목록 + 찜 해제. 해제하면 목록과 상단 숫자를 다시 불러온다. */
export const useMyWishes = (onChanged: () => void) => {
  const list = usePagedList({ fetchPage: fetchWishes, ...PAGING });
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { reload } = list;

  const remove = useCallback(
    async (listingId: number) => {
      setRemovingId(listingId);
      try {
        await removeWish(listingId);
        reload();
        onChanged();
      } catch {
        window.alert(myWishesCopy.removeError);
      } finally {
        setRemovingId(null);
      }
    },
    [onChanged, reload],
  );

  return { list, removingId, remove };
};

import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyWishes, removeWish, type MyWish } from '../../api/layout';
import { ROUTES, wishlistDrawerCopy as copy } from '../../data/layout';
import { useAuth } from '../auth/useAuth';

type LoadStatus = 'idle' | 'loading' | 'error' | 'success';

/**
 * 찜한 상품 사이드바 (REQ-HEADER-010).
 * 헤더 숫자는 로그인 시·페이지 이동 시 totalCount로 맞추고, 사이드바를 열 때 목록을 새로 불러온다.
 * 비로그인이면 로그인 화면으로 보낸다.
 */
export const useWishlistDrawer = () => {
  const { status: authStatus } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedIn = authStatus === 'authenticated';

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [items, setItems] = useState<readonly MyWish[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [removing, setRemoving] = useState<ReadonlySet<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // 헤더 숫자: 다른 화면에서 찜을 바꿨을 수 있어 페이지를 옮길 때마다 다시 센다.
  useEffect(() => {
    if (!loggedIn) {
      setTotalCount(null);
      return undefined;
    }
    let cancelled = false;
    getMyWishes(1, 1)
      .then((res) => {
        if (!cancelled) setTotalCount(res.totalCount);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [loggedIn, pathname]);

  const load = useCallback(async (nextPage: number) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await getMyWishes(nextPage, copy.pageSize);
      setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
      setPage(nextPage);
      setTotalCount(res.totalCount);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, []);

  const openDrawer = useCallback(() => {
    if (!loggedIn) {
      navigate(ROUTES.login);
      return;
    }
    setOpen(true);
    void load(1);
  }, [loggedIn, navigate, load]);

  const close = useCallback(() => setOpen(false), []);

  // 다른 페이지로 이동하면 닫는다 (목록의 상품을 눌렀을 때 포함).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!loggedIn) setOpen(false);
  }, [loggedIn]);

  const remove = useCallback(async (listingId: number) => {
    setRemoving((prev) => new Set(prev).add(listingId));
    setError(null);
    try {
      await removeWish(listingId);
      setItems((prev) => prev.filter((item) => item.listingId !== listingId));
      setTotalCount((prev) => (prev === null ? prev : Math.max(prev - 1, 0)));
    } catch {
      setError(copy.removeError);
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  }, []);

  const hasMore = totalCount !== null && items.length < totalCount;
  const loadMore = useCallback(() => {
    if (status !== 'loading') void load(page + 1);
  }, [status, load, page]);
  const retry = useCallback(() => void load(1), [load]);

  return {
    open,
    openDrawer,
    close,
    status,
    items,
    totalCount,
    hasMore,
    loadMore,
    retry,
    remove,
    isRemoving: (id: number) => removing.has(id),
    error,
  };
};

export type WishlistDrawerState = ReturnType<typeof useWishlistDrawer>;

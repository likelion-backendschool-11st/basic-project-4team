import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../api/layout';
import { ROUTES, notificationCopy as copy } from '../../data/layout';
import { useAuth } from '../auth/useAuth';

type LoadStatus = 'idle' | 'loading' | 'error' | 'success';

/** 알림을 누르면 갈 곳: 댓글·답글은 토론방(품목 글) 또는 커뮤니티 피드, 가격 변동은 판매글 상세. */
export const notificationLink = (n: AppNotification): string => {
  if (n.type === 'price_change' && n.listing) return ROUTES.listingDetail(String(n.listing.id));
  if (n.post?.itemId) return ROUTES.itemDiscussion(n.post.itemId);
  return ROUTES.community;
};

/**
 * 헤더 알림 (REQ-HEADER-005).
 * 안 읽은 수는 로그인 시·페이지 이동 시·1분마다 확인하고, 드롭다운을 열 때 목록을 불러온다.
 */
export const useNotifications = () => {
  const { status: authStatus } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedIn = authStatus === 'authenticated';

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [items, setItems] = useState<readonly AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(() => {
    getUnreadNotificationCount()
      .then((res) => setUnreadCount(res.unreadCount))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      setUnreadCount(0);
      setItems([]);
      setOpen(false);
      return undefined;
    }
    refreshCount();
    const timer = window.setInterval(refreshCount, copy.pollMs);
    return () => window.clearInterval(timer);
  }, [loggedIn, pathname, refreshCount]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await getNotifications(copy.size);
      setItems(res.items);
      setUnreadCount(res.unreadCount);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, []);

  const toggle = useCallback(() => {
    if (!loggedIn) {
      navigate(ROUTES.login);
      return;
    }
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    void load();
  }, [loggedIn, open, navigate, load]);

  const close = useCallback(() => setOpen(false), []);

  /** 알림을 누르면 읽음 처리하고 해당 화면으로 이동한다. */
  const select = useCallback(
    (n: AppNotification) => {
      if (!n.isRead) {
        setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
        setUnreadCount((prev) => Math.max(prev - 1, 0));
        // 화면 이동 때 같이 도는 안 읽은 수 조회가 읽음 저장보다 먼저 끝나면 배지가 예전 숫자로 돌아간다.
        // 읽음 저장이 끝난 뒤(실패해도) 한 번 더 맞춘다.
        markNotificationRead(n.id).then(refreshCount, refreshCount);
      }
      setOpen(false);
      navigate(notificationLink(n));
    },
    [navigate, refreshCount],
  );

  const readAll = useCallback(async () => {
    const before = items;
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      setItems(before);
      refreshCount();
    }
  }, [items, refreshCount]);

  return { open, toggle, close, status, items, unreadCount, select, readAll, retry: load };
};

export type NotificationsState = ReturnType<typeof useNotifications>;

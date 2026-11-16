import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getChatUnreadCount, openChatRoom } from '../../api/chat';
import { ApiError } from '../../api/client';
import { startChatSocket, stopChatSocket, subscribeChat } from '../../api/chatSocket';
import type { ChatRoom } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';
import { useAuth } from '../auth/useAuth';
import type { ChatContextValue, ChatView, StartChatOutcome } from './chatContext';

const CLOSED: ChatView = { kind: 'closed' };

/**
 * ChatProvider의 상태 — 채팅 창 하나(목록·방)와 헤더 배지.
 * 로그인하면 WebSocket을 열고 안 읽은 수를 불러오며, 로그아웃하면 닫고 비운다.
 */
export const useChatCenter = (): ChatContextValue => {
  const { status } = useAuth();
  const loggedIn = status === 'authenticated';
  const { pathname } = useLocation();
  const [view, setView] = useState<ChatView>(CLOSED);
  const [unreadCount, setUnreadCount] = useState(0);
  // 판매글에서 연 채팅 창은 그 페이지에 머무는 동안 유지하고, 다른 페이지로 가면 닫는다.
  const openedAt = useRef(pathname);

  const refreshUnread = useCallback(() => {
    getChatUnreadCount()
      .then((res) => setUnreadCount(res.unreadCount))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      stopChatSocket();
      setUnreadCount(0);
      setView(CLOSED);
      return undefined;
    }
    const unsubscribe = subscribeChat((event) => {
      if (event.type === 'unread') setUnreadCount(event.unreadCount);
      // 다시 연결되면 끊긴 동안 바뀐 수를 맞춘다 (처음 연결 포함).
      if (event.type === 'connected') refreshUnread();
    });
    startChatSocket();
    return unsubscribe;
  }, [loggedIn, refreshUnread]);

  useEffect(() => {
    if (pathname !== openedAt.current) setView(CLOSED);
  }, [pathname]);

  const openList = useCallback(() => {
    openedAt.current = pathname;
    setView({ kind: 'list' });
  }, [pathname]);

  const openRoom = useCallback(
    (room: ChatRoom, fromList: boolean) => {
      openedAt.current = pathname;
      setView({ kind: 'room', roomId: room.id, initialRoom: room, fromList });
    },
    [pathname],
  );

  const startChat = useCallback(
    async (listingId: number): Promise<StartChatOutcome> => {
      try {
        const { room } = await openChatRoom(listingId);
        openedAt.current = pathname;
        setView({ kind: 'room', roomId: room.id, initialRoom: room, fromList: false });
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return { ok: false, reason: 'login', message: err.message };
        // 403(내 판매글)·404(삭제)·409(판매완료)는 서버 문구를 그대로 보여준다.
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
          return { ok: false, reason: 'message', message: err.message };
        }
        return { ok: false, reason: 'message', message: copy.startError };
      }
    },
    [pathname],
  );

  const close = useCallback(() => setView(CLOSED), []);

  return useMemo(
    () => ({ view, unreadCount, setUnreadCount, openList, openRoom, startChat, close }),
    [view, unreadCount, openList, openRoom, startChat, close],
  );
};

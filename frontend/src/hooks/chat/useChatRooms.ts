import { useCallback, useEffect, useRef, useState } from 'react';
import { getChatRooms } from '../../api/chat';
import { subscribeChat } from '../../api/chatSocket';
import type { ChatRoom } from '../../api/types';

type LoadStatus = 'loading' | 'error' | 'success';

/** 새 메시지가 몰려 올 때 목록을 매번 다시 부르지 않도록 잠깐 모았다가 한 번 부른다. */
const REFRESH_DELAY_MS = 300;

/**
 * 헤더 채팅 목록 (CHAT-02). 열려 있는 동안 새 메시지·다시 연결 이벤트가 오면 목록을 다시 불러온다
 * (마지막 메시지·순서·안 읽은 수가 함께 바뀌기 때문).
 */
export const useChatRooms = (onUnreadCount: (count: number) => void) => {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [rooms, setRooms] = useState<readonly ChatRoom[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      const res = await getChatRooms();
      setRooms(res.items);
      onUnreadCount(res.unreadCount);
      setStatus('success');
    } catch {
      setStatus((s) => (s === 'success' ? s : 'error'));
    }
  }, [onUnreadCount]);

  const reload = useCallback(() => {
    setStatus('loading');
    void load();
  }, [load]);

  useEffect(() => {
    void load();
    const unsubscribe = subscribeChat((event) => {
      if (event.type !== 'message' && event.type !== 'connected') return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void load(), REFRESH_DELAY_MS);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer.current);
    };
  }, [load]);

  return { status, rooms, reload } as const;
};

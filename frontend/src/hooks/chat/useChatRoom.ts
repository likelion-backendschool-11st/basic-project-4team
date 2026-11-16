import { useCallback, useEffect, useRef, useState } from 'react';
import { getChatMessages, getChatRoom, markChatRoomRead, sendChatImage, sendChatText, uploadChatImage } from '../../api/chat';
import { ApiError } from '../../api/client';
import { subscribeChat } from '../../api/chatSocket';
import type { ChatMessage, ChatRoom } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';
import { mergeMessages } from './chatHelpers';

type LoadStatus = 'loading' | 'error' | 'success';

interface UseChatRoomOptions {
  readonly roomId: number;
  readonly initialRoom: ChatRoom | null;
  readonly myId: number;
  /** 읽음 처리 후 전체 안 읽은 수 (헤더 배지). */
  readonly onUnreadCount: (count: number) => void;
  /** 서버가 401을 줬을 때 (토큰 만료). */
  readonly onLoginRequired: () => void;
}

const NOTICE_MS = 4000;
const READ_DELAY_MS = 300;

/**
 * 채팅방 하나 — 방 정보·메시지(CHAT-03·06), 보내기(CHAT-04), 읽음(CHAT-07), 실시간 수신(CHAT-05).
 * 창이 열려 있고 탭이 보이는 동안 상대 메시지가 오면 바로 읽음 처리한다.
 * WebSocket이 다시 연결되면 최신 메시지를 다시 불러와 끊긴 동안 놓친 것을 채운다.
 */
export const useChatRoom = ({ roomId, initialRoom, myId, onUnreadCount, onLoginRequired }: UseChatRoomOptions) => {
  const [room, setRoom] = useState<ChatRoom | null>(initialRoom);
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const loadedOnce = useRef(false);
  const readTimer = useRef<number | undefined>(undefined);
  const noticeTimer = useRef<number | undefined>(undefined);

  const showNotice = useCallback((text: string) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(text);
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiError && err.status === 401) {
        onLoginRequired();
        return;
      }
      showNotice(err instanceof ApiError && err.status >= 400 && err.status < 500 ? err.message : fallback);
    },
    [onLoginRequired, showNotice],
  );

  const markRead = useCallback(() => {
    window.clearTimeout(readTimer.current);
    readTimer.current = window.setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      markChatRoomRead(roomId)
        .then((res) => onUnreadCount(res.unreadCount))
        .catch(() => undefined);
    }, READ_DELAY_MS);
  }, [roomId, onUnreadCount]);

  /** 방 정보 + 최신 메시지. 이미 불러온 이전 메시지는 그대로 두고 합친다. */
  const loadLatest = useCallback(async () => {
    const [roomRes, page] = await Promise.all([getChatRoom(roomId), getChatMessages(roomId)]);
    setRoom(roomRes.room);
    setMessages((current) => mergeMessages(current, page.items));
    if (!loadedOnce.current) {
      setHasMore(page.hasMore);
      loadedOnce.current = true;
    }
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;
    loadedOnce.current = false;
    setMessages([]);
    setStatus('loading');
    loadLatest()
      .then(() => {
        if (cancelled) return;
        setStatus('success');
        markRead();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) onLoginRequired();
        setStatus('error');
      });

    const unsubscribe = subscribeChat((event) => {
      if (event.type === 'message' && event.roomId === roomId) {
        setMessages((current) => mergeMessages(current, [event.message]));
        if (event.message.senderId !== myId) markRead();
      } else if (event.type === 'read' && event.roomId === roomId && event.readerId !== myId) {
        setRoom((r) => r && { ...r, partnerLastReadMessageId: Math.max(r.partnerLastReadMessageId ?? 0, event.lastReadMessageId) });
      } else if (event.type === 'connected') {
        loadLatest().then(markRead).catch(() => undefined);
      }
    });
    const onVisible = () => {
      if (document.visibilityState === 'visible') markRead();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
      window.clearTimeout(readTimer.current);
    };
  }, [roomId, myId, loadLatest, markRead, onLoginRequired]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const retry = useCallback(() => {
    setStatus('loading');
    loadLatest()
      .then(() => {
        setStatus('success');
        markRead();
      })
      .catch(() => setStatus('error'));
  }, [loadLatest, markRead]);

  const loadOlder = useCallback(async () => {
    const first = messages[0];
    if (!first || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await getChatMessages(roomId, first.id);
      setMessages((current) => mergeMessages(current, page.items));
      setHasMore(page.hasMore);
    } catch (err) {
      handleError(err, copy.loadError);
    } finally {
      setLoadingOlder(false);
    }
  }, [messages, loadingOlder, roomId, handleError]);

  /** 텍스트 보내기. 보냈으면 true (입력창을 비운다). */
  const sendText = useCallback(
    async (text: string): Promise<boolean> => {
      const body = text.trim();
      if (!body || sending) return false;
      setSending(true);
      try {
        const res = await sendChatText(roomId, body);
        setMessages((current) => mergeMessages(current, [res.message]));
        if (res.filtered) showNotice(copy.filteredNotice);
        return true;
      } catch (err) {
        handleError(err, copy.sendError);
        return false;
      } finally {
        setSending(false);
      }
    },
    [roomId, sending, showNotice, handleError],
  );

  /** 사진 보내기 — 형식·용량을 먼저 확인하고 올린 뒤 메시지로 보낸다. */
  const sendImage = useCallback(
    async (file: File) => {
      if (!copy.imageTypes.includes(file.type)) {
        showNotice(copy.imageTypeError);
        return;
      }
      if (file.size > copy.imageMaxBytes) {
        showNotice(copy.imageSizeError);
        return;
      }
      setSending(true);
      try {
        const { image } = await uploadChatImage(file);
        const res = await sendChatImage(roomId, image.id);
        setMessages((current) => mergeMessages(current, [res.message]));
      } catch (err) {
        handleError(err, copy.sendError);
      } finally {
        setSending(false);
      }
    },
    [roomId, showNotice, handleError],
  );

  return { room, messages, hasMore, status, loadingOlder, sending, notice, retry, loadOlder, sendText, sendImage } as const;
};

export type ChatRoomState = ReturnType<typeof useChatRoom>;

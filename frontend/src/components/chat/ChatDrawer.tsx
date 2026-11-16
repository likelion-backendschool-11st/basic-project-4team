import React, { useCallback, useEffect } from 'react';
import type { ChatRoom } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';
import { useAuth } from '../../hooks/auth/useAuth';
import type { ChatContextValue } from '../../hooks/chat/chatContext';
import { useLoginGate } from '../../hooks/itemcommunity/useLoginGate';
import { Icon } from '../common/Icon';
import { LoginRequiredModal } from '../itemcommunity/LoginRequiredModal';
import { ChatRoomList } from './ChatRoomList';
import { ChatRoomView } from './ChatRoomView';

interface ChatDrawerProps {
  /** ChatProvider의 상태 (어떤 화면을 보여줄지, 안 읽은 수 갱신). */
  readonly chat: ChatContextValue;
}

/**
 * 오른쪽에서 열리는 채팅 창 하나 (REQ-DETAIL-005, REQ-HEADER-004).
 * 헤더 "채팅"은 목록부터, 판매글 "1:1 채팅하기"는 그 방을 바로 연다. Esc·바깥 클릭으로 닫힌다.
 */
export const ChatDrawer: React.FC<ChatDrawerProps> = ({ chat }) => {
  const { view, openList, openRoom, close, setUnreadCount } = chat;
  const { user } = useAuth();
  const loginGate = useLoginGate();
  const { prompt } = loginGate;
  const open = view.kind !== 'closed';

  // 토큰이 만료돼 서버가 401을 주면 창을 닫고 로그인 안내를 띄운다.
  const onLoginRequired = useCallback(() => {
    close();
    prompt();
  }, [close, prompt]);

  const onOpenRoom = useCallback((room: ChatRoom) => openRoom(room, true), [openRoom]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <>
      {open && user && (
        <div className="fixed inset-0 z-[60]">
          <button aria-label={copy.closeLabel} className="absolute inset-0 bg-ink/40 cursor-default" onClick={close} tabIndex={-1} type="button" />
          <aside
            aria-label={copy.listTitle}
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-full max-w-md bg-canvas shadow-xl border-l border-hairline flex flex-col"
            role="dialog"
          >
            {view.kind === 'list' && (
              <>
                <header className="flex items-center justify-between px-space-md h-14 border-b border-hairline shrink-0">
                  <h2 className="font-ui-label text-ui-label text-ink flex items-center gap-1">
                    <Icon className="text-[20px]" name="chat_bubble" />
                    {copy.listTitle}
                  </h2>
                  <button aria-label={copy.closeLabel} className="p-2 rounded hover:bg-canvas-soft" onClick={close} type="button">
                    <Icon className="text-[22px]" name="close" />
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto">
                  <ChatRoomList onOpenRoom={onOpenRoom} onUnreadCount={setUnreadCount} />
                </div>
              </>
            )}
            {view.kind === 'room' && (
              <ChatRoomView
                initialRoom={view.initialRoom}
                key={view.roomId}
                myId={user.id}
                onBack={view.fromList ? openList : null}
                onClose={close}
                onLoginRequired={onLoginRequired}
                onUnreadCount={setUnreadCount}
                roomId={view.roomId}
              />
            )}
          </aside>
        </div>
      )}
      <LoginRequiredModal
        {...copy.loginRequired}
        onClose={loginGate.close}
        onConfirm={loginGate.goLogin}
        open={loginGate.open}
      />
    </>
  );
};

export default ChatDrawer;

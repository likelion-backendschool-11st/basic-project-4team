import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toAssetUrl } from '../../api/client';
import type { ChatRoom } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';
import { ROUTES } from '../../data/layout';
import { isNewDay, lastReadMineId } from '../../hooks/chat/chatHelpers';
import { useChatRoom } from '../../hooks/chat/useChatRoom';
import { formatPrice } from '../../hooks/listing/listingViewHelpers';
import { Icon } from '../common/Icon';
import { ChatComposer } from './ChatComposer';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatRoomViewProps {
  readonly roomId: number;
  readonly initialRoom: ChatRoom | null;
  readonly myId: number;
  readonly onBack: (() => void) | null;
  readonly onClose: () => void;
  readonly onUnreadCount: (count: number) => void;
  readonly onLoginRequired: () => void;
}

/** 아래에서 이만큼 안쪽이면 "맨 아래를 보고 있다"고 보고 새 메시지에 따라 내려간다. */
const STICK_BOTTOM_PX = 120;

const statusClass: Record<ChatRoom['listing']['status'], string> = {
  selling: 'bg-mint-100 text-forest',
  reserved: 'bg-surface-container-high text-on-surface-variant',
  sold: 'bg-surface-container-high text-muted',
};

/** 1:1 채팅방 — 상대·판매글 요약, 메시지(날짜 구분·읽음), 이전 메시지 보기, 입력창. */
export const ChatRoomView: React.FC<ChatRoomViewProps> = ({
  roomId,
  initialRoom,
  myId,
  onBack,
  onClose,
  onUnreadCount,
  onLoginRequired,
}) => {
  const state = useChatRoom({ roomId, initialRoom, myId, onUnreadCount, onLoginRequired });
  const { room, messages } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const prev = useRef({ firstId: 0, lastId: 0, scrollHeight: 0, nearBottom: true });

  // 새 메시지가 아래에 붙으면 맨 아래로(보고 있었거나 내가 보낸 경우), 이전 메시지가 위에 붙으면 보던 자리를 유지한다.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    const first = messages[0].id;
    const last = messages[messages.length - 1];
    const p = prev.current;
    if (p.lastId === 0) {
      el.scrollTop = el.scrollHeight;
    } else if (first < p.firstId && last.id === p.lastId) {
      el.scrollTop += el.scrollHeight - p.scrollHeight;
    } else if (last.id !== p.lastId && (p.nearBottom || last.senderId === myId)) {
      el.scrollTop = el.scrollHeight;
    }
    prev.current = { ...p, firstId: first, lastId: last.id, scrollHeight: el.scrollHeight };
  }, [messages, myId]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    prev.current.nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_BOTTOM_PX;
    prev.current.scrollHeight = el.scrollHeight;
  };

  const readId = lastReadMineId(messages, myId, room?.partnerLastReadMessageId ?? null);
  const listingTo = room
    ? room.myRole === 'seller'
      ? ROUTES.myListingDetail(String(room.listing.id))
      : ROUTES.listingDetail(String(room.listing.id))
    : null;
  const showQuickReplies = state.status === 'success' && messages.length === 0 && room?.myRole === 'buyer';

  return (
    <>
      <header className="flex items-center justify-between gap-space-xs px-space-sm h-14 border-b border-hairline bg-canvas-soft shrink-0">
        <div className="flex items-center gap-space-xs min-w-0">
          {onBack && (
            <button aria-label={copy.backLabel} className="p-1.5 rounded hover:bg-canvas" onClick={onBack} type="button">
              <Icon className="text-[22px]" name="arrow_back" />
            </button>
          )}
          <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0">
            {room?.partner.nickname.charAt(0) ?? ''}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="font-ui-label text-ui-label text-ink truncate">{room?.partner.nickname ?? copy.loading}</span>
            {room && <span className="font-micro text-micro text-muted">{copy.roles[room.myRole]}</span>}
          </span>
        </div>
        <button aria-label={copy.closeLabel} className="p-1.5 text-muted hover:text-ink rounded hover:bg-canvas" onClick={onClose} type="button">
          <Icon className="text-[22px]" name="close" />
        </button>
      </header>

      {room && (
        <div className="px-space-sm py-space-xs bg-mint-50 border-b border-mint-200 flex items-center gap-space-xs shrink-0">
          <span className="w-10 h-10 rounded bg-canvas-soft border border-hairline shrink-0 overflow-hidden flex items-center justify-center">
            {room.listing.thumbnailUrl ? (
              <img alt={room.listing.title} className="w-full h-full object-cover" src={toAssetUrl(room.listing.thumbnailUrl)} />
            ) : (
              <Icon className="text-[18px] text-outline" name="image" />
            )}
          </span>
          <span className="flex-1 min-w-0 flex flex-col">
            <span className="font-ui-sm text-ui-sm text-ink font-bold truncate">
              {room.listing.isDeleted ? copy.deletedListing : room.listing.title}
            </span>
            <span className="flex items-center gap-1">
              <span className={`font-micro text-micro px-1.5 rounded ${statusClass[room.listing.status]}`}>{copy.statuses[room.listing.status]}</span>
              <span className="font-micro text-micro text-forest font-bold">{copy.price(formatPrice(room.listing.price))}</span>
            </span>
          </span>
          {listingTo && !room.listing.isDeleted ? (
            <Link className="font-micro text-micro text-link hover:underline shrink-0" to={listingTo}>
              {copy.viewListing}
            </Link>
          ) : (
            <span className="font-eyebrow text-eyebrow bg-canvas text-forest px-2 py-1 rounded border border-mint-200 shrink-0">{copy.escrowBadge}</span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-space-md py-space-sm bg-canvas" onScroll={onScroll} ref={scrollRef}>
        <p className="text-center mb-space-sm">
          <span className="font-micro text-micro text-muted bg-canvas-soft px-2.5 py-1 rounded-full border border-hairline inline-block">
            {copy.privacyNotice}
          </span>
        </p>
        {state.status === 'loading' && messages.length === 0 && (
          <p className="py-space-xl text-center font-body-sm text-body-sm text-muted">{copy.loading}</p>
        )}
        {state.status === 'error' && messages.length === 0 && (
          <div className="py-space-xl flex flex-col items-center gap-space-sm">
            <p className="font-body-sm text-body-sm text-muted">{copy.loadError}</p>
            <button className="font-ui-sm text-ui-sm text-link hover:underline" onClick={state.retry} type="button">
              {copy.retry}
            </button>
          </div>
        )}
        {state.hasMore && messages.length > 0 && (
          <button
            className="w-full mb-space-sm py-space-xs rounded border border-hairline font-ui-sm text-ui-sm text-on-surface-variant hover:bg-canvas-soft disabled:opacity-50"
            disabled={state.loadingOlder}
            onClick={() => void state.loadOlder()}
            type="button"
          >
            {state.loadingOlder ? copy.loadingOlder : copy.loadOlder}
          </button>
        )}
        {state.status === 'success' && messages.length === 0 && room && (
          <p className="py-space-lg text-center font-body-sm text-body-sm text-muted">{copy.emptyRoom(room.partner.nickname)}</p>
        )}
        <ol className="flex flex-col gap-space-sm font-body-sm text-body-sm">
          {messages.map((message, index) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              mine={message.senderId === myId}
              partnerNickname={room?.partner.nickname ?? ''}
              showDay={isNewDay(messages, index)}
              showRead={message.id === readId}
            />
          ))}
        </ol>
      </div>

      {state.notice && (
        <p className="px-space-sm py-space-xs bg-error-container text-on-error-container font-caption text-caption shrink-0" role="status">
          {state.notice}
        </p>
      )}
      <ChatComposer
        onSendImage={(file) => void state.sendImage(file)}
        onSendText={state.sendText}
        quickReplies={showQuickReplies ? copy.quickReplies : []}
        sending={state.sending}
      />
    </>
  );
};

export default ChatRoomView;

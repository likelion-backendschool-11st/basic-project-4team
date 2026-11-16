import React from 'react';
import { toAssetUrl } from '../../api/client';
import type { ChatRoom } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';
import { formatListTime, previewText } from '../../hooks/chat/chatHelpers';
import { useChatRooms } from '../../hooks/chat/useChatRooms';
import { Icon } from '../common/Icon';
import { HeaderCountBadge } from '../layout/HeaderCountBadge';

interface ChatRoomListProps {
  readonly onOpenRoom: (room: ChatRoom) => void;
  readonly onUnreadCount: (count: number) => void;
}

interface ChatRoomRowProps {
  readonly room: ChatRoom;
  readonly onOpen: (room: ChatRoom) => void;
}

const ChatRoomRow: React.FC<ChatRoomRowProps> = ({ room, onOpen }) => {
  const { listing, partner, lastMessage, unreadCount } = room;
  const unread = unreadCount > 0;
  return (
    <li className="border-b border-hairline last:border-b-0">
      <button
        aria-label={unread ? `${partner.nickname} · ${copy.unreadLabel(unreadCount)}` : partner.nickname}
        className="w-full flex items-center gap-space-sm py-space-sm text-left hover:bg-canvas-soft transition-colors"
        onClick={() => onOpen(room)}
        type="button"
      >
        <span className="w-12 h-12 rounded bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center">
          {listing.thumbnailUrl ? (
            <img alt={listing.title} className="w-full h-full object-cover" loading="lazy" src={toAssetUrl(listing.thumbnailUrl)} />
          ) : (
            <Icon className="text-[22px] text-outline" name="image" />
          )}
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="flex items-center gap-1 min-w-0">
            <span className="font-ui-label text-ui-label text-ink truncate">{partner.nickname}</span>
            <span className="font-micro text-micro px-1.5 py-0.5 rounded bg-mint-50 text-forest shrink-0">{copy.roles[room.myRole]}</span>
            {lastMessage && <span className="ml-auto font-micro text-micro text-muted shrink-0">{formatListTime(lastMessage.createdAt)}</span>}
          </span>
          <span className="font-micro text-micro text-muted truncate">
            {listing.isDeleted ? copy.deletedListing : listing.title}
          </span>
          <span className="flex items-center gap-space-xs">
            <span className={`flex-1 min-w-0 font-body-sm text-body-sm truncate ${unread ? 'text-ink font-bold' : 'text-on-surface-variant'}`}>
              {lastMessage?.type === 'image' && <Icon className="text-[14px] align-[-2px] mr-0.5" name="image" />}
              {previewText(lastMessage)}
            </span>
            <HeaderCountBadge count={unreadCount} />
          </span>
        </span>
      </button>
    </li>
  );
};

/** 헤더 채팅 → 내 채팅방 목록 (CHAT-02). 구매 문의와 내 판매글 문의가 함께 최근 메시지 순으로 나온다. */
export const ChatRoomList: React.FC<ChatRoomListProps> = ({ onOpenRoom, onUnreadCount }) => {
  const { status, rooms, reload } = useChatRooms(onUnreadCount);

  if (status === 'loading' && rooms.length === 0) {
    return <p className="py-space-xl text-center font-body-sm text-body-sm text-muted">{copy.loading}</p>;
  }
  if (status === 'error' && rooms.length === 0) {
    return (
      <div className="py-space-xl flex flex-col items-center gap-space-sm">
        <p className="font-body-sm text-body-sm text-muted">{copy.loadError}</p>
        <button className="font-ui-sm text-ui-sm text-link hover:underline" onClick={reload} type="button">
          {copy.retry}
        </button>
      </div>
    );
  }
  if (rooms.length === 0) {
    return (
      <div className="py-space-section px-space-md flex flex-col items-center gap-space-xs text-center">
        <Icon className="text-[40px] text-outline" name="forum" />
        <p className="font-ui-label text-ui-label text-ink">{copy.listEmptyTitle}</p>
        <p className="font-body-sm text-body-sm text-muted">{copy.listEmptyBody}</p>
      </div>
    );
  }
  return (
    <ul className="px-space-md">
      {rooms.map((room) => (
        <ChatRoomRow key={room.id} onOpen={onOpenRoom} room={room} />
      ))}
    </ul>
  );
};

export default ChatRoomList;

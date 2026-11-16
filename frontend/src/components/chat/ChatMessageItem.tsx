import React from 'react';
import { toAssetUrl } from '../../api/client';
import type { ChatMessage } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';
import { formatChatDay, formatChatTime } from '../../hooks/chat/chatHelpers';

interface ChatMessageItemProps {
  readonly message: ChatMessage;
  readonly mine: boolean;
  readonly partnerNickname: string;
  /** 앞 메시지와 날짜가 다르면 날짜 구분선을 먼저 그린다. */
  readonly showDay: boolean;
  /** 상대가 읽은 내 마지막 메시지면 "읽음". */
  readonly showRead: boolean;
}

/** 채팅 말풍선 — 내 메시지는 오른쪽, 상대 메시지는 왼쪽. 사진은 누르면 새 탭에서 크게 본다. */
export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, mine, partnerNickname, showDay, showRead }) => {
  const meta = (
    <span className={`flex flex-col shrink-0 font-micro text-micro text-muted ${mine ? 'items-end' : 'items-start'}`}>
      {showRead && <span className="text-forest">{copy.read}</span>}
      <time dateTime={message.createdAt}>{formatChatTime(message.createdAt)}</time>
    </span>
  );
  const bubble =
    message.type === 'image' && message.imageUrl ? (
      <a
        aria-label={copy.openImage}
        className="block rounded overflow-hidden border border-hairline max-w-[220px]"
        href={toAssetUrl(message.imageUrl)}
        rel="noreferrer"
        target="_blank"
      >
        <img
          alt={mine ? copy.myImageAlt : copy.imageAlt(partnerNickname)}
          className="w-full h-auto max-h-64 object-cover"
          loading="lazy"
          src={toAssetUrl(message.imageUrl)}
        />
      </a>
    ) : (
      <p
        className={`px-space-sm py-space-xs rounded leading-relaxed whitespace-pre-wrap break-words ${
          mine ? 'bg-primary-container text-on-primary' : 'bg-canvas-soft border border-hairline text-ink'
        }`}
      >
        {message.body}
      </p>
    );

  return (
    <li className="flex flex-col gap-space-xs">
      {showDay && (
        <div className="flex justify-center py-space-xs">
          <span className="font-micro text-micro text-muted bg-canvas-soft px-2.5 py-0.5 rounded-full border border-hairline">
            {formatChatDay(message.createdAt)}
          </span>
        </div>
      )}
      <div className={`flex items-end gap-1.5 max-w-[85%] ${mine ? 'self-end flex-row-reverse' : 'self-start'}`}>
        {bubble}
        {meta}
      </div>
    </li>
  );
};

export default ChatMessageItem;

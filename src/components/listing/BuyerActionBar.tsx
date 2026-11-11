import React from 'react';
import { Icon } from '../common/Icon';
import { DiscussionShortcut } from './DiscussionShortcut';

interface BuyerActionBarProps {
  readonly itemId: string;
  readonly discussionLabel: string;
  readonly discussionTitle: string;
  readonly discussionCount: number;
  readonly wishLabel: string;
  readonly wishCount: number;
  readonly wished: boolean;
  readonly onToggleWish: () => void;
  readonly chatLabel: string;
  readonly onOpenChat: () => void;
}

/** Primary buyer CTA row: 토론방 · 찜 toggle · 1:1 채팅하기. */
export const BuyerActionBar: React.FC<BuyerActionBarProps> = ({
  itemId,
  discussionLabel,
  discussionTitle,
  discussionCount,
  wishLabel,
  wishCount,
  wished,
  onToggleWish,
  chatLabel,
  onOpenChat,
}) => (
  <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm mt-space-md pt-space-sm border-t border-hairline">
    <DiscussionShortcut
      count={discussionCount}
      itemId={itemId}
      label={discussionLabel}
      title={discussionTitle}
      variant="button"
    />
    <button
      aria-pressed={wished}
      className={`flex-1 sm:flex-none sm:min-w-[130px] h-12 border-2 hover:border-primary-container rounded text-ink font-ui-label text-ui-label flex items-center justify-center gap-1.5 transition-all ${
        wished ? 'bg-mint-50 border-primary' : 'bg-canvas hover:bg-canvas-soft border-hairline-strong'
      }`}
      onClick={onToggleWish}
      type="button"
    >
      <Icon className={`text-[22px] transition-colors ${wished ? 'text-error' : 'text-muted'}`} filled={wished} name="favorite" />
      <span>
        {wishLabel} {wishCount}
      </span>
    </button>
    <button
      className="w-full sm:w-auto sm:flex-1 h-12 bg-primary-container hover:bg-forest text-on-primary font-ui-label text-ui-label rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
      onClick={onOpenChat}
      type="button"
    >
      <Icon className="text-[20px]" name="chat" />
      <span>{chatLabel}</span>
    </button>
  </div>
);

export default BuyerActionBar;

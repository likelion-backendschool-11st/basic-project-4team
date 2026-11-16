import React from 'react';
import { CopyUrlButton } from './CopyUrlButton';
import { DiscussionShortcut } from './DiscussionShortcut';

interface ListingCategoryHeaderProps {
  readonly eyebrow: string;
  readonly setLabel: string;
  readonly itemId: string;
  readonly discussionLabel: string;
  /** 품목 토론글 수. 불러오기 전이면 null(숫자 숨김). */
  readonly discussionCount: number | null;
  readonly onCopied: (copied: boolean) => void;
  /** URL 복사로 복사할 공개 주소. */
  readonly sharePath: string;
}

/** Buyer view: card number eyebrow · set name · 품목 토론방 chip · URL 복사. */
export const ListingCategoryHeader: React.FC<ListingCategoryHeaderProps> = ({
  eyebrow,
  setLabel,
  itemId,
  discussionLabel,
  discussionCount,
  onCopied,
  sharePath,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-space-xs pb-space-xs border-b border-hairline">
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-eyebrow text-eyebrow text-primary uppercase tracking-wider">{eyebrow}</span>
      <span className="text-faint">·</span>
      <span className="font-caption text-caption text-muted">{setLabel}</span>
    </div>
    <div className="mr-auto sm:ml-space-xs">
      <DiscussionShortcut count={discussionCount ?? undefined} itemId={itemId} label={discussionLabel} variant="chip" />
    </div>
    <CopyUrlButton onCopied={onCopied} sharePath={sharePath} variant="buyer" />
  </div>
);

export default ListingCategoryHeader;

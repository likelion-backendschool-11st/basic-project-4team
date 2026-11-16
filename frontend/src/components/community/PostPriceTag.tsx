import React from 'react';
import { priceTagCopy, type PostPriceTagView } from '../../data/community';
import { Icon } from '../common/Icon';

export interface PostPriceTagProps {
  readonly tag: PostPriceTagView;
}

const toneClass: Record<PostPriceTagView['tone'], string> = {
  up: 'text-primary',
  down: 'text-error',
  flat: 'text-muted',
};

/** 글 카드의 희망 체결가 칩 — "희망 체결가 300,000원 · 시세 대비 -6.3%". */
export const PostPriceTag: React.FC<PostPriceTagProps> = ({ tag }) => (
  <div className="mb-space-sm inline-flex flex-wrap items-center gap-space-xs px-space-sm py-space-xxs rounded-lg bg-mint-50">
    <Icon className="text-[16px] text-forest" name={priceTagCopy.icon} />
    <span className="font-ui-label text-ui-label text-forest font-bold">{tag.label}</span>
    {tag.diffLabel && <span className={`font-caption text-caption ${toneClass[tag.tone]}`}>{tag.diffLabel}</span>}
  </div>
);

export default PostPriceTag;

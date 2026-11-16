import React from 'react';
import { Link } from 'react-router-dom';
import { feedCopy, type FeedItemTag } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

export interface PostItemTagProps {
  readonly tag: FeedItemTag;
}

const trendClass: Record<FeedItemTag['trend'], string> = {
  up: 'text-primary',
  down: 'text-error',
  flat: 'text-muted',
};

/** 시세 태그 카드 — 품목 이미지·이름·최근 체결가. 누르면 품목 토론방으로 이동. */
export const PostItemTag: React.FC<PostItemTagProps> = ({ tag }) => (
  <Link
    className="mb-space-md flex items-center gap-space-sm p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
    to={ROUTES.itemDiscussion(tag.slug)}
  >
    <div className="w-12 h-12 rounded bg-surface-container-lowest overflow-hidden shrink-0 flex items-center justify-center">
      {tag.imageSrc ? (
        <img alt={tag.name} className="w-full h-full object-contain" loading="lazy" src={tag.imageSrc} />
      ) : (
        <Icon className="text-[22px] text-muted" name="image" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <span className="flex items-center gap-1 font-micro text-micro text-forest">
        <Icon className="text-[12px]" name={feedCopy.itemTagIcon} />
        {feedCopy.itemTagLabel}
      </span>
      <span className="block font-ui-label text-ui-label text-on-surface truncate">{tag.name}</span>
    </div>
    <div className="text-right shrink-0">
      <span className="block font-ui-label text-ui-label text-on-surface font-bold">{tag.priceLabel}</span>
      {tag.changeLabel && <span className={`font-caption text-caption ${trendClass[tag.trend]}`}>{tag.changeLabel}</span>}
    </div>
  </Link>
);

export default PostItemTag;

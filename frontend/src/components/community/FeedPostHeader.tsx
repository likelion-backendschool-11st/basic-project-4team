import React from 'react';
import type { FeedPost } from '../../data/community';
import { Icon } from '../common/Icon';
import { AuthorAvatar } from './AuthorAvatar';
import { BoardTagChip } from './BoardTagChip';
import { UserBadge } from './UserBadge';

export interface FeedPostHeaderProps {
  readonly post: FeedPost;
}

/** Avatar + board chip + author/badge + time/context row, with overflow button. */
export const FeedPostHeader: React.FC<FeedPostHeaderProps> = ({ post }) => (
  <div className="flex items-center justify-between gap-space-xs mb-space-sm">
    <div className="flex items-center gap-space-xs min-w-0">
      <AuthorAvatar author={post.author} />
      <div className="min-w-0">
        <div className="flex items-center gap-space-xs flex-wrap">
          <BoardTagChip icon={post.board.icon} itemId={post.board.itemId} label={post.board.label} />
          <span className="text-faint font-micro text-micro">·</span>
          <span className="font-ui-label text-ui-label text-on-surface">{post.author.name}</span>
          {post.badge && <UserBadge badge={post.badge} />}
        </div>
        <div className="flex items-center gap-space-xs mt-0.5 text-muted font-caption text-caption">
          <span>{post.timeAgo}</span>
          <span>·</span>
          <span>{post.context}</span>
        </div>
      </div>
    </div>
    <button aria-label="더보기" className="text-muted hover:text-on-surface p-1 shrink-0" type="button">
      <Icon className="text-[20px]" name="more_horiz" />
    </button>
  </div>
);

export default FeedPostHeader;

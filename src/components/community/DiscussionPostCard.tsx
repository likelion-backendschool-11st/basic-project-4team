import React from 'react';
import { Link } from 'react-router-dom';
import { discussionPostCopy, type DiscussionPost } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';
import { AuthorAvatar } from './AuthorAvatar';
import { BookmarkButton } from './BookmarkButton';
import { PostImages } from './PostImages';
import { PostMoreMenu } from './PostMoreMenu';
import { ReactionBar } from './ReactionBar';
import { UserBadge } from './UserBadge';

export interface DiscussionPostCardProps {
  readonly post: DiscussionPost;
  readonly itemId: string;
}

/** Item discussion post: author row, body, optional photos, reactions + comment/bookmark. */
export const DiscussionPostCard: React.FC<DiscussionPostCardProps> = ({ post, itemId }) => (
  /* data-component="DiscussionPostCard" */
  <article className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm transition-all hover:shadow-md" id={post.id}>
    <header className="flex items-center justify-between mb-space-sm">
      <div className="flex items-center gap-space-sm min-w-0">
        <AuthorAvatar author={post.author} variant="discussion" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-ui-label text-ui-label text-on-surface">{post.author.name}</span>
            {post.badges.map((b) => (
              <UserBadge badge={b} key={b.label} variant="discussion" />
            ))}
          </div>
          <span className="font-micro text-micro text-muted">{post.meta}</span>
        </div>
      </div>
      <PostMoreMenu />
    </header>
    <p className={`font-body-md text-body-md text-on-surface leading-relaxed ${post.images ? 'mb-space-sm' : 'mb-space-md'}`}>
      {post.body}
    </p>
    {post.images && post.images.length > 0 && <PostImages images={post.images} variant="strip" />}
    {/* Reactions & Meta Row — data-component="Footer" */}
    <footer className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low/50 rounded-lg p-space-xs">
      <ReactionBar seeds={post.reactions} variant="chip" />
      <div className="flex items-center gap-space-xs">
        <Link
          className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container-lowest font-ui-sm text-ui-sm text-on-surface-variant hover:text-primary transition-colors shadow-sm"
          to={`${ROUTES.itemDiscussion(itemId)}#${post.id}`}
        >
          <Icon className="text-[16px]" name={discussionPostCopy.commentIcon} />
          <span>
            {discussionPostCopy.comment} <strong>{post.commentCount}</strong>
          </span>
        </Link>
        <BookmarkButton />
      </div>
    </footer>
  </article>
);

export default DiscussionPostCard;

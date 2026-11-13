import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { commentCopy } from '../../data/comment';
import { discussionPostCopy, type DiscussionPost } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { useAuth } from '../../hooks/auth/useAuth';
import { useComments } from '../../hooks/comment/useComments';
import { CommentSection } from '../comment/CommentSection';
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
  /** 이모지를 누르기 전에 호출. false면 동작을 막는다 (비로그인 팝업). */
  readonly ensureLogin?: () => boolean;
  /** URL #post-N으로 들어온 글이면 true → 댓글을 펼치고 화면에 보이게 스크롤. */
  readonly focused?: boolean;
}

const commentButtonClass =
  'flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container-lowest font-ui-sm text-ui-sm text-on-surface-variant hover:text-primary transition-colors shadow-sm';

/** Item discussion post: author row, body, optional photos, reactions + comment(펼치기)/bookmark. */
export const DiscussionPostCard: React.FC<DiscussionPostCardProps> = ({ post, itemId, ensureLogin, focused = false }) => {
  const { postId } = post;
  const { status } = useAuth();
  // API에서 온 글(postId 있음)만 댓글을 펼칠 수 있다.
  const comments = useComments(postId ?? 0, post.commentCount, focused && postId !== undefined);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focused]);

  return (
    /* data-component="DiscussionPostCard" */
    <article className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm transition-all hover:shadow-md" id={post.id} ref={ref}>
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
      <p className={`font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line ${post.images ? 'mb-space-sm' : 'mb-space-md'}`}>
        {post.body}
      </p>
      {post.images && post.images.length > 0 && <PostImages images={post.images} variant="strip" />}
      {/* Reactions & Meta Row — data-component="Footer" */}
      <footer className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low/50 rounded-lg p-space-xs">
        <ReactionBar canToggle={ensureLogin} seeds={post.reactions} variant="chip" />
        <div className="flex items-center gap-space-xs">
          {postId !== undefined ? (
            <button aria-expanded={comments.open} className={commentButtonClass} onClick={comments.toggle} type="button">
              <Icon className="text-[16px]" name={discussionPostCopy.commentIcon} />
              <span>
                {discussionPostCopy.comment} <strong>{comments.totalCount}</strong>
              </span>
              <Icon className="text-[16px]" name={comments.open ? commentCopy.collapseIcon : commentCopy.expandIcon} />
            </button>
          ) : (
            <Link className={commentButtonClass} to={`${ROUTES.itemDiscussion(itemId)}#${post.id}`}>
              <Icon className="text-[16px]" name={discussionPostCopy.commentIcon} />
              <span>
                {discussionPostCopy.comment} <strong>{post.commentCount}</strong>
              </span>
            </Link>
          )}
          <BookmarkButton />
        </div>
      </footer>
      {comments.open && <CommentSection canWrite={status === 'authenticated'} state={comments} />}
    </article>
  );
};

export default DiscussionPostCard;

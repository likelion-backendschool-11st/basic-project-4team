import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { commentCopy } from '../../data/comment';
import { discussionEditCopy, discussionPostCopy, type DiscussionPost } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { useAuth } from '../../hooks/auth/useAuth';
import { useComments } from '../../hooks/comment/useComments';
import type { DiscussionComposerPayload } from '../../hooks/community/useDiscussionComposer';
import { useReport } from '../../hooks/comment/useReport';
import { CommentSection } from '../comment/CommentSection';
import { ReportModal } from '../comment/ReportModal';
import { Icon } from '../common/Icon';
import { AuthorAvatar } from './AuthorAvatar';
import { DiscussionPostEditor } from './DiscussionPostEditor';
import { PostImages } from './PostImages';
import { PostMoreMenu } from './PostMoreMenu';
import { PostPriceTag } from './PostPriceTag';
import { ReactionBar } from './ReactionBar';
import { UserBadge } from './UserBadge';

export interface DiscussionPostCardProps {
  readonly post: DiscussionPost;
  readonly itemId: string;
  /** 이모지·신고를 누르기 전에 호출. false면 동작을 막는다 (비로그인 팝업). */
  readonly ensureLogin?: () => boolean;
  /** URL #post-N으로 들어온 글이면 true → 댓글을 펼치고 화면에 보이게 스크롤. */
  readonly focused?: boolean;
  /** 내 글 수정 (본문·사진·희망 체결가). 성공하면 true. */
  readonly onEdit?: (postId: number, payload: DiscussionComposerPayload) => Promise<boolean>;
  /** 내 글 삭제. */
  readonly onDelete?: (postId: number) => void;
  /** 이 품목의 최근 체결가 — 수정 폼의 희망 체결가 비교용. */
  readonly marketPrice?: number | null;
}

const commentButtonClass =
  'flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container-lowest font-ui-sm text-ui-sm text-on-surface-variant hover:text-primary transition-colors shadow-sm';

/** Item discussion post: author row, body, optional photos, reactions + comment(펼치기). */
export const DiscussionPostCard: React.FC<DiscussionPostCardProps> = ({
  post,
  itemId,
  ensureLogin,
  focused = false,
  onEdit,
  onDelete,
  marketPrice = null,
}) => {
  const { postId } = post;
  const { status } = useAuth();
  // API에서 온 글(postId 있음)만 댓글을 펼칠 수 있다.
  const comments = useComments(postId ?? 0, post.commentCount, focused && postId !== undefined);
  const report = useReport();
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const canEdit = Boolean(post.isMine && postId !== undefined && post.editSource && onEdit);

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focused]);

  const handleMenuSelect = (key: string) => {
    if (key === 'report' && postId !== undefined && (!ensureLogin || ensureLogin())) report.open('post', postId);
    if (key === 'edit' && canEdit) setEditing(true);
    if (key === 'delete' && postId !== undefined && window.confirm(discussionEditCopy.deleteConfirm)) onDelete?.(postId);
  };

  const handleSave = async (payload: DiscussionComposerPayload) => {
    if (postId === undefined || !onEdit) return false;
    const ok = await onEdit(postId, payload);
    if (ok) setEditing(false);
    return ok;
  };

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
        {/* 내 글: 공유·수정하기·삭제하기 / 다른 사람 글: 공유·신고하기 */}
        <PostMoreMenu items={post.isMine ? discussionPostCopy.ownerMenu : discussionPostCopy.menu} onSelect={handleMenuSelect} />
      </header>
      {editing && post.editSource ? (
        <DiscussionPostEditor
          ensureLogin={ensureLogin ?? (() => true)}
          marketPrice={marketPrice}
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          source={post.editSource}
        />
      ) : (
        <>
          <p className={`font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line ${post.images ? 'mb-space-sm' : 'mb-space-md'}`}>
            {post.body}
          </p>
          {post.priceTag && <PostPriceTag tag={post.priceTag} />}
          {post.images && post.images.length > 0 && <PostImages images={post.images} variant="strip" />}
        </>
      )}
      {/* Reactions & Meta Row — data-component="Footer" */}
      <footer className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low/50 rounded-lg p-space-xs">
        {postId !== undefined && (
          <ReactionBar canToggle={ensureLogin} postId={postId} seeds={post.reactions} selected={post.myReaction} variant="chip" />
        )}
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
        </div>
      </footer>
      {report.notice && (
        <p className="mt-space-xs font-body-sm text-body-sm text-primary" role="status">
          {report.notice}
        </p>
      )}
      {comments.open && <CommentSection canWrite={status === 'authenticated'} state={comments} />}
      <ReportModal state={report} />
    </article>
  );
};

export default DiscussionPostCard;

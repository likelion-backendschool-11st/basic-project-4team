import React from 'react';
import { feedCopy, feedPostEditCopy, type FeedPost } from '../../data/community';
import { useAuth } from '../../hooks/auth/useAuth';
import { useComments } from '../../hooks/comment/useComments';
import { usePostEditor } from '../../hooks/community/usePostEditor';
import { CommentSection } from '../comment/CommentSection';
import { FeedPoll } from './FeedPoll';
import { FeedPostActions } from './FeedPostActions';
import { FeedPostHeader } from './FeedPostHeader';
import { PostImages } from './PostImages';
import { ReactionBar } from './ReactionBar';

export interface FeedPostCardProps {
  readonly post: FeedPost;
  /** 내 글 본문 수정. 성공하면 true. */
  readonly onEdit?: (postId: number, body: string) => Promise<boolean>;
  /** 내 글 삭제. */
  readonly onDelete?: (postId: number) => void;
}

/** Community feed card — renders poll (PollWidget) or regular post (FeedCard) layout. */
export const FeedPostCard: React.FC<FeedPostCardProps> = ({ post, onEdit, onDelete }) => {
  const isPoll = Boolean(post.poll);
  const { postId } = post;
  // API에서 온 글(postId 있음)만 댓글을 펼칠 수 있다. 목 데이터 글은 기존처럼 토론방 링크.
  const comments = useComments(postId ?? 0, post.commentCount);
  const { status } = useAuth();
  const commentToggle = postId !== undefined ? comments.toggle : undefined;
  const editor = usePostEditor(post.body, (body) =>
    postId !== undefined && onEdit ? onEdit(postId, body) : Promise.resolve(false),
  );

  const handleMenuSelect = (key: string) => {
    if (key === 'edit') editor.start();
    if (key === 'delete' && postId !== undefined && window.confirm(feedPostEditCopy.deleteConfirm)) {
      onDelete?.(postId);
    }
  };

  return (
    /* data-component={isPoll ? 'PollWidget' : 'FeedCard'} */
    <article className="bg-canvas rounded-lg p-space-md shadow-sm border border-hairline/60">
      <FeedPostHeader onMenuSelect={handleMenuSelect} post={post} />
      {post.title && (
        <h3
          className={`text-on-surface font-bold mb-space-xs ${
            isPoll ? 'font-heading-3 text-heading-3' : 'font-heading-4 text-heading-4'
          }`}
        >
          {post.title}
        </h3>
      )}
      {editor.editing ? (
        <div className="mb-space-md">
          <textarea
            aria-label={feedPostEditCopy.saveLabel}
            className="w-full p-space-sm bg-surface-container-low border-0 rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-0 resize-none"
            maxLength={feedPostEditCopy.bodyMax}
            onChange={(e) => editor.setDraft(e.target.value)}
            rows={3}
            value={editor.draft}
          />
          <div className="flex items-center justify-end gap-space-xs mt-space-xs">
            <span className="font-micro text-micro text-muted mr-auto">
              {editor.draft.length}/{feedPostEditCopy.bodyMax}
            </span>
            <button
              className="px-space-md py-space-xs rounded-lg font-ui-label text-ui-label text-on-surface-variant hover:bg-surface-container"
              onClick={editor.cancel}
              type="button"
            >
              {feedPostEditCopy.cancelLabel}
            </button>
            <button
              className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-ui-label text-ui-label font-bold hover:bg-primary disabled:opacity-60"
              disabled={!editor.canSave}
              onClick={editor.save}
              type="button"
            >
              {feedPostEditCopy.saveLabel}
            </button>
          </div>
        </div>
      ) : (
        <p className="font-body-md text-body-md text-body mb-space-md leading-relaxed whitespace-pre-line">{post.body}</p>
      )}

      {post.poll ? (
        <FeedPoll
          actions={
            <FeedPostActions
              commentIcon="chat_bubble"
              commentLabel={feedCopy.pollCommentLabel(comments.totalCount)}
              commentsOpen={comments.open}
              itemId={post.board.itemId}
              onCommentToggle={commentToggle}
            />
          }
          poll={post.poll}
        />
      ) : (
        <>
          {post.images && post.images.length > 0 && <PostImages images={post.images} />}
          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs font-ui-sm text-ui-sm">
            <ReactionBar seeds={post.reactions ?? []} />
            <FeedPostActions
              commentIcon="chat"
              commentLabel={feedCopy.commentLabel(comments.totalCount)}
              commentsOpen={comments.open}
              itemId={post.board.itemId}
              onCommentToggle={commentToggle}
            />
          </div>
        </>
      )}
      {comments.open && <CommentSection canWrite={status === 'authenticated'} state={comments} />}
    </article>
  );
};

export default FeedPostCard;

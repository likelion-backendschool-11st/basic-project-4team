import React from 'react';
import { Link } from 'react-router-dom';
import type { MyComment } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { myCommentsCopy as copy, myPostsCopy } from '../../data/mypage';
import { formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { useMyComments } from '../../hooks/mypage/useMyLists';
import { Icon } from '../common/Icon';
import { MyEmptyState } from './MyEmptyState';
import { MyListShell } from './MyListShell';

interface MyCommentsPanelProps {
  readonly className?: string;
}

interface CommentRowProps {
  readonly comment: MyComment;
}

const CommentRow: React.FC<CommentRowProps> = ({ comment }) => (
  <li className="border-b border-hairline">
    <Link
      className="block py-space-sm px-1 hover:bg-canvas-soft transition-colors group"
      to={comment.post.itemId ? ROUTES.itemDiscussion(comment.post.itemId) : ROUTES.community}
    >
      <span className="flex items-start gap-1.5">
        {comment.isReply && (
          <span className="font-micro text-micro font-bold px-1.5 py-0.5 rounded bg-mint-100 text-forest shrink-0">{copy.reply}</span>
        )}
        <span className="font-body-sm text-body-sm text-ink line-clamp-2 group-hover:underline">{comment.body}</span>
      </span>
      <span className="mt-1.5 flex items-center gap-1 font-micro text-micro text-muted min-w-0">
        <Icon className="text-[14px] shrink-0" name="subdirectory_arrow_right" />
        <span className="shrink-0">{myPostsCopy.boards[comment.post.board]}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{copy.onPost(comment.post.title)}</span>
      </span>
      <span className="mt-1 flex items-center gap-space-sm font-micro text-micro text-muted">
        <span>{formatTimeAgo(comment.createdAt)}</span>
        <span className="flex items-center gap-0.5">
          <Icon className="text-[14px]" name="thumb_up" />
          {copy.likes(comment.likeCount)}
        </span>
      </span>
    </Link>
  </li>
);

/** 내 댓글 탭 — 댓글·답글, 누르면 원래 글이 있는 곳으로. */
export const MyCommentsPanel: React.FC<MyCommentsPanelProps> = ({ className = '' }) => {
  const list = useMyComments();
  return (
    <div className={className}>
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState
            actionLabel={copy.emptyAction}
            actionTo={ROUTES.community}
            body={copy.emptyBody}
            icon="chat_bubble"
            title={copy.emptyTitle}
          />
        }
      >
        {list.items.map((comment) => (
          <CommentRow comment={comment} key={comment.commentId} />
        ))}
      </MyListShell>
    </div>
  );
};

export default MyCommentsPanel;

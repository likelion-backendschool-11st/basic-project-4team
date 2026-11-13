import React from 'react';
import type { CommentReply } from '../../api/types';
import { commentBadgeLabel, commentCopy, commentMenu } from '../../data/comment';
import { formatTimeAgo } from '../../data/community';
import { AuthorAvatar } from '../community/AuthorAvatar';
import { PostMoreMenu } from '../community/PostMoreMenu';

export interface CommentItemProps {
  readonly comment: CommentReply;
  /** 있으면 "답글" 버튼을 보여준다 (댓글에만, 답글의 답글은 불가). */
  readonly onReply?: () => void;
  /** 내 댓글 ⋮ 메뉴 선택 ('delete'). */
  readonly onMenuSelect: (comment: CommentReply, key: string) => void;
}

/** 댓글·답글 한 줄: 아바타, 닉네임·배지·시간, ⋮ 메뉴(내 댓글 삭제), 본문, 답글 버튼. */
export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onMenuSelect }) => {
  if (comment.isDeleted || !comment.author) {
    return <p className="py-space-xs font-body-sm text-body-sm text-muted italic">{commentCopy.deletedBody}</p>;
  }

  const { author } = comment;
  return (
    <div className="flex items-start gap-space-sm py-space-xs">
      <AuthorAvatar
        author={{ name: author.nickname, initials: author.nickname.slice(0, 1), tone: comment.isMine ? 'primary' : 'neutral' }}
        variant="discussion"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs min-w-0">
            <span className="font-ui-label text-ui-label text-on-surface">{author.nickname}</span>
            {author.badges.map((code) => (
              <span className="font-micro text-micro bg-mint-100 text-forest px-space-xs rounded" key={code}>
                {commentBadgeLabel[code] ?? code}
              </span>
            ))}
            <span className="font-micro text-micro text-muted">
              {formatTimeAgo(comment.createdAt)}
              {comment.updatedAt !== comment.createdAt && ` ${commentCopy.edited}`}
            </span>
          </div>
          {comment.isMine && <PostMoreMenu items={commentMenu.mine} onSelect={(key) => onMenuSelect(comment, key)} />}
        </div>
        <p className="font-body-sm text-body-sm text-body whitespace-pre-line break-words mt-0.5">{comment.body}</p>
        {onReply && (
          <button className="mt-1 font-micro text-micro text-muted hover:text-primary" onClick={onReply} type="button">
            {commentCopy.replyLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;

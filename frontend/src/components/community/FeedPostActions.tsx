import React from 'react';
import { Link } from 'react-router-dom';
import { commentCopy } from '../../data/comment';
import { feedCopy } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

export interface FeedPostActionsProps {
  readonly itemId: string;
  readonly commentLabel: string;
  readonly commentIcon: string;
  /** 있으면 "댓글"이 토론방 이동 링크 대신 아래로 펼치는 버튼이 된다. */
  readonly onCommentToggle?: () => void;
  readonly commentsOpen?: boolean;
}

/** 댓글 / 공유 action pair on feed cards. */
export const FeedPostActions: React.FC<FeedPostActionsProps> = ({
  itemId,
  commentLabel,
  commentIcon,
  onCommentToggle,
  commentsOpen = false,
}) => (
  <div className="flex items-center gap-space-md text-muted">
    {onCommentToggle ? (
      <button
        aria-expanded={commentsOpen}
        className={`flex items-center gap-1 hover:text-on-surface ${commentsOpen ? 'text-primary font-bold' : ''}`}
        onClick={onCommentToggle}
        type="button"
      >
        <Icon className="text-[16px]" name={commentIcon} /> {commentLabel}
        <Icon className="text-[16px]" name={commentsOpen ? commentCopy.collapseIcon : commentCopy.expandIcon} />
      </button>
    ) : (
      <Link className="flex items-center gap-1 hover:text-on-surface" to={ROUTES.itemDiscussion(itemId)}>
        <Icon className="text-[16px]" name={commentIcon} /> {commentLabel}
      </Link>
    )}
    <button className="flex items-center gap-1 hover:text-on-surface" type="button">
      <Icon className="text-[16px]" name="share" /> {feedCopy.shareLabel}
    </button>
  </div>
);

export default FeedPostActions;

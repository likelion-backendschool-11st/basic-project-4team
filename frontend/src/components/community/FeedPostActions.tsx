import React from 'react';
import { Link } from 'react-router-dom';
import { feedCopy } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

export interface FeedPostActionsProps {
  readonly itemId: string;
  readonly commentLabel: string;
  readonly commentIcon: string;
}

/** 댓글 / 공유 action pair on feed cards. */
export const FeedPostActions: React.FC<FeedPostActionsProps> = ({ itemId, commentLabel, commentIcon }) => (
  <div className="flex items-center gap-space-md text-muted">
    <Link className="flex items-center gap-1 hover:text-on-surface" to={ROUTES.itemDiscussion(itemId)}>
      <Icon className="text-[16px]" name={commentIcon} /> {commentLabel}
    </Link>
    <button className="flex items-center gap-1 hover:text-on-surface" type="button">
      <Icon className="text-[16px]" name="share" /> {feedCopy.shareLabel}
    </button>
  </div>
);

export default FeedPostActions;

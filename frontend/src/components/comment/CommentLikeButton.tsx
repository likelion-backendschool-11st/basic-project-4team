import React from 'react';
import { commentLikeCopy } from '../../data/comment';
import { Icon } from '../common/Icon';

export interface CommentLikeButtonProps {
  readonly likeCount: number;
  readonly isLiked: boolean;
  readonly onToggle: () => void;
}

/** 댓글 좋아요 (♡ / ♥ + 개수). 누른 상태면 다시 눌러 취소. */
export const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({ likeCount, isLiked, onToggle }) => (
  <button
    aria-label={commentLikeCopy.ariaLabel(likeCount, isLiked)}
    aria-pressed={isLiked}
    className={`flex items-center gap-0.5 font-micro text-micro transition-colors ${
      isLiked ? 'text-error font-bold' : 'text-muted hover:text-error'
    }`}
    onClick={onToggle}
    type="button"
  >
    <Icon className="text-[14px]" filled={isLiked} name={commentLikeCopy.icon} />
    <span>{likeCount > 0 ? likeCount : commentLikeCopy.label}</span>
  </button>
);

export default CommentLikeButton;

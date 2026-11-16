import React, { useCallback } from 'react';
import type { ReactionSeed } from '../../data/community';
import { useReactions } from '../../hooks/community/useReactions';
import { ReactionButton } from './ReactionButton';

export interface ReactionBarProps {
  readonly seeds: readonly ReactionSeed[];
  /** 리액션을 저장할 토론글 id. */
  readonly postId: number;
  /** 로그인 사용자가 이미 남긴 이모지 key. */
  readonly selected?: string | null;
  readonly variant?: 'pill' | 'chip';
  /** 누르기 전에 호출. false를 돌려주면 토글하지 않는다 (예: 비로그인 막기). */
  readonly canToggle?: () => boolean;
}

/** 이모지 리액션 줄 — 서버(post_reactions)에 저장된다. 글당 1인 1개. */
export const ReactionBar: React.FC<ReactionBarProps> = ({ seeds, postId, selected = null, variant = 'pill', canToggle }) => {
  const { reactions, toggle } = useReactions(seeds, postId, selected);
  const handleToggle = useCallback(
    (key: string) => {
      if (canToggle && !canToggle()) return;
      toggle(key);
    },
    [canToggle, toggle],
  );
  return (
    <div className={`flex items-center gap-space-xs ${variant === 'chip' ? 'flex-wrap' : ''}`}>
      {reactions.map((r) => (
        <ReactionButton key={r.key} onToggle={handleToggle} reaction={r} variant={variant} />
      ))}
    </div>
  );
};

export default ReactionBar;

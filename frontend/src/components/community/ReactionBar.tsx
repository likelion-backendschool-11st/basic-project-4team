import React, { useCallback } from 'react';
import type { ReactionSeed } from '../../data/community';
import { useReactions } from '../../hooks/community/useReactions';
import { ReactionButton } from './ReactionButton';

export interface ReactionBarProps {
  readonly seeds: readonly ReactionSeed[];
  readonly variant?: 'pill' | 'chip';
  /** 누르기 전에 호출. false를 돌려주면 토글하지 않는다 (예: 비로그인 막기). */
  readonly canToggle?: () => boolean;
}

/** Row of toggleable emoji reactions. */
export const ReactionBar: React.FC<ReactionBarProps> = ({ seeds, variant = 'pill', canToggle }) => {
  const { reactions, toggle } = useReactions(seeds);
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

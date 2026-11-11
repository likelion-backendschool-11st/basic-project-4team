import React from 'react';
import type { ReactionSeed } from '../../data/community';
import { useReactions } from '../../hooks/community/useReactions';
import { ReactionButton } from './ReactionButton';

export interface ReactionBarProps {
  readonly seeds: readonly ReactionSeed[];
  readonly variant?: 'pill' | 'chip';
}

/** Row of toggleable emoji reactions. */
export const ReactionBar: React.FC<ReactionBarProps> = ({ seeds, variant = 'pill' }) => {
  const { reactions, toggle } = useReactions(seeds);
  return (
    <div className={`flex items-center gap-space-xs ${variant === 'chip' ? 'flex-wrap' : ''}`}>
      {reactions.map((r) => (
        <ReactionButton key={r.key} onToggle={toggle} reaction={r} variant={variant} />
      ))}
    </div>
  );
};

export default ReactionBar;

import React from 'react';
import type { ReactionState } from '../../hooks/community/useReactions';
import { reactionToneClass } from './tones';

export interface ReactionButtonProps {
  readonly reaction: ReactionState;
  readonly onToggle: (key: string) => void;
  /** `pill` = feed rounded pills, `chip` = discussion shadowed chips. */
  readonly variant?: 'pill' | 'chip';
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ reaction, onToggle, variant = 'pill' }) => {
  const activeClass = reaction.active ? 'bg-mint-100 font-bold' : '';
  const className =
    variant === 'pill'
      ? `flex items-center gap-1 px-space-sm py-space-xxs rounded-full text-on-surface hover:bg-mint-100 transition-colors ${
          reaction.active ? activeClass : 'bg-surface-container'
        }`
      : `flex items-center gap-1 px-space-xs py-1 rounded font-ui-sm text-ui-sm shadow-sm transition-all ${
          reactionToneClass[reaction.tone ?? 'neutral']
        } ${reaction.active ? activeClass : 'bg-surface-container-lowest'}`;

  return (
    <button aria-pressed={reaction.active} className={className} onClick={() => onToggle(reaction.key)} type="button">
      <span>{reaction.emoji}</span>
      <span>{reaction.count}</span>
    </button>
  );
};

export default ReactionButton;

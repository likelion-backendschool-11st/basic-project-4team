import React from 'react';
import { feedCopy } from '../../data/community';
import type { PollOptionState } from '../../hooks/community/usePollVote';
import { Icon } from '../common/Icon';

export interface PollOptionButtonProps {
  readonly option: PollOptionState;
  readonly onVote: (optionId: number) => void;
  /** 투표했거나 마감되면 true → 누를 수 없다. */
  readonly disabled?: boolean;
  /** true면 비율 막대·득표를 보여준다 (투표 후·마감 후). */
  readonly showResult?: boolean;
}

/** One poll option with a proportional fill bar; leading option is highlighted in mint. */
export const PollOptionButton: React.FC<PollOptionButtonProps> = ({ option, onVote, disabled = false, showResult = true }) => {
  const lead = showResult && option.leading;
  const percent = showResult ? option.percent : 0;
  return (
    <button
      aria-pressed={option.selected}
      className={`w-full text-left p-space-sm rounded-lg transition-colors relative overflow-hidden flex items-center justify-between gap-space-sm ${
        lead ? 'bg-mint-50 hover:bg-mint-100' : 'bg-surface-container-low hover:bg-surface-container'
      } ${option.selected ? 'ring-1 ring-primary' : ''} disabled:cursor-default`}
      disabled={disabled}
      onClick={() => onVote(option.id)}
      type="button"
    >
      <div
        className={`absolute inset-y-0 left-0 transition-all duration-500 ${lead ? 'bg-mint-200/50' : 'bg-surface-container-highest/60'}`}
        style={{ width: `${percent}%` }}
      />
      <div className="relative z-10 flex items-center gap-space-sm min-w-0">
        <span
          className={`w-6 h-6 rounded-full text-on-primary flex items-center justify-center font-bold text-caption shrink-0 ${
            lead ? 'bg-primary' : 'bg-muted'
          }`}
        >
          {option.selected ? <Icon className="text-[14px]" name="check" /> : option.key}
        </span>
        <span className="font-ui-label text-ui-label text-on-surface font-bold">{option.label}</span>
      </div>
      {showResult && (
        <div className="relative z-10 text-right shrink-0">
          <span className={`font-stat-value text-stat-value font-bold ${lead ? 'text-primary' : 'text-body'}`}>{option.percent}%</span>
          <span className="block font-caption text-caption text-muted">{feedCopy.pollVotes(option.votes)}</span>
        </div>
      )}
    </button>
  );
};

export default PollOptionButton;

import React from 'react';
import { sentimentCopy } from '../../data/community';
import { useSentimentVote } from '../../hooks/community/useSentimentVote';
import { Icon } from '../common/Icon';

export interface SentimentPollProps {
  /** 품목 id 또는 slug. */
  readonly itemId: string;
  /** 비로그인이면 false를 돌려주고 로그인 안내를 띄운다. */
  readonly ensureLogin: () => boolean;
}

/** 오른다/내린다 dual-color sentiment gauge with vote buttons. */
export const SentimentPoll: React.FC<SentimentPollProps> = ({ itemId, ensureLogin }) => {
  const { up, down, upPct, downPct, choice, voted, voting, message, vote } = useSentimentVote(itemId, ensureLogin);

  return (
    /* data-component="MarketSentimentPoll" */
    <div className="mt-space-sm pt-space-sm bg-surface-container-low rounded-lg p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-xs font-ui-label text-ui-label mb-space-xs">
        <div className="flex items-center gap-1 text-tertiary">
          <Icon className="text-[18px]" filled name={sentimentCopy.upIcon} />
          <span>
            {sentimentCopy.upLabel} <strong className="font-stat-value text-ui-label text-tertiary">{upPct}%</strong>
          </span>
          <span className="font-caption text-caption text-muted font-normal">{sentimentCopy.votes(up)}</span>
        </div>
        <div className="flex items-center gap-1 text-info">
          <span className="font-caption text-caption text-muted font-normal">{sentimentCopy.votes(down)}</span>
          <span>
            <strong className="font-stat-value text-ui-label text-info">{downPct}%</strong> {sentimentCopy.downLabel}
          </span>
          <Icon className="text-[18px]" name={sentimentCopy.downIcon} />
        </div>
      </div>
      {/* Dual-color Gauge Track */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-container-highest">
        <div className="h-full bg-tertiary transition-all duration-500 ease-out" style={{ width: `${upPct}%` }} />
        <div className="h-full bg-info transition-all duration-500 ease-out" style={{ width: `${downPct}%` }} />
      </div>
      {/* Action Buttons for Voting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm mt-space-sm pt-space-xs">
        <span className="font-caption text-caption text-muted flex items-center gap-1">
          <Icon className="text-[14px]" name="info" />
          {message ?? sentimentCopy.notice}
        </span>
        <div className="flex items-center gap-space-xs w-full sm:w-auto">
          <button
            aria-pressed={choice === 'up'}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-space-md py-space-xs rounded-lg font-ui-sm text-ui-sm shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              choice === 'up' ? 'bg-tertiary text-on-primary' : 'bg-surface-container-lowest text-tertiary hover:bg-tertiary-fixed'
            }`}
            disabled={voted || voting}
            onClick={() => vote('up')}
            type="button"
          >
            <Icon className="text-[16px]" name="thumb_up" />
            {sentimentCopy.upButton}
          </button>
          <button
            aria-pressed={choice === 'down'}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-space-md py-space-xs rounded-lg font-ui-sm text-ui-sm shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              choice === 'down' ? 'bg-info text-on-primary' : 'bg-surface-container-lowest text-info hover:bg-surface-container-high'
            }`}
            disabled={voted || voting}
            onClick={() => vote('down')}
            type="button"
          >
            <Icon className="text-[16px]" name="thumb_down" />
            {sentimentCopy.downButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentimentPoll;

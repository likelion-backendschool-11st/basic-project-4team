import React from 'react';
import { feedCopy, type FeedPoll as FeedPollData } from '../../data/community';
import { usePollVote } from '../../hooks/community/usePollVote';
import { PollOptionButton } from './PollOptionButton';

export interface FeedPollProps {
  readonly poll: FeedPollData;
  /** Right-side actions (댓글 / 공유) rendered in the summary row. */
  readonly actions: React.ReactNode;
}

/** Interactive voting block + participation summary row. */
export const FeedPoll: React.FC<FeedPollProps> = ({ poll, actions }) => {
  const { options, total, vote } = usePollVote(poll.options);
  return (
    <>
      {/* Interactive Voting Component */}
      <div className="space-y-space-xs mb-space-md">
        {options.map((o) => (
          <PollOptionButton key={o.key} onVote={vote} option={o} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-space-xs font-caption text-caption text-muted pt-space-xs">
        <span>{feedCopy.pollSummary(total, poll.deadlineLabel)}</span>
        {actions}
      </div>
    </>
  );
};

export default FeedPoll;

import React from 'react';
import { feedCopy, type FeedPoll as FeedPollData } from '../../data/community';
import { usePollVote } from '../../hooks/community/usePollVote';
import { PollOptionButton } from './PollOptionButton';

export interface FeedPollProps {
  readonly poll: FeedPollData;
  /** 투표 전에 호출. false면 막는다 (비로그인). */
  readonly ensureLogin?: () => boolean;
}

/** 투표 선택지 + 참여 요약. 투표는 서버에 저장되고 1인 1표·변경 불가. */
export const FeedPoll: React.FC<FeedPollProps> = ({ poll, ensureLogin }) => {
  const { options, total, locked, pending, message, vote } = usePollVote(poll, ensureLogin);
  return (
    <div>
      {/* Interactive Voting Component */}
      <div className="space-y-space-xs mb-space-md">
        {options.map((o) => (
          <PollOptionButton disabled={locked || pending} key={o.id} onVote={vote} option={o} showResult={locked} />
        ))}
      </div>
      {message && (
        <p className="-mt-space-xs mb-space-sm font-caption text-caption text-error" role="status">
          {message}
        </p>
      )}
      <p className="-mt-space-xs mb-space-sm font-caption text-caption text-muted">{feedCopy.pollSummary(total, poll.deadlineLabel)}</p>
    </div>
  );
};

export default FeedPoll;

import { useCallback, useMemo, useState } from 'react';
import { ApiError } from '../../api/client';
import { votePostPoll } from '../../api/community';
import { feedCopy, type FeedPoll, type PollOptionSeed } from '../../data/community';

export interface PollOptionState extends PollOptionSeed {
  readonly percent: number;
  readonly selected: boolean;
  readonly leading: boolean;
}

/**
 * 토론글 투표 — post_poll_votes에 저장, 글당 1인 1표·변경 불가.
 * ensureLogin()이 false면(비로그인) 요청하지 않는다. 투표했거나 마감되면 더 누를 수 없다.
 */
export const usePollVote = (poll: FeedPoll, ensureLogin?: () => boolean) => {
  const [votes, setVotes] = useState<Readonly<Record<number, number>>>(() =>
    Object.fromEntries(poll.options.map((o) => [o.id, o.votes])),
  );
  const [myOptionId, setMyOptionId] = useState<number | null>(poll.myOptionId);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const options = useMemo<readonly PollOptionState[]>(() => {
    const counted = poll.options.map((o) => ({ ...o, votes: votes[o.id] ?? 0 }));
    const total = counted.reduce((sum, o) => sum + o.votes, 0);
    const max = Math.max(...counted.map((o) => o.votes));
    return counted.map((o) => ({
      ...o,
      percent: total === 0 ? 0 : Math.round((o.votes / total) * 100),
      selected: o.id === myOptionId,
      leading: total > 0 && o.votes === max,
    }));
  }, [poll.options, votes, myOptionId]);

  const total = useMemo(() => options.reduce((sum, o) => sum + o.votes, 0), [options]);
  const locked = poll.closed || myOptionId !== null;

  const vote = useCallback(
    async (optionId: number) => {
      if (pending || locked) return;
      if (ensureLogin && !ensureLogin()) return;
      setPending(true);
      try {
        const result = await votePostPoll(poll.postId, optionId);
        setVotes(Object.fromEntries(result.options.map((o) => [o.id, o.votes])));
        setMyOptionId(result.myOptionId);
        setMessage(null);
      } catch (e) {
        setMessage(e instanceof ApiError && e.code === 'ALREADY_VOTED' ? feedCopy.pollAlreadyVoted : feedCopy.pollVoteError);
      } finally {
        setPending(false);
      }
    },
    [pending, locked, ensureLogin, poll.postId],
  );

  return { options, total, myOptionId, locked, pending, message, vote };
};

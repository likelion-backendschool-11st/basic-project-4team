import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { castCommunityVote, getCommunityVote } from '../../api/communityVote';
import type { CommunityVote, VoteDirection } from '../../api/types';
import { sentimentCopy } from '../../data/community';
import { useAuth } from '../auth/useAuth';

export type SentimentSide = VoteDirection;

/**
 * 오른다/내린다 시세 전망 투표 — 품목당 하루(KST) 1회, 투표 후 변경 불가.
 * ensureLogin이 false를 돌려주면(비로그인) 투표하지 않는다.
 */
export const useSentimentVote = (itemId: string, ensureLogin: () => boolean) => {
  const { status } = useAuth();
  const [data, setData] = useState<CommunityVote | null>(null);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 로그인 상태가 바뀌면 myVote·canVote가 달라지므로 다시 불러온다.
  useEffect(() => {
    if (status === 'loading') return undefined;
    let cancelled = false;
    getCommunityVote(itemId)
      .then((vote) => {
        if (!cancelled) setData(vote);
      })
      .catch(() => {
        if (!cancelled) setMessage(sentimentCopy.loadError);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, status]);

  const vote = useCallback(
    async (side: SentimentSide) => {
      if (voting || !ensureLogin()) return;
      if (data?.myVote) {
        setMessage(sentimentCopy.alreadyVoted);
        return;
      }
      setVoting(true);
      try {
        setData(await castCommunityVote(itemId, side));
        setMessage(null);
      } catch (e) {
        if (e instanceof ApiError && e.code === 'ALREADY_VOTED') {
          setMessage(sentimentCopy.alreadyVoted);
          setData(await getCommunityVote(itemId).catch(() => data));
        } else {
          setMessage(sentimentCopy.voteError);
        }
      } finally {
        setVoting(false);
      }
    },
    [voting, ensureLogin, data, itemId],
  );

  return {
    up: data?.up ?? 0,
    down: data?.down ?? 0,
    upPct: data?.upRate ?? 50,
    downPct: data?.downRate ?? 50,
    choice: data?.myVote ?? null,
    voted: Boolean(data?.myVote),
    voting,
    message,
    vote,
  };
};

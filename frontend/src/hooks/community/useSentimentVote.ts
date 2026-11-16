import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../api/client';
import { getSentiment, voteSentiment } from '../../api/itemcommunity';
import type { Sentiment, SentimentDirection } from '../../api/types';
import { sentimentCopy } from '../../data/community';
import { useAuth } from '../auth/useAuth';

export type SentimentSide = SentimentDirection;

const EMPTY: Sentiment = { up: 0, down: 0, myVote: null };

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.status !== 0 && error.status < 500 ? error.message : fallback;

/**
 * 오른다/내린다 시세 전망 투표 — 현황·투표 모두 서버(item_votes)에 저장된다.
 * 품목당 하루(KST) 1회이며, 투표 후에는 오늘 다시 투표할 수 없다.
 * ensureLogin()이 false면(비로그인) 투표 요청을 보내지 않는다.
 */
export const useSentimentVote = (itemId: string, ensureLogin: () => boolean) => {
  const { status: authStatus } = useAuth();
  const [sentiment, setSentiment] = useState<Sentiment>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 상태가 바뀌면 myVote가 달라지므로 다시 불러온다.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSentiment(itemId)
      .then((data) => {
        if (!cancelled) setSentiment(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e, sentimentCopy.loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, authStatus]);

  const vote = useCallback(
    async (side: SentimentSide) => {
      if (submitting || sentiment.myVote) return;
      if (!ensureLogin()) return;
      setSubmitting(true);
      setError(null);
      try {
        setSentiment(await voteSentiment(itemId, side));
      } catch (e) {
        setError(errorMessage(e, sentimentCopy.voteError));
        // 다른 탭에서 이미 투표한 경우(409) 등 — 서버 현황으로 맞춘다.
        if (e instanceof ApiError && e.status === 409) {
          getSentiment(itemId).then(setSentiment).catch(() => undefined);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [itemId, ensureLogin, submitting, sentiment.myVote],
  );

  const ratio = useMemo(() => {
    const total = sentiment.up + sentiment.down;
    const upPct = total === 0 ? 50 : Math.round((sentiment.up / total) * 100);
    return { upPct, downPct: 100 - upPct };
  }, [sentiment.up, sentiment.down]);

  return {
    up: sentiment.up,
    down: sentiment.down,
    ...ratio,
    choice: sentiment.myVote,
    voted: sentiment.myVote !== null,
    loading,
    submitting,
    error,
    vote,
  };
};

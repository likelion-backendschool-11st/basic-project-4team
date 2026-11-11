import { useCallback, useMemo, useState } from 'react';

export type SentimentSide = 'up' | 'down';

/** 오른다/내린다 market sentiment gauge — one vote per user, switchable. */
export const useSentimentVote = (seed: { readonly up: number; readonly down: number }) => {
  const [choice, setChoice] = useState<SentimentSide | null>(null);

  const state = useMemo(() => {
    const up = seed.up + (choice === 'up' ? 1 : 0);
    const down = seed.down + (choice === 'down' ? 1 : 0);
    const total = up + down;
    const upPct = total === 0 ? 50 : Math.round((up / total) * 100);
    return { up, down, upPct, downPct: 100 - upPct };
  }, [seed.up, seed.down, choice]);

  const vote = useCallback((side: SentimentSide) => setChoice(side), []);

  return { ...state, choice, vote };
};

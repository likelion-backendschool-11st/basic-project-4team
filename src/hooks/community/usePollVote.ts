import { useCallback, useMemo, useState } from 'react';
import type { PollOptionSeed } from '../../data/community';

export interface PollOptionState extends PollOptionSeed {
  readonly percent: number;
  readonly selected: boolean;
  readonly leading: boolean;
}

/** Single-choice poll: selecting an option moves the user's vote and recomputes percentages. */
export const usePollVote = (seeds: readonly PollOptionSeed[]) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const options = useMemo<readonly PollOptionState[]>(() => {
    const counted = seeds.map((o) => ({ ...o, votes: o.votes + (o.key === selectedKey ? 1 : 0) }));
    const total = counted.reduce((sum, o) => sum + o.votes, 0);
    const max = Math.max(...counted.map((o) => o.votes));
    return counted.map((o) => ({
      ...o,
      percent: total === 0 ? 0 : Math.round((o.votes / total) * 100),
      selected: o.key === selectedKey,
      leading: o.votes === max,
    }));
  }, [seeds, selectedKey]);

  const total = useMemo(() => options.reduce((sum, o) => sum + o.votes, 0), [options]);

  const vote = useCallback((key: string) => {
    setSelectedKey((prev) => (prev === key ? null : key));
  }, []);

  return { options, total, selectedKey, vote };
};

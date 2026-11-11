import { useCallback, useState } from 'react';
import type { ReactionSeed } from '../../data/community';

export interface ReactionState extends ReactionSeed {
  readonly active: boolean;
}

/** Toggleable emoji reactions with live counts (one toggle per reaction key). */
export const useReactions = (seeds: readonly ReactionSeed[] = []) => {
  const [reactions, setReactions] = useState<readonly ReactionState[]>(() =>
    seeds.map((seed) => ({ ...seed, active: false })),
  );

  const toggle = useCallback((key: string) => {
    setReactions((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, active: !r.active, count: r.count + (r.active ? -1 : 1) } : r,
      ),
    );
  }, []);

  return { reactions, toggle };
};

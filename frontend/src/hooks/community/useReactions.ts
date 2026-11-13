import { useCallback, useMemo, useState } from 'react';
import type { ReactionSeed } from '../../data/community';

export interface ReactionState extends ReactionSeed {
  readonly active: boolean;
}

/**
 * Emoji reactions — 글 하나당 1인 1개 (REQ-BOARD-008).
 * 다른 이모지를 누르면 그쪽으로 옮겨가고, 같은 이모지를 다시 누르면 취소된다.
 */
export const useReactions = (seeds: readonly ReactionSeed[] = []) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const reactions = useMemo<readonly ReactionState[]>(
    () =>
      seeds.map((seed) => {
        const active = seed.key === selectedKey;
        return { ...seed, active, count: seed.count + (active ? 1 : 0) };
      }),
    [seeds, selectedKey],
  );

  const toggle = useCallback((key: string) => {
    setSelectedKey((prev) => (prev === key ? null : key));
  }, []);

  return { reactions, selectedKey, toggle };
};

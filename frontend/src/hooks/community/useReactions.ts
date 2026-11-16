import { useCallback, useMemo, useState } from 'react';
import { removePostReaction, setPostReaction } from '../../api/community';
import type { ReactionCounts, ReactionType } from '../../api/types';
import type { ReactionSeed } from '../../data/community';

export interface ReactionState extends ReactionSeed {
  readonly active: boolean;
}

/**
 * 토론글 이모지 리액션 — 글당 1인 1개 (REQ-BOARD-008), post_reactions에 저장.
 * 다른 이모지를 누르면 그쪽으로 옮겨가고, 같은 이모지를 다시 누르면 취소된다.
 * 개수·내 선택은 서버 응답으로 갱신한다.
 */
export const useReactions = (seeds: readonly ReactionSeed[], postId: number, initialSelected: string | null = null) => {
  const [counts, setCounts] = useState<Readonly<Record<string, number>>>(() =>
    Object.fromEntries(seeds.map((s) => [s.key, s.count])),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(initialSelected);
  const [pending, setPending] = useState(false);

  const reactions = useMemo<readonly ReactionState[]>(
    () => seeds.map((seed) => ({ ...seed, count: counts[seed.key] ?? 0, active: seed.key === selectedKey })),
    [seeds, counts, selectedKey],
  );

  const toggle = useCallback(
    async (key: string) => {
      if (pending) return;
      setPending(true);
      try {
        const result =
          key === selectedKey ? await removePostReaction(postId) : await setPostReaction(postId, key as ReactionType);
        setCounts(result.reactions as ReactionCounts);
        setSelectedKey(result.myReaction);
      } catch {
        // 실패하면 화면 값을 그대로 둔다 (서버 값이 기준).
      } finally {
        setPending(false);
      }
    },
    [pending, selectedKey, postId],
  );

  return { reactions, selectedKey, toggle, pending };
};

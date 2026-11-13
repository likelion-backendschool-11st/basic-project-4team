import { apiRequest } from './client';
import type { CommunityVote, VoteDirection } from './types';

/** 투표 집계 + 오늘 내 투표 (VOTE-01). itemId는 숫자 id 또는 slug. */
export const getCommunityVote = async (itemId: string): Promise<CommunityVote> => {
  const { vote } = await apiRequest<{ readonly vote: CommunityVote }>(
    `/communityVote/${encodeURIComponent(itemId)}`,
  );
  return vote;
};

/** 오른다/내린다 투표 (VOTE-02). 로그인 필요, 품목당 하루 1회 — 이미 투표했으면 ApiError(409). */
export const castCommunityVote = async (itemId: string, direction: VoteDirection): Promise<CommunityVote> => {
  const { vote } = await apiRequest<{ readonly vote: CommunityVote }>(
    `/communityVote/${encodeURIComponent(itemId)}`,
    { method: 'POST', body: JSON.stringify({ direction }) },
  );
  return vote;
};

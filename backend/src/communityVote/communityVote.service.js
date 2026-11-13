const communityVoteRepository = require('./communityVote.repository');
const itemCommunityRepository = require('../itemcommunity/itemcommunity.repository');
const HttpError = require('../utils/HttpError');

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 지금 시각의 KST 날짜 'YYYY-MM-DD'. DB 세션 시간대에 기대지 않고 서버에서 계산한다. */
function todayKst(now = new Date()) {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 품목 숫자 id. 없거나 숨김 품목이면 404. */
async function resolveItemId(idOrSlug) {
  const item = await itemCommunityRepository.findByIdOrSlug(idOrSlug);
  if (!item) throw new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');
  return item.id;
}

/** 집계 + 오늘 내 투표 → Vote 객체. total이 0이면 비율은 50/50. */
async function buildVote(itemId, viewerId, voteDate) {
  const [{ up, down }, myVote] = await Promise.all([
    communityVoteRepository.countByDirection(itemId),
    viewerId === undefined ? null : communityVoteRepository.findDirection(viewerId, itemId, voteDate),
  ]);
  const total = up + down;
  const upRate = total === 0 ? 50 : Math.round((up / total) * 100);
  return {
    itemId,
    up,
    down,
    total,
    upRate,
    downRate: 100 - upRate,
    myVote,
    canVote: viewerId !== undefined && myVote === null,
  };
}

async function getVoteSummary(idOrSlug, viewerId) {
  const itemId = await resolveItemId(idOrSlug);
  return buildVote(itemId, viewerId, todayKst());
}

/** 품목당 하루(KST) 1회. 같은 날 재투표·방향 변경은 409. */
async function castVote(idOrSlug, userId, direction) {
  const itemId = await resolveItemId(idOrSlug);
  const voteDate = todayKst();
  try {
    await communityVoteRepository.insert({ userId, itemId, voteDate, direction });
  } catch (err) {
    // PK(user_id, item_id, vote_date) 중복 — 동시에 두 번 눌러도 DB가 1건만 남긴다.
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'ALREADY_VOTED', '오늘은 이미 투표했습니다. 내일 다시 투표할 수 있습니다.');
    }
    throw err;
  }
  return buildVote(itemId, userId, voteDate);
}

module.exports = { getVoteSummary, castVote, todayKst };

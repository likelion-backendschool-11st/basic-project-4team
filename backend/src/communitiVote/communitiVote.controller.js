const communitiVoteService = require('./communitiVote.service');
const HttpError = require('../utils/HttpError');

const DIRECTIONS = ['up', 'down'];
const SLUG_PATTERN = /^[a-z0-9-]{1,150}$/;

/** 경로의 itemId — 양의 정수면 id, 아니면 slug. 둘 다 아니면 존재할 수 없는 품목이므로 404. */
function parseItemId(req) {
  const { itemId } = req.params;
  if (/^[1-9]\d*$/.test(itemId)) return Number(itemId);
  if (SLUG_PATTERN.test(itemId)) return itemId;
  throw new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');
}

/** 방향은 소문자 up/down만 허용한다 (대문자 UP도 400). */
function parseDirection(value) {
  if (typeof value !== 'string' || !DIRECTIONS.includes(value)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `투표 방향(direction) 값이 올바르지 않습니다. (${DIRECTIONS.join(', ')})`);
  }
  return value;
}

/** GET /api/communityVote/:itemId — 투표 집계 + 오늘 내 투표 (VOTE-01). */
async function summary(req, res) {
  const vote = await communitiVoteService.getVoteSummary(parseItemId(req), req.user?.id);
  res.json({ data: { vote } });
}

/** POST /api/communityVote/:itemId — 오른다/내린다 투표 (VOTE-02). */
async function vote(req, res) {
  const itemId = parseItemId(req);
  const direction = parseDirection(req.body?.direction);
  const result = await communitiVoteService.castVote(itemId, req.user.id, direction);
  res.status(201).json({ data: { vote: result } });
}

module.exports = { summary, vote };

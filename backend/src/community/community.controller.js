const communityService = require('./community.service');
const HttpError = require('../utils/HttpError');

const BOARDS = ['pokemon', 'sneakers', 'onepiece', 'watch', 'free'];
const TAGS = ['analysis', 'verify', 'unboxing', 'poll', 'qna', 'info'];
const SORTS = ['latest', 'popular'];
const REACTION_TYPES = ['fire', 'surprised', 'laugh', 'ice'];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const TITLE_MAX = 100;
const BODY_MAX = 500;
const ITEM_ID_MAX = 100;
const MAX_IMAGES = 4;
const POLL_OPTIONS = { min: 2, max: 4 };
const POLL_LABEL_MAX = 40;
const POLL_DURATIONS = [1, 3, 7];
const DEFAULT_POLL_DURATION = 3;
const PRICE_MAX = 1000000000;

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 양의 정수 문자열·숫자만 허용. 그 외는 NaN. */
function toPositiveInt(value) {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0 ? value : NaN;
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : NaN;
}

function parsePostId(req) {
  const id = toPositiveInt(req.params.id);
  // 숫자가 아닌 ID는 존재할 수 없는 글이므로 400 대신 404로 응답한다.
  if (Number.isNaN(id)) {
    throw new HttpError(404, 'POST_NOT_FOUND', '토론글을 찾을 수 없습니다.');
  }
  return id;
}

/** 목록에서 고르는 값. 비어 있으면 null. */
function parseEnum(value, allowed, label) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw badRequest(`${label} 값이 올바르지 않습니다. (${allowed.join(', ')})`);
  }
  return value;
}

/** 선택 문자열. 앞뒤 공백 제거 후 비어 있으면 null. */
function parseOptionalText(value, max, label) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw badRequest(`${label}은(는) 문자열이어야 합니다.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw badRequest(`${label}은(는) ${max}자 이하여야 합니다.`);
  return trimmed || null;
}

function parseBody(value) {
  const body = typeof value === 'string' ? value.trim() : '';
  if (body.length === 0 || body.length > BODY_MAX) {
    throw badRequest(`본문은 1~${BODY_MAX}자여야 합니다.`);
  }
  return body;
}

/** 희망 체결가 (선택): 1원 ~ 10억 정수. null이면 없음(수정 시 삭제). */
function parsePriceTag(value) {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value) || value < 1 || value > PRICE_MAX) {
    throw badRequest('희망 체결가(priceTag)는 1원 ~ 10억 원 사이의 정수여야 합니다.');
  }
  return value;
}

const FIELD_PARSERS = {
  board: (v) => {
    const board = parseEnum(v, BOARDS, '게시판(board)');
    if (!board) throw badRequest('게시판(board)을 선택해 주세요.');
    return board;
  },
  tag: (v) => parseEnum(v, TAGS, '태그(tag)'),
  itemId: (v) => parseOptionalText(v, ITEM_ID_MAX, '품목 ID(itemId)'),
  title: (v) => parseOptionalText(v, TITLE_MAX, '제목'),
  body: parseBody,
  priceTag: parsePriceTag,
};

/** 사진 id 목록 (선택, 최대 4장, 중복 불가). 순서가 곧 표시 순서. */
function parseImageIds(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_IMAGES) {
    throw badRequest(`사진(imageIds)은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
  }
  const ids = value.map(toPositiveInt);
  if (ids.some(Number.isNaN)) throw badRequest('사진(imageIds) 값이 올바르지 않습니다.');
  if (new Set(ids).size !== ids.length) throw badRequest('같은 사진을 두 번 첨부할 수 없습니다.');
  return ids;
}

/** 투표 (선택): { options: string[] 2~4개, durationDays: 1 | 3 | 7 }. */
function parsePoll(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || !Array.isArray(value.options)) {
    throw badRequest('투표(poll)는 { options, durationDays } 형식이어야 합니다.');
  }
  const options = value.options.map((o) => (typeof o === 'string' ? o.trim() : ''));
  if (options.length < POLL_OPTIONS.min || options.length > POLL_OPTIONS.max) {
    throw badRequest(`투표 선택지는 ${POLL_OPTIONS.min}~${POLL_OPTIONS.max}개여야 합니다.`);
  }
  if (options.some((o) => o.length === 0 || o.length > POLL_LABEL_MAX)) {
    throw badRequest(`투표 선택지는 1~${POLL_LABEL_MAX}자여야 합니다.`);
  }
  if (new Set(options).size !== options.length) throw badRequest('투표 선택지가 중복되었습니다.');
  const durationDays = value.durationDays ?? DEFAULT_POLL_DURATION;
  if (!POLL_DURATIONS.includes(durationDays)) {
    throw badRequest(`투표 기간(durationDays)은 ${POLL_DURATIONS.join(', ')}일 중 하나여야 합니다.`);
  }
  return { options, durationDays };
}

async function list(req, res) {
  const { board, itemId, tag, ownerOnly, sort, page, size } = req.query;
  if (ownerOnly !== undefined && ownerOnly !== 'true' && ownerOnly !== 'false') {
    throw badRequest('ownerOnly는 true 또는 false여야 합니다.');
  }
  const parsedPage = page === undefined ? 1 : toPositiveInt(page);
  const parsedSize = size === undefined ? DEFAULT_PAGE_SIZE : toPositiveInt(size);
  if (Number.isNaN(parsedPage)) throw badRequest('page는 1 이상의 정수여야 합니다.');
  if (Number.isNaN(parsedSize) || parsedSize > MAX_PAGE_SIZE) {
    throw badRequest(`size는 1~${MAX_PAGE_SIZE} 사이의 정수여야 합니다.`);
  }

  const result = await communityService.listPosts(
    {
      board: parseEnum(board, BOARDS, '게시판(board)'),
      itemId: parseOptionalText(itemId, ITEM_ID_MAX, '품목 ID(itemId)'),
      tag: parseEnum(tag, TAGS, '태그(tag)'),
      ownerOnly: ownerOnly === 'true',
      sort: parseEnum(sort, SORTS, '정렬(sort)') ?? 'latest',
      page: parsedPage,
      size: parsedSize,
    },
    req.user?.id,
  );
  res.json({ data: result });
}

async function detail(req, res) {
  const post = await communityService.getPost(parsePostId(req), req.user?.id);
  res.json({ data: { post } });
}

async function create(req, res) {
  const input = req.body ?? {};
  const fields = Object.fromEntries(
    Object.entries(FIELD_PARSERS).map(([key, parse]) => [key, parse(input[key])]),
  );
  fields.imageIds = parseImageIds(input.imageIds);
  fields.poll = parsePoll(input.poll);
  const post = await communityService.createPost(req.user.id, fields);
  res.status(201).json({ data: { post } });
}

// 품목은 진입한 토론방으로 고정되어 수정할 수 없다 (REQ-BEDIT-001).
const UPDATABLE_FIELDS = ['board', 'tag', 'title', 'body', 'priceTag'];

async function update(req, res) {
  const postId = parsePostId(req);
  const input = req.body ?? {};
  if (input.itemId !== undefined) {
    throw badRequest('품목(itemId)은 수정할 수 없습니다.');
  }
  // 요청에 들어온 필드만 검증·수정한다 (부분 수정).
  const fields = Object.fromEntries(
    UPDATABLE_FIELDS
      .filter((key) => input[key] !== undefined)
      .map((key) => [key, FIELD_PARSERS[key](input[key])]),
  );
  if (Object.keys(fields).length === 0) {
    throw badRequest(`수정할 항목이 없습니다. (${UPDATABLE_FIELDS.join(', ')})`);
  }
  const post = await communityService.updatePost(postId, req.user.id, fields);
  res.json({ data: { post } });
}

async function remove(req, res) {
  await communityService.deletePost(parsePostId(req), req.user.id);
  res.status(204).end();
}

/** PUT /api/posts/:id/reaction — 이모지 남기기·바꾸기. */
async function react(req, res) {
  const postId = parsePostId(req);
  const type = req.body?.type;
  if (typeof type !== 'string' || !REACTION_TYPES.includes(type)) {
    throw badRequest(`이모지(type) 값이 올바르지 않습니다. (${REACTION_TYPES.join(', ')})`);
  }
  res.json({ data: await communityService.setReaction(postId, req.user.id, type) });
}

/** DELETE /api/posts/:id/reaction — 이모지 취소. */
async function unreact(req, res) {
  res.json({ data: await communityService.removeReaction(parsePostId(req), req.user.id) });
}

/** POST /api/posts/:id/poll/votes — 투표 참여 (1인 1표, 변경 불가). */
async function votePoll(req, res) {
  const postId = parsePostId(req);
  const optionId = toPositiveInt(req.body?.optionId);
  if (Number.isNaN(optionId)) throw badRequest('선택지(optionId)를 골라 주세요.');
  const poll = await communityService.votePoll(postId, req.user.id, optionId);
  res.status(201).json({ data: { poll } });
}

module.exports = { list, detail, create, update, remove, react, unreact, votePoll };

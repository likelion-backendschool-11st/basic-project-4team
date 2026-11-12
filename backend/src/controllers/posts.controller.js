const postsService = require('../services/posts.service');
const HttpError = require('../utils/HttpError');

const BOARDS = ['pokemon', 'sneakers', 'onepiece', 'watch', 'free'];
const TAGS = ['analysis', 'verify', 'unboxing', 'poll', 'qna', 'info'];
const SORTS = ['latest', 'popular'];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const TITLE_MAX = 100;
const BODY_MAX = 500;
const ITEM_ID_MAX = 100;

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
};

async function list(req, res) {
  const { board, itemId, tag, sort, page, size } = req.query;
  const parsedPage = page === undefined ? 1 : toPositiveInt(page);
  const parsedSize = size === undefined ? DEFAULT_PAGE_SIZE : toPositiveInt(size);
  if (Number.isNaN(parsedPage)) throw badRequest('page는 1 이상의 정수여야 합니다.');
  if (Number.isNaN(parsedSize) || parsedSize > MAX_PAGE_SIZE) {
    throw badRequest(`size는 1~${MAX_PAGE_SIZE} 사이의 정수여야 합니다.`);
  }

  const result = await postsService.listPosts(
    {
      board: parseEnum(board, BOARDS, '게시판(board)'),
      itemId: parseOptionalText(itemId, ITEM_ID_MAX, '품목 ID(itemId)'),
      tag: parseEnum(tag, TAGS, '태그(tag)'),
      sort: parseEnum(sort, SORTS, '정렬(sort)') ?? 'latest',
      page: parsedPage,
      size: parsedSize,
    },
    req.user?.id,
  );
  res.json({ data: result });
}

async function detail(req, res) {
  const post = await postsService.getPost(parsePostId(req), req.user?.id);
  res.json({ data: { post } });
}

async function create(req, res) {
  const input = req.body ?? {};
  const fields = Object.fromEntries(
    Object.entries(FIELD_PARSERS).map(([key, parse]) => [key, parse(input[key])]),
  );
  const post = await postsService.createPost(req.user.id, fields);
  res.status(201).json({ data: { post } });
}

async function update(req, res) {
  const postId = parsePostId(req);
  const input = req.body ?? {};
  // 요청에 들어온 필드만 검증·수정한다 (부분 수정).
  const fields = Object.fromEntries(
    Object.entries(FIELD_PARSERS)
      .filter(([key]) => input[key] !== undefined)
      .map(([key, parse]) => [key, parse(input[key])]),
  );
  if (Object.keys(fields).length === 0) {
    throw badRequest(`수정할 항목이 없습니다. (${Object.keys(FIELD_PARSERS).join(', ')})`);
  }
  const post = await postsService.updatePost(postId, req.user.id, fields);
  res.json({ data: { post } });
}

async function remove(req, res) {
  await postsService.deletePost(parsePostId(req), req.user.id);
  res.status(204).end();
}

module.exports = { list, detail, create, update, remove };

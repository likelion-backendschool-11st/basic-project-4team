const commentService = require('./comment.service');
const HttpError = require('../utils/HttpError');

const BODY_MAX = 500;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const POSITIVE_INT = /^[1-9]\d*$/;

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 경로의 id. 양의 정수가 아니면 존재할 수 없는 리소스이므로 404. */
function parsePathId(value, code, message) {
  if (!POSITIVE_INT.test(value)) throw new HttpError(404, code, message);
  return Number(value);
}

const parsePostId = (req) => parsePathId(req.params.postId, 'POST_NOT_FOUND', '토론글을 찾을 수 없습니다.');
const parseCommentId = (req) => parsePathId(req.params.commentId, 'COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');

/** 커서 페이징 쿼리. cursor는 직전 페이지 마지막 id(문자열), 없으면 처음부터(0). */
function parsePageQuery({ cursor, size }) {
  if (cursor !== undefined && (typeof cursor !== 'string' || !POSITIVE_INT.test(cursor))) {
    throw badRequest('cursor 값이 올바르지 않습니다.');
  }
  if (size !== undefined && (typeof size !== 'string' || !POSITIVE_INT.test(size) || Number(size) > MAX_PAGE_SIZE)) {
    throw badRequest(`size는 1~${MAX_PAGE_SIZE} 사이의 정수여야 합니다.`);
  }
  return {
    cursor: cursor === undefined ? 0 : Number(cursor),
    size: size === undefined ? DEFAULT_PAGE_SIZE : Number(size),
  };
}

function parseBody(value) {
  const body = typeof value === 'string' ? value.trim() : '';
  if (body.length === 0 || body.length > BODY_MAX) {
    throw badRequest(`댓글은 1~${BODY_MAX}자여야 합니다.`);
  }
  return body;
}

function parseParentId(value) {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value) || value < 1) throw badRequest('parentId는 양의 정수여야 합니다.');
  return value;
}

/** GET /api/community/posts/:postId/comments — 댓글 목록. */
async function list(req, res) {
  const result = await commentService.listComments(parsePostId(req), parsePageQuery(req.query), req.user?.id);
  res.json({ data: result });
}

/** GET /api/community/comments/:commentId/replies — 답글 더보기. */
async function replies(req, res) {
  const result = await commentService.listReplies(parseCommentId(req), parsePageQuery(req.query), req.user?.id);
  res.json({ data: result });
}

/** POST /api/community/posts/:postId/comments — 댓글·답글 작성. */
async function create(req, res) {
  const postId = parsePostId(req);
  const input = req.body ?? {};
  const result = await commentService.createComment(postId, req.user.id, {
    body: parseBody(input.body),
    parentId: parseParentId(input.parentId),
  });
  res.status(201).json({ data: result });
}

/** PATCH /api/community/comments/:commentId — 댓글 수정. */
async function update(req, res) {
  const commentId = parseCommentId(req);
  const comment = await commentService.updateComment(commentId, req.user.id, parseBody(req.body?.body));
  res.json({ data: { comment } });
}

/** DELETE /api/community/comments/:commentId — 댓글 삭제. */
async function remove(req, res) {
  await commentService.deleteComment(parseCommentId(req), req.user.id);
  res.status(204).end();
}

module.exports = { list, replies, create, update, remove };

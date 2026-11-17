const itemRequestService = require('./itemrequest.service');
const HttpError = require('../utils/HttpError');

const TITLE_MAX = 100;
const BODY_MAX = 1000;
const URL_MAX = 500;
const STATUSES = ['pending', 'approved', 'rejected'];

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 앞뒤 공백을 지운 필수 문자열. 비었거나 max를 넘으면 400. label은 받침에 맞춰 조사를 고른다(제목을/본문을). */
function requiredText(value, label, max) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed.length === 0) throw badRequest(`${label}을 입력해 주세요.`);
  if (trimmed.length > max) throw badRequest(`${label}은 ${max}자 이하여야 합니다.`);
  return trimmed;
}

/** 참고 링크 — 없으면 null, 있으면 http(s) URL만. */
function optionalUrl(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw badRequest('referenceUrl은 문자열이어야 합니다.');
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > URL_MAX) throw badRequest(`참고 링크는 ${URL_MAX}자 이하여야 합니다.`);
  if (!/^https?:\/\/\S+$/i.test(trimmed)) throw badRequest('참고 링크는 http:// 또는 https://로 시작해야 합니다.');
  return trimmed;
}

/** POST 본문 검증 (api-spec.md "품목 등록 요청 (#47)"). */
function parseRequest(input) {
  const { categoryId, title, body, referenceUrl } = input ?? {};
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) throw badRequest('카테고리를 선택해 주세요.');
  return {
    categoryId,
    title: requiredText(title, '제목', TITLE_MAX),
    body: requiredText(body, '본문', BODY_MAX),
    referenceUrl: optionalUrl(referenceUrl),
  };
}

/** 양의 정수 쿼리. 없으면 기본값. */
function readPositiveInt(value, fallback, label) {
  if (value === undefined) return fallback;
  const n = /^\d+$/.test(String(value)) ? Number(value) : NaN;
  if (!Number.isSafeInteger(n) || n < 1) throw badRequest(`${label}는 1 이상의 정수여야 합니다.`);
  return n;
}

/** POST /api/item-requests — 품목 등록 요청 (ITEM-06). */
async function create(req, res) {
  const itemRequest = await itemRequestService.createRequest(req.user.id, parseRequest(req.body));
  res.status(201).json({ data: { itemRequest } });
}

/** GET /api/users/me/item-requests — 내 품목 등록 요청 목록 (ITEM-07). */
async function listMine(req, res) {
  const { status } = req.query;
  if (status !== undefined && !STATUSES.includes(status)) {
    throw badRequest(`status 값이 올바르지 않습니다. (${STATUSES.join(', ')})`);
  }
  const page = readPositiveInt(req.query.page, 1, 'page');
  const size = readPositiveInt(req.query.size, 10, 'size');
  if (size > 50) throw badRequest('size는 1~50 사이의 정수여야 합니다.');
  res.json({ data: await itemRequestService.listMyRequests(req.user.id, { status: status ?? null, page, size }) });
}

module.exports = { create, listMine };

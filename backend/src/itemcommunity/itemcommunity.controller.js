const itemCommunityService = require('./itemcommunity.service');
const HttpError = require('../utils/HttpError');

const CONDITIONS = ['unopened', 'opened_raw', 'graded'];
const GRADING_SERVICES = ['PSA', 'BGS', 'CGC', 'BRG'];
const GRADES = ['10', '9.5', '9', '8.5', '8', '7'];
const SLUG_PATTERN = /^[a-z0-9-]{1,150}$/;

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 경로의 itemId — 양의 정수면 id, 아니면 slug. 둘 다 아니면 존재할 수 없는 품목이므로 404. */
function parseItemId(req) {
  const { itemId } = req.params;
  if (/^[1-9]\d*$/.test(itemId)) return Number(itemId);
  if (SLUG_PATTERN.test(itemId)) return itemId;
  throw new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');
}

/** 목록에서 고르는 값. 비어 있으면 null. */
function parseEnum(value, allowed, label) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw badRequest(`${label} 값이 올바르지 않습니다. (${allowed.join(', ')})`);
  }
  return value;
}

/** 시세 필터. 그레이딩사·등급은 condition=graded일 때만 받는다. */
function parseMarketFilter(query) {
  const condition = parseEnum(query.condition, CONDITIONS, '상태(condition)');
  const gradingService = parseEnum(query.gradingService, GRADING_SERVICES, '그레이딩사(gradingService)');
  const grade = parseEnum(query.grade, GRADES, '등급(grade)');
  if ((gradingService || grade) && condition !== 'graded') {
    throw badRequest('gradingService, grade는 condition=graded일 때만 사용할 수 있습니다.');
  }
  return { condition, gradingService, grade };
}

/** GET /api/items/:itemId — 품목 상세 (ITEM-03). */
async function detail(req, res) {
  const item = await itemCommunityService.getItemDetail(parseItemId(req), parseMarketFilter(req.query));
  res.json({ data: item });
}

module.exports = { detail };

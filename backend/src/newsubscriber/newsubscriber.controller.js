const newSubscriberService = require('./newsubscriber.service');
const HttpError = require('../utils/HttpError');

const CONDITIONS = ['unopened', 'opened_raw', 'graded'];
const GRADING_SERVICES = ['PSA', 'BGS', 'CGC', 'BRG'];
const GRADES = ['10', '9.5', '9', '8.5', '8', '7'];
const DAYS = [7, 30, 90];
const DEFAULT_DAYS = 30;
const SLUG_PATTERN = /^[a-z0-9-]{1,150}$/;

function badRequest(field, message) {
  return new HttpError(400, 'VALIDATION_ERROR', message, [{ field, message }]);
}

/** 경로의 itemId — 양의 정수면 id, 아니면 slug (ITEM-03과 같은 규칙). 둘 다 아니면 404. */
function parseItemId(req) {
  const { itemId } = req.params;
  if (/^[1-9]\d*$/.test(itemId)) return Number(itemId);
  if (SLUG_PATTERN.test(itemId)) return itemId;
  throw new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');
}

/** 목록에서 고르는 값. 비어 있으면 null. */
function parseEnum(query, field, allowed) {
  const value = query[field];
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw badRequest(field, `${field} 값이 올바르지 않습니다. (${allowed.join(', ')})`);
  }
  return value;
}

/** 시세 필터. 그레이딩사·등급은 condition=graded일 때만 받는다. */
function parseMarketFilter(query) {
  const condition = parseEnum(query, 'condition', CONDITIONS);
  const gradingService = parseEnum(query, 'gradingService', GRADING_SERVICES);
  const grade = parseEnum(query, 'grade', GRADES);
  if ((gradingService || grade) && condition !== 'graded') {
    throw badRequest('condition', 'gradingService, grade는 condition=graded일 때만 사용할 수 있습니다.');
  }
  return { condition, gradingService, grade };
}

function parseDays(value) {
  if (value === undefined || value === '') return DEFAULT_DAYS;
  const days = Number(value);
  if (typeof value !== 'string' || !DAYS.includes(days)) {
    throw badRequest('days', `days는 ${DAYS.join(', ')} 중 하나여야 합니다.`);
  }
  return days;
}

/** GET /api/items/:itemId/market-price — 품목 시세 기준가 (ITEM-04). */
async function marketPrice(req, res) {
  const itemId = parseItemId(req);
  const data = await newSubscriberService.getMarketPrice(itemId, parseMarketFilter(req.query), parseDays(req.query.days));
  res.json({ data });
}

/** GET /api/users/me/listing-limit — 내 신규 가입자 등록 제한 상태. */
async function listingLimit(req, res) {
  res.json({ data: await newSubscriberService.getListingLimit(req.user.id) });
}

module.exports = { marketPrice, listingLimit };

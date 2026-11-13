const sellService = require('./sell.service');
const HttpError = require('../utils/HttpError');

/** 경로의 listingId. 양의 정수가 아니면 존재할 수 없는 판매글이므로 404로 응답한다. */
function parseListingId(req) {
  const { listingId } = req.params;
  if (!/^[1-9]\d*$/.test(listingId)) {
    throw new HttpError(404, 'LISTING_NOT_FOUND', '판매글을 찾을 수 없습니다.');
  }
  return Number(listingId);
}

const LIST_SORTS = ['latest', 'priceAsc', 'priceDesc', 'popular'];
const LIST_CONDITIONS = ['unopened', 'opened_raw', 'graded'];
const LIST_GRADING_SERVICES = ['PSA', 'BGS', 'CGC', 'BRG'];
const LIST_GRADES = ['10', '9.5', '9', '8.5', '8', '7'];
const LIST_TRADE_METHODS = ['delivery', 'direct'];
const DEFAULT_LIST_SIZE = 10;
const MAX_LIST_SIZE = 50;
const Q_MAX = 100;

function listBadRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 쿼리 문자열의 0 이상 정수. 비어 있으면 null. */
function parseQueryInt(value, label, { min = 0 } = {}) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < min) {
    throw listBadRequest(`${label}은(는) ${min} 이상의 정수여야 합니다.`);
  }
  return Number(value);
}

/** 쉼표로 구분된 목록. 허용되지 않은 값이 있으면 400. */
function parseQueryList(value, allowed, label) {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') throw listBadRequest(`${label} 형식이 올바르지 않습니다.`);
  const values = [...new Set(value.split(',').map((v) => v.trim()).filter(Boolean))];
  const invalid = values.filter((v) => !allowed.includes(v));
  if (invalid.length > 0) throw listBadRequest(`${label} 값이 올바르지 않습니다: ${invalid.join(', ')} (${allowed.join(', ')})`);
  return values;
}

/** "PSA-10,BGS-9.5" → [{ gradingService, grade }]. */
function parseGrades(value) {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') throw listBadRequest('grades 형식이 올바르지 않습니다.');
  return value.split(',').map((token) => {
    const [gradingService, grade, extra] = token.trim().split('-');
    if (extra !== undefined || !LIST_GRADING_SERVICES.includes(gradingService) || !LIST_GRADES.includes(grade)) {
      throw listBadRequest(`grades는 {그레이딩사}-{등급} 형식이어야 합니다 (예: PSA-10,BGS-9.5): ${token}`);
    }
    return { gradingService, grade };
  });
}

function parseQueryBoolean(value, label, defaultValue) {
  if (value === undefined || value === '') return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw listBadRequest(`${label}은(는) true 또는 false여야 합니다.`);
}

/** GET /api/listings — 판매글 검색·목록 (LISTING-01). */
async function list(req, res) {
  const query = req.query;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q.length > Q_MAX) throw listBadRequest(`검색어는 ${Q_MAX}자 이하여야 합니다.`);
  if (query.category !== undefined && typeof query.category !== 'string') throw listBadRequest('category 형식이 올바르지 않습니다.');

  const minPrice = parseQueryInt(query.minPrice, 'minPrice');
  const maxPrice = parseQueryInt(query.maxPrice, 'maxPrice');
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw listBadRequest('minPrice는 maxPrice보다 클 수 없습니다.');
  }
  const page = parseQueryInt(query.page, 'page', { min: 1 }) ?? 1;
  const size = parseQueryInt(query.size, 'size', { min: 1 }) ?? DEFAULT_LIST_SIZE;
  if (size > MAX_LIST_SIZE) throw listBadRequest(`size는 ${MAX_LIST_SIZE} 이하여야 합니다.`);
  const sort = query.sort === undefined || query.sort === '' ? 'latest' : query.sort;
  if (!LIST_SORTS.includes(sort)) throw listBadRequest(`sort 값이 올바르지 않습니다. (${LIST_SORTS.join(', ')})`);

  const result = await sellService.listListings(
    {
      q: q || null,
      category: query.category || null,
      itemId: parseQueryInt(query.itemId, 'itemId', { min: 1 }),
      conditions: parseQueryList(query.condition, LIST_CONDITIONS, 'condition'),
      grades: parseGrades(query.grades),
      minPrice,
      maxPrice,
      tradeMethods: parseQueryList(query.tradeMethod, LIST_TRADE_METHODS, 'tradeMethod'),
      excludeSold: parseQueryBoolean(query.excludeSold, 'excludeSold', true),
    },
    { sort, page, size, viewerId: req.user?.id },
  );
  res.json({ data: result });
}

/** GET /api/listings/:listingId — 판매글 상세 (LISTING-02). */
async function detail(req, res) {
  const listing = await sellService.getListingDetail(parseListingId(req), {
    viewerId: req.user?.id,
    ip: req.ip,
  });
  res.json({ data: listing });
}

module.exports = { list, detail };

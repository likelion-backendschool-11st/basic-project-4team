const marketService = require('./market.service');
const HttpError = require('../utils/HttpError');

const CATEGORY_PATTERN = /^[a-z0-9-]{1,30}$/;
// 등급 키: unopened · opened_raw · {psa|bgs|cgc|brg}-{10|9.5|9|8.5|8|7}. all(기본)은 전체 등급.
const GRADE_PATTERN = /^(unopened|opened_raw|(psa|bgs|cgc|brg)-(10|9\.5|9|8\.5|8|7))$/;
const SORTS = ['volume', 'priceDesc', 'priceAsc', 'rising', 'falling'];
const MAX_QUERY_LENGTH = 50;

function badRequest(field, message) {
  return new HttpError(400, 'VALIDATION_ERROR', message, [{ field, message }]);
}

/** category(소분류 코드). 생략하면 최근 30일 거래가 있는 첫 카테고리. */
function parseCategory(value) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !CATEGORY_PATTERN.test(value)) throw badRequest('category', 'category 값이 올바르지 않습니다.');
  return value;
}

/** grade(등급 키). 생략하거나 all이면 null(전체). */
function parseGrade(value) {
  if (value === undefined || value === '' || value === 'all') return null;
  if (typeof value !== 'string' || !GRADE_PATTERN.test(value)) {
    throw badRequest('grade', 'grade는 all, unopened, opened_raw, psa-10 같은 등급 키여야 합니다.');
  }
  return value;
}

/** 정수 쿼리. 생략하면 기본값, 범위를 벗어나면 400. */
function parseIntParam(query, field, { fallback, min, max }) {
  const value = query[field];
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (typeof value !== 'string' || !Number.isInteger(number) || number < min || number > max) {
    throw badRequest(field, `${field}는 ${min}~${max} 사이의 정수여야 합니다.`);
  }
  return number;
}

function parseFilter(query) {
  return { category: parseCategory(query.category), grade: parseGrade(query.grade) };
}

/** GET /api/market/filters — 카테고리 탭·등급별 거래 건수 (MARKET-01). */
async function filters(req, res) {
  res.json({ data: await marketService.getFilters(parseCategory(req.query.category)) });
}

/** GET /api/market/insights — 상승·하락 품목 수, 거래량 증감 (MARKET-02). */
async function insights(req, res) {
  const { category, grade } = parseFilter(req.query);
  res.json({ data: await marketService.getInsights(category, grade) });
}

/** GET /api/market/chart — 30일 일별 평균 체결가·거래량 (MARKET-03). */
async function chart(req, res) {
  const { category, grade } = parseFilter(req.query);
  res.json({ data: await marketService.getChart(category, grade) });
}

/** GET /api/market/top-gainers — 전일 대비 상승 Top N (MARKET-04). */
async function topGainers(req, res) {
  const { category, grade } = parseFilter(req.query);
  const limit = parseIntParam(req.query, 'limit', { fallback: 5, min: 1, max: 20 });
  res.json({ data: await marketService.getTopGainers(category, grade, limit) });
}

/** GET /api/market/prices — 품목별 시세 목록 (MARKET-05). */
async function prices(req, res) {
  const { category, grade } = parseFilter(req.query);
  const { q = '', sort = 'volume' } = req.query;
  if (typeof q !== 'string' || q.trim().length > MAX_QUERY_LENGTH) {
    throw badRequest('q', `검색어는 ${MAX_QUERY_LENGTH}자 이하로 입력해 주세요.`);
  }
  if (!SORTS.includes(sort)) throw badRequest('sort', `sort는 ${SORTS.join(', ')} 중 하나여야 합니다.`);
  const page = parseIntParam(req.query, 'page', { fallback: 1, min: 1, max: 1000 });
  const size = parseIntParam(req.query, 'size', { fallback: 9, min: 1, max: 30 });
  res.json({ data: await marketService.getPrices(category, grade, { q: q.trim(), sort, page, size }) });
}

module.exports = { filters, insights, chart, topGainers, prices };

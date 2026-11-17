const marketRepository = require('./market.repository');
const HttpError = require('../utils/HttpError');

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 시세 기간: 오늘(KST) 포함 최근 30일. */
const WINDOW_DAYS = 30;
/** 30일 변동률의 기준가(30일 전 시세)를 찾으려고 그 앞 30일까지 더 읽는다. */
const LOOKBACK_DAYS = WINDOW_DAYS * 2;

/** 오늘 날짜(KST) 'YYYY-MM-DD'. */
function todayKst(now = Date.now()) {
  return new Date(now + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' ± days. */
function addDays(date, days) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** 변동률(%, 소수 1자리). 음수도 절댓값 기준으로 반올림한다 (토론방 시세 요약과 같은 규칙). */
function toChangeRate(price, basePrice) {
  const rate = ((price - basePrice) / basePrice) * 100;
  return (Math.sign(rate) * Math.round(Math.abs(rate) * 10)) / 10;
}

/** 날짜 오름차순 [{ tradeDate, price }]에서 date 이전(당일 포함) 마지막 시세. 없으면 null. */
function priceAsOf(days, date) {
  let found = null;
  for (const day of days) {
    if (day.tradeDate > date) break;
    found = day.price;
  }
  return found;
}

/**
 * 일별 시세 → 현재 시세와 변동률.
 * 현재 시세 = 마지막 거래일의 시세.
 * 1일(전일) 변동 = 직전 거래일 시세 대비 — 토론방 시세 요약(ITEM-03)의 "전일 대비"와 같은 규칙.
 * 7·30일 변동 = (오늘 − N일) 이전 마지막 거래일의 시세 대비. 그 뒤로 새 거래가 없으면 0%.
 * 기준이 될 거래가 없으면 null.
 */
function toPriceChanges(days, today) {
  const price = days[days.length - 1].price;
  const previous = days.length >= 2 ? days[days.length - 2].price : null;
  const changes = { change1d: previous === null ? null : toChangeRate(price, previous) };
  for (const period of [7, 30]) {
    const basePrice = priceAsOf(days, addDays(today, -period));
    changes[`change${period}d`] = basePrice === null ? null : toChangeRate(price, basePrice);
  }
  return { price, ...changes };
}

function categoryNotFound() {
  return new HttpError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
}

/** 등급 키 → { condition, gradingService, grade }. 'psa-10' → graded / PSA / 10. */
function parseGradeKey(gradeKey) {
  const match = /^([a-z]+)-(.+)$/.exec(gradeKey);
  if (!match) return { condition: gradeKey, gradingService: null, grade: null };
  return { condition: 'graded', gradingService: match[1].toUpperCase(), grade: match[2] };
}

/** 쿼리의 카테고리 코드 → 카테고리. 생략하면 최근 30일 거래가 있는 첫 카테고리 (없으면 null). */
async function resolveCategory(code, fromDate) {
  if (code) {
    const category = await marketRepository.findSubCategory(code);
    if (!category) throw categoryNotFound();
    return category;
  }
  const [first] = await marketRepository.findCategoriesWithTrades(fromDate);
  return first ? marketRepository.findSubCategory(first.code) : null;
}

/** 시세 기간 정보 — 화면의 "기준일 · 최근 30일" 안내에 쓴다. */
function toPeriod(today) {
  return { days: WINDOW_DAYS, from: addDays(today, -(WINDOW_DAYS - 1)), to: today };
}

/**
 * MARKET-01 시세 필터 메타: 카테고리 탭, 선택한 카테고리의 등급별 거래 건수, 기준일.
 * 탭은 최근 30일 거래가 있는 소분류만, 등급은 거래 건수 많은 순.
 */
async function getFilters(categoryCode) {
  const { today, category } = await resolveRequest(categoryCode);
  const from = addDays(today, -(WINDOW_DAYS - 1));
  const categories = await marketRepository.findCategoriesWithTrades(from);
  const grades = category ? await marketRepository.findGradeCounts(category.id, from) : [];
  return {
    categories,
    category: category ? { code: category.code, name: category.name } : null,
    grades: grades.map(({ gradeKey, tradeCount }) => ({ key: gradeKey, ...parseGradeKey(gradeKey), tradeCount })),
    totalTradeCount: grades.reduce((sum, grade) => sum + grade.tradeCount, 0),
    period: toPeriod(today),
  };
}

/**
 * 품목·등급별 시세 목록. 같은 품목이라도 등급(PSA 10, 미개봉 …)이 다르면 따로 센다.
 * 최근 30일 안에 거래가 없는 품목·등급은 빠진다.
 */
async function loadItemPrices(category, gradeKey, today, words = []) {
  const windowFrom = addDays(today, -(WINDOW_DAYS - 1));
  if (!category) return [];

  const rows = await marketRepository.findItemDailyRows(category.id, gradeKey, addDays(today, -LOOKBACK_DAYS), words);
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.itemId}:${row.gradeKey}`;
    if (!groups.has(key)) groups.set(key, { info: row, days: [] });
    groups.get(key).days.push({ tradeDate: row.tradeDate, price: row.medianPrice, tradeCount: row.tradeCount });
  }

  const items = [];
  for (const { info, days } of groups.values()) {
    const recent = days.filter((day) => day.tradeDate >= windowFrom);
    if (recent.length === 0) continue;
    items.push({
      itemId: info.itemId,
      slug: info.slug,
      name: info.name,
      setName: info.setName,
      language: info.language,
      imageUrl: info.imageUrl,
      gradeKey: info.gradeKey,
      ...parseGradeKey(info.gradeKey),
      ...toPriceChanges(days, today),
      tradeCount30d: recent.reduce((sum, day) => sum + day.tradeCount, 0),
      lastTradeDate: recent[recent.length - 1].tradeDate,
      sparkline: recent.map((day) => day.price),
    });
  }
  return items;
}

/** 카테고리 일별 합계 (from 이후). 카테고리가 없으면(최근 거래 없음) 빈 배열. */
async function loadCategoryTotals(category, gradeKey, from) {
  return category ? marketRepository.findCategoryDailyTotals(category.id, gradeKey, from) : [];
}

/** 요청 공통: 오늘(KST)과 카테고리. */
async function resolveRequest(categoryCode) {
  const today = todayKst();
  return { today, category: await resolveCategory(categoryCode, addDays(today, -(WINDOW_DAYS - 1))) };
}

/** 평균(소수 1자리). 빈 배열이면 null. */
function averageRate(rates) {
  if (rates.length === 0) return null;
  return Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 10) / 10;
}

/**
 * MARKET-02 시장 인사이트 — 품목별 1일 변동률로 상승·하락 품목 수와 평균 변동률,
 * 최근 7일 거래 건수와 그 앞 7일 대비 증감률.
 */
async function getInsights(categoryCode, gradeKey) {
  const { today, category } = await resolveRequest(categoryCode);
  const [items, totals] = await Promise.all([
    loadItemPrices(category, gradeKey, today),
    loadCategoryTotals(category, gradeKey, addDays(today, -13)),
  ]);
  const rising = items.filter((item) => item.change1d > 0).map((item) => item.change1d);
  const falling = items.filter((item) => item.change1d < 0).map((item) => item.change1d);
  const sumSince = (from, to) =>
    totals.filter((day) => day.tradeDate >= from && day.tradeDate <= to).reduce((sum, day) => sum + day.tradeCount, 0);
  const recent7d = sumSince(addDays(today, -6), today);
  const previous7d = sumSince(addDays(today, -13), addDays(today, -7));

  return {
    itemCount: items.length,
    rising: { count: rising.length, averageChangeRate: averageRate(rising) },
    falling: { count: falling.length, averageChangeRate: averageRate(falling) },
    volume: {
      tradeCount7d: recent7d,
      previousTradeCount7d: previous7d,
      changeRate: previous7d === 0 ? null : toChangeRate(recent7d, previous7d),
    },
  };
}

/**
 * MARKET-03 30일 시세·거래량 차트. 카테고리(·등급) 전체의 일별 평균 체결가와 거래 건수.
 * 요약: 30일 평균 체결가, 일별 평균 체결가 기준 1·7·30일 변동률, 30일 총 거래 건수.
 */
async function getChart(categoryCode, gradeKey) {
  const { today, category } = await resolveRequest(categoryCode);
  const windowFrom = addDays(today, -(WINDOW_DAYS - 1));
  const totals = await loadCategoryTotals(category, gradeKey, addDays(today, -LOOKBACK_DAYS));
  const days = totals.map((day) => ({ ...day, price: Math.round(day.totalPrice / day.tradeCount) }));
  const recent = days.filter((day) => day.tradeDate >= windowFrom);

  const tradeCount = recent.reduce((sum, day) => sum + day.tradeCount, 0);
  const totalPrice = recent.reduce((sum, day) => sum + day.totalPrice, 0);
  const changes = recent.length === 0 ? null : toPriceChanges(days, today);

  return {
    period: toPeriod(today),
    summary: {
      averagePrice: tradeCount === 0 ? null : Math.round(totalPrice / tradeCount),
      change1d: changes ? changes.change1d : null,
      change7d: changes ? changes.change7d : null,
      change30d: changes ? changes.change30d : null,
      tradeCount,
    },
    points: recent.map((day) => ({ date: day.tradeDate, averagePrice: day.price, tradeCount: day.tradeCount })),
  };
}

/** MARKET-04 전일 대비 상승 Top N — 1일 변동률이 0보다 큰 품목, 상승률 높은 순(같으면 거래 많은 순). */
async function getTopGainers(categoryCode, gradeKey, limit) {
  const { today, category } = await resolveRequest(categoryCode);
  const items = await loadItemPrices(category, gradeKey, today);
  return {
    items: items
      .filter((item) => item.change1d > 0)
      .sort((a, b) => b.change1d - a.change1d || b.tradeCount30d - a.tradeCount30d)
      .slice(0, limit)
      .map((item, index) => ({ rank: index + 1, ...item })),
  };
}

/** 변동률 정렬 — 기준이 없어 null인 품목은 항상 뒤로. */
function byChange(direction) {
  return (a, b) => {
    if (a.change1d === null || b.change1d === null) return (a.change1d === null) - (b.change1d === null);
    return direction * (a.change1d - b.change1d);
  };
}

const SORTS = {
  volume: (a, b) => b.tradeCount30d - a.tradeCount30d,
  priceDesc: (a, b) => b.price - a.price,
  priceAsc: (a, b) => a.price - b.price,
  rising: byChange(-1),
  falling: byChange(1),
};

/** MARKET-05 품목별 시세 목록 (검색·정렬·페이지). 같은 순위면 최근 거래 → 이름 순. */
async function getPrices(categoryCode, gradeKey, { q, sort, page, size }) {
  const words = q ? q.split(/\s+/).filter(Boolean) : [];
  const { today, category } = await resolveRequest(categoryCode);
  const items = await loadItemPrices(category, gradeKey, today, words);
  items.sort(
    (a, b) => SORTS[sort](a, b) || b.lastTradeDate.localeCompare(a.lastTradeDate) || a.name.localeCompare(b.name, 'ko'),
  );
  return {
    items: items.slice((page - 1) * size, page * size),
    totalCount: items.length,
    page,
    size,
  };
}

module.exports = { getFilters, getInsights, getChart, getTopGainers, getPrices };

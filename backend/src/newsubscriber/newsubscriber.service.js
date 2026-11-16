const newSubscriberRepository = require('./newsubscriber.repository');
const itemCommunityRepository = require('../itemcommunity/itemcommunity.repository');
const HttpError = require('../utils/HttpError');

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 운영 기준값 (REQ-COMMON-005) — DB settings 테이블에서 읽는다.
 * 행이 없거나 값이 범위를 벗어나면(또는 아직 db:init 전이라 테이블이 없으면) 이 기본값을 쓴다.
 */
const POLICY_SETTINGS = {
  lowPriceRatio: { key: 'low_price_warning_ratio', fallback: 0.3, min: 0.01, max: 0.99 },
  newUserDays: { key: 'new_user_limit_days', fallback: 7, min: 0, max: 365 },
  newUserPriceLimit: { key: 'new_user_price_limit', fallback: 1000000, min: 1, max: 1000000000 },
};

/** settings 문자열 → 숫자. 비었거나 범위 밖이면 기본값. */
function toSettingNumber(raw, { key, fallback, min, max }) {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (raw.trim() === '' || !Number.isFinite(value) || value < min || value > max) {
    console.warn(`[settings] ${key} 값이 올바르지 않아 기본값 ${fallback}을 씁니다. (현재: ${raw}, 허용: ${min}~${max})`);
    return fallback;
  }
  return value;
}

/** 저가 경고·신규 가입자 제한 기준값. 요청마다 읽어서 DB 값을 바꾸면 서버 재시작 없이 바로 반영된다. */
async function getListingPolicy() {
  let rows = {};
  try {
    rows = await newSubscriberRepository.findSettings(Object.values(POLICY_SETTINGS).map((s) => s.key));
  } catch (err) {
    // 최신 schema.sql로 db:init을 아직 안 한 DB — 판매글 등록이 막히지 않게 기본값으로 동작한다.
    if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
    console.warn('[settings] settings 테이블이 없어 기본값을 씁니다. backend에서 npm run db:init을 실행하세요.');
  }
  return Object.fromEntries(
    Object.entries(POLICY_SETTINGS).map(([name, setting]) => [name, toSettingNumber(rows[setting.key], setting)]),
  );
}

/** 1,000,000 → "1,000,000원" */
function formatWon(price) {
  return `${price.toLocaleString('ko-KR')}원`;
}

/** Date → "2026-11-23 10:00" (KST). 에러 메시지에 보여줄 용도. */
function formatKst(date) {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 16).replace('T', ' ');
}

/** 금액순으로 정렬된 가격 목록의 중앙값. 짝수 개면 가운데 두 값의 평균(원 단위 반올림). */
function median(sortedPrices) {
  const mid = Math.floor(sortedPrices.length / 2);
  return sortedPrices.length % 2 === 1
    ? sortedPrices[mid]
    : Math.round((sortedPrices[mid - 1] + sortedPrices[mid]) / 2);
}

/**
 * ITEM-04 품목 시세 기준가 (REQ-POST-012·013).
 * 저가 경고 기준(lowPriceRatio)과 그 기준 금액(lowPriceThreshold)을 함께 내려
 * 프론트가 "시세 대비 n% 이상 저렴" 경고를 서버 설정값 그대로 띄울 수 있게 한다.
 */
async function getMarketPrice(idOrSlug, filter, days) {
  const item = await itemCommunityRepository.findByIdOrSlug(idOrSlug);
  if (!item) throw new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');

  const [trades, { lowPriceRatio: ratio }] = await Promise.all([
    newSubscriberRepository.findSoldPrices(item.id, filter, days),
    getListingPolicy(),
  ]);
  const prices = trades.map((trade) => trade.price);
  const last = trades.reduce((latest, trade) => (latest && latest.soldAt >= trade.soldAt ? latest : trade), null);
  const averagePrice = prices.length === 0 ? null : Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

  return {
    itemId: item.id,
    condition: filter.condition,
    gradingService: filter.gradingService,
    grade: filter.grade,
    days,
    tradeCount: prices.length,
    averagePrice,
    medianPrice: prices.length === 0 ? null : median(prices),
    minPrice: prices.length === 0 ? null : prices[0],
    maxPrice: prices.length === 0 ? null : prices[prices.length - 1],
    lastSoldPrice: last ? last.price : null,
    lastSoldAt: last ? last.soldAt : null,
    lowPriceRatio: ratio,
    // 이 금액보다 싸면 저가 경고. 시세가 없으면 경고할 기준도 없다.
    lowPriceThreshold: averagePrice === null ? null : Math.round(averagePrice * (1 - ratio)),
  };
}

/** 가입 시각 → 신규 가입자 제한 상태. */
function toListingLimit(joinedAt, { newUserDays, newUserPriceLimit }, now = Date.now()) {
  const limitEndsAt = new Date(joinedAt.getTime() + newUserDays * DAY_MS);
  return {
    isNewUser: now < limitEndsAt.getTime(),
    newUserDays,
    limitPrice: newUserPriceLimit,
    joinedAt,
    limitEndsAt,
  };
}

/** 내 신규 가입자 제한 상태 — 등록·수정 화면 안내(GET /users/me/listing-limit)와 서버 검사가 함께 쓴다 (REQ-POST-018). */
async function getListingLimit(userId) {
  const [joinedAt, policy] = await Promise.all([newSubscriberRepository.findJoinedAt(userId), getListingPolicy()]);
  // 토큰은 유효하지만 탈퇴한 회원
  if (!joinedAt) throw new HttpError(401, 'UNAUTHORIZED', '회원 정보를 찾을 수 없습니다. 다시 로그인해 주세요.');
  return toListingLimit(joinedAt, policy);
}

/**
 * 판매글 등록·가격 수정 전 검사 (REQ-POST-018).
 * 가입 후 newUserDays일이 지나지 않은 회원은 limitPrice 이상으로 올릴 수 없다.
 */
async function assertListingPriceAllowed(userId, price) {
  const limit = await getListingLimit(userId);
  if (!limit.isNewUser || price < limit.limitPrice) return;
  throw new HttpError(
    403,
    'NEW_USER_PRICE_LIMIT',
    `가입 후 ${limit.newUserDays}일이 지나지 않은 회원은 ${formatWon(limit.limitPrice)} 이상의 판매글을 등록할 수 없습니다. (${formatKst(limit.limitEndsAt)}부터 가능)`,
    [{ field: 'price', message: `${formatWon(limit.limitPrice)} 미만으로 입력해 주세요.` }],
  );
}

module.exports = { getMarketPrice, getListingLimit, assertListingPriceAllowed };

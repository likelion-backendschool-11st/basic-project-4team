const itemCommunityRepository = require('./itemcommunity.repository');
const HttpError = require('../utils/HttpError');

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function itemNotFound() {
  return new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');
}

/** 주어진 시각이 속한 KST 날짜의 0시를 UTC Date로. "전일"은 KST 하루 단위로 나눈다. */
function startOfKstDay(date) {
  const kst = date.getTime() + KST_OFFSET_MS;
  return new Date(kst - (kst % DAY_MS) - KST_OFFSET_MS);
}

/** 변동률(%, 소수 1자리). Math.round는 음수 .5를 0 쪽으로 올리므로 절댓값으로 반올림한다. */
function toChangeRate(changeAmount, basePrice) {
  const rate = (changeAmount / basePrice) * 100;
  return (Math.sign(rate) * Math.round(Math.abs(rate) * 10)) / 10;
}

/**
 * 시세 요약. 거래 이력이 없으면 null.
 * 전일 대비 = 최근 체결가 − (최근 체결일(KST) 이전의 마지막 체결가). 이전 체결이 없으면 변동 0.
 */
async function getMarketSummary(itemId, filter) {
  const latest = await itemCommunityRepository.findLastTrade(itemId, filter);
  if (!latest) return null;

  const [previous, tradeCount30d] = await Promise.all([
    itemCommunityRepository.findLastTrade(itemId, filter, startOfKstDay(latest.soldAt)),
    itemCommunityRepository.countRecentTrades(itemId, filter),
  ]);
  const changeAmount = previous ? latest.price - previous.price : 0;

  return {
    latestPrice: latest.price,
    changeAmount,
    changeRate: previous ? toChangeRate(changeAmount, previous.price) : 0,
    tradeCount30d,
  };
}

/** 품목 상세(ITEM-03) — 품목 토론방 헤더의 시세 요약·현재 매물 수. */
async function getItemDetail(idOrSlug, filter) {
  const item = await itemCommunityRepository.findByIdOrSlug(idOrSlug);
  if (!item) throw itemNotFound();

  const [marketSummary, sellingCount] = await Promise.all([
    getMarketSummary(item.id, filter),
    itemCommunityRepository.countSelling(item.id, filter),
  ]);
  return { ...item, marketSummary, sellingCount };
}

module.exports = { getItemDetail };

const badgeRepository = require('./badge.repository');
const { BADGE, BADGE_ORDER, TRADE_MIN_COUNT } = require('./badge.rules');

const pairKey = (slug, userId) => `${slug}:${userId}`;

/** 집계 → 배지 목록 (BADGE_ORDER 순서). */
function toBadges(activity) {
  if (!activity) return [];
  const earned = new Set();
  if (activity.holdingCount > 0) earned.add(BADGE.OWNER);
  if (activity.tradeCount >= TRADE_MIN_COUNT) earned.add(BADGE.TRADE);
  return BADGE_ORDER.filter((badge) => earned.has(badge));
}

/**
 * 품목별 작성자 배지. pairs: [{ slug, userId }] (글의 itemId·작성자).
 * 반환: { get(slug, userId) → string[] } — 판매글 이력이 없으면 [].
 */
async function getItemBadges(pairs) {
  const activity = await badgeRepository.countItemActivity(pairs);
  return { get: (slug, userId) => toBadges(activity.get(pairKey(slug, userId))) };
}

module.exports = { getItemBadges, toBadges, BADGE };

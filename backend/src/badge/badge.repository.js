const pool = require('../config/db');

/**
 * 작성자가 이 품목을 "보유"했는지 SQL 조건 (badge.rules.js의 owner 기준).
 * postAlias: posts 테이블 별칭 — 토론글 목록의 "인증 보유자 글만 보기" 필터에 쓴다.
 */
const ownerExistsSql = (postAlias) => `EXISTS (
  SELECT 1 FROM listings l JOIN items i ON i.id = l.item_id
  WHERE i.slug = ${postAlias}.item_id AND l.deleted_at IS NULL
    AND ((l.seller_id = ${postAlias}.user_id AND l.status IN ('selling', 'reserved'))
      OR (l.buyer_id = ${postAlias}.user_id AND l.status = 'sold'))
)`;

/**
 * (품목 slug, 사용자) 쌍별 판매글 집계. 쿼리 한 번으로 모은다.
 * tradeCount: 거래완료 판매글의 판매자·구매자로 참여한 건수
 * holdingCount: 판매중·예약중 판매글(판매자) + 거래완료 판매글(구매자) 건수
 * 반환: Map<`${slug}:${userId}`, { tradeCount, holdingCount }> — 판매글이 없는 쌍은 빠진다.
 */
async function countItemActivity(pairs) {
  const result = new Map();
  if (pairs.length === 0) return result;
  const slugs = [...new Set(pairs.map((x) => x.slug))];
  const userIds = [...new Set(pairs.map((x) => x.userId))];
  const [rows] = await pool.query(
    `SELECT t.slug, t.user_id,
       SUM(t.status = 'sold') AS trade_count,
       SUM((t.role = 'seller' AND t.status IN ('selling', 'reserved')) OR (t.role = 'buyer' AND t.status = 'sold')) AS holding_count
     FROM (
       SELECT i.slug, l.seller_id AS user_id, l.status, 'seller' AS role
       FROM listings l JOIN items i ON i.id = l.item_id
       WHERE i.slug IN (?) AND l.seller_id IN (?) AND l.deleted_at IS NULL
       UNION ALL
       SELECT i.slug, l.buyer_id AS user_id, l.status, 'buyer' AS role
       FROM listings l JOIN items i ON i.id = l.item_id
       WHERE i.slug IN (?) AND l.buyer_id IN (?) AND l.deleted_at IS NULL
     ) t
     GROUP BY t.slug, t.user_id`,
    [slugs, userIds, slugs, userIds],
  );
  rows.forEach((row) => {
    result.set(`${row.slug}:${row.user_id}`, {
      tradeCount: Number(row.trade_count),
      holdingCount: Number(row.holding_count),
    });
  });
  return result;
}

module.exports = { ownerExistsSql, countItemActivity };

const pool = require('../config/db');

// 등급 키: graded면 'psa-10'처럼 그레이딩사(소문자)-등급, 아니면 condition 값 그대로. 시세는 이 단위로 나눠 낸다.
const GRADE_KEY_SQL = "CASE WHEN l.`condition` = 'graded' THEN CONCAT(LOWER(l.grading_service), '-', l.grade) ELSE l.`condition` END";
// 체결일은 KST 날짜로 나눈다 (sold_at은 UTC).
const TRADE_DATE_SQL = 'DATE(l.sold_at + INTERVAL 9 HOUR)';

/**
 * listings의 거래완료 체결가를 품목·등급·날짜(KST)별로 묶어 item_price_daily에 넣거나 덮어쓴다.
 * 중앙값은 금액순 번호(price_rank)가 가운데인 1~2개 행의 평균, 마지막 체결가는 체결 시각 역순 번호가 1인 행.
 * scope가 있으면 그 품목·등급·날짜 한 칸만, 없으면 전체를 다시 계산한다.
 */
async function upsertDaily(connection, scope = null) {
  const where = scope ? ` AND l.item_id = ? AND ${GRADE_KEY_SQL} = ? AND ${TRADE_DATE_SQL} = ?` : '';
  const params = scope ? [scope.itemId, scope.gradeKey, scope.tradeDate] : [];
  await connection.query(
    `INSERT INTO item_price_daily
       (item_id, category_id, grade_key, trade_date, trade_count, total_price, min_price, max_price, median_price, last_price, last_sold_at)
     SELECT * FROM (
       SELECT item_id, MAX(category_id) AS category_id, grade_key, trade_date,
              COUNT(*) AS trade_count, SUM(price) AS total_price, MIN(price) AS min_price, MAX(price) AS max_price,
              ROUND(AVG(CASE WHEN price_rank IN (FLOOR((day_count + 1) / 2), CEIL((day_count + 1) / 2)) THEN price END)) AS median_price,
              MAX(CASE WHEN recent_rank = 1 THEN price END) AS last_price,
              MAX(sold_at) AS last_sold_at
       FROM (
         SELECT t.*,
                ROW_NUMBER() OVER (PARTITION BY item_id, grade_key, trade_date ORDER BY price, id) AS price_rank,
                COUNT(*) OVER (PARTITION BY item_id, grade_key, trade_date) AS day_count,
                ROW_NUMBER() OVER (PARTITION BY item_id, grade_key, trade_date ORDER BY sold_at DESC, id DESC) AS recent_rank
         FROM (
           SELECT l.id, l.item_id, i.category_id, l.sold_price AS price, l.sold_at,
                  ${GRADE_KEY_SQL} AS grade_key, ${TRADE_DATE_SQL} AS trade_date
           FROM listings l
           JOIN items i ON i.id = l.item_id
           WHERE l.status = 'sold' AND l.deleted_at IS NULL${where}
         ) t
       ) ranked
       GROUP BY item_id, grade_key, trade_date
     ) AS agg
     ON DUPLICATE KEY UPDATE
       category_id = agg.category_id, trade_count = agg.trade_count, total_price = agg.total_price,
       min_price = agg.min_price, max_price = agg.max_price, median_price = agg.median_price,
       last_price = agg.last_price, last_sold_at = agg.last_sold_at`,
    params,
  );
}

/** 거래완료된 판매글 하나가 속한 품목·등급·날짜 칸을 다시 계산한다. 거래완료 처리와 같은 트랜잭션에서 부른다. */
async function refreshForListing(connection, listingId) {
  const [rows] = await connection.execute(
    `SELECT l.item_id, ${GRADE_KEY_SQL} AS grade_key, DATE_FORMAT(${TRADE_DATE_SQL}, '%Y-%m-%d') AS trade_date
     FROM listings l WHERE l.id = ? AND l.status = 'sold'`,
    [listingId],
  );
  if (rows.length === 0) return;
  const { item_id: itemId, grade_key: gradeKey, trade_date: tradeDate } = rows[0];
  await upsertDaily(connection, { itemId, gradeKey, tradeDate });
}

/** 집계표 전체를 listings에서 다시 만든다 (db:init·db:seed). 거래가 사라진 칸도 없애려고 먼저 비운다. */
async function rebuildAll(connection) {
  await connection.query('DELETE FROM item_price_daily');
  await upsertDaily(connection);
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM item_price_daily');
  return count;
}

/** 소분류 카테고리 중 fromDate(KST) 이후 거래가 있는 것과 그 거래 건수. 카테고리 정렬 순서대로. */
async function findCategoriesWithTrades(fromDate) {
  const [rows] = await pool.query(
    `SELECT c.code, c.name, SUM(d.trade_count) AS trade_count
     FROM item_price_daily d
     JOIN categories c ON c.id = d.category_id
     WHERE d.trade_date >= ? AND c.is_active = 1
     GROUP BY c.id, c.code, c.name, c.sort_order
     ORDER BY c.sort_order, c.id`,
    [fromDate],
  );
  return rows.map((row) => ({ code: row.code, name: row.name, tradeCount: Number(row.trade_count) }));
}

/** 소분류 카테고리 하나. 대분류이거나 없거나 숨김이면 null. */
async function findSubCategory(code) {
  const [rows] = await pool.execute(
    'SELECT id, code, name FROM categories WHERE code = ? AND parent_id IS NOT NULL AND is_active = 1',
    [code],
  );
  return rows.length === 0 ? null : rows[0];
}

/** 카테고리의 등급별 거래 건수 (fromDate 이후). 건수 많은 순. */
async function findGradeCounts(categoryId, fromDate) {
  const [rows] = await pool.query(
    `SELECT grade_key, SUM(trade_count) AS trade_count
     FROM item_price_daily
     WHERE category_id = ? AND trade_date >= ?
     GROUP BY grade_key
     ORDER BY trade_count DESC, grade_key`,
    [categoryId, fromDate],
  );
  return rows.map((row) => ({ gradeKey: row.grade_key, tradeCount: Number(row.trade_count) }));
}

/**
 * 카테고리(·등급)의 품목별 일별 시세 (fromDate 이후, 날짜 오름차순). 숨김 품목도 시세는 그대로 보인다.
 * q가 있으면 품목명·세트명 부분 일치(단어별 AND).
 */
async function findItemDailyRows(categoryId, gradeKey, fromDate, words = []) {
  const conditions = ['d.category_id = ?', 'd.trade_date >= ?'];
  const params = [categoryId, fromDate];
  if (gradeKey) {
    conditions.push('d.grade_key = ?');
    params.push(gradeKey);
  }
  for (const word of words) {
    conditions.push("CONCAT_WS(' ', i.name, i.set_name, i.card_no) LIKE ?");
    params.push(`%${word.replace(/[\\%_]/g, '\\$&')}%`);
  }
  const [rows] = await pool.query(
    `SELECT d.item_id, d.grade_key, DATE_FORMAT(d.trade_date, '%Y-%m-%d') AS trade_date,
            d.trade_count, d.median_price,
            i.slug, i.name, i.set_name, i.language, i.image_url
     FROM item_price_daily d
     JOIN items i ON i.id = d.item_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY d.item_id, d.grade_key, d.trade_date`,
    params,
  );
  return rows.map((row) => ({
    itemId: row.item_id,
    gradeKey: row.grade_key,
    tradeDate: row.trade_date,
    tradeCount: row.trade_count,
    medianPrice: row.median_price,
    slug: row.slug,
    name: row.name,
    setName: row.set_name,
    language: row.language,
    imageUrl: row.image_url,
  }));
}

/** 카테고리(·등급) 전체의 일별 거래 건수·체결가 합계 (fromDate 이후, 날짜 오름차순). */
async function findCategoryDailyTotals(categoryId, gradeKey, fromDate) {
  const gradeSql = gradeKey ? ' AND grade_key = ?' : '';
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(trade_date, '%Y-%m-%d') AS trade_date,
            SUM(trade_count) AS trade_count, SUM(total_price) AS total_price
     FROM item_price_daily
     WHERE category_id = ? AND trade_date >= ?${gradeSql}
     GROUP BY trade_date
     ORDER BY trade_date`,
    [categoryId, fromDate, ...(gradeKey ? [gradeKey] : [])],
  );
  return rows.map((row) => ({
    tradeDate: row.trade_date,
    tradeCount: Number(row.trade_count),
    totalPrice: Number(row.total_price),
  }));
}

module.exports = {
  refreshForListing,
  rebuildAll,
  findCategoriesWithTrades,
  findSubCategory,
  findGradeCounts,
  findItemDailyRows,
  findCategoryDailyTotals,
};

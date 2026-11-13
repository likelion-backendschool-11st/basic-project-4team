const pool = require('../config/db');

const TRADE_COUNT_DAYS = 30;

const SELECT_ITEM = `
  SELECT
    i.*,
    c.code AS category_code, c.name AS category_name,
    pc.id AS parent_category_id, pc.code AS parent_category_code, pc.name AS parent_category_name
  FROM items i
  JOIN categories c ON c.id = i.category_id
  LEFT JOIN categories pc ON pc.id = c.parent_id
`;

/** DB 행(snake_case) → API용 객체(camelCase). 시세·매물 수는 service에서 붙인다. */
function toItem(row) {
  const category = { id: row.category_id, code: row.category_code, name: row.category_name };
  const parentCategory = row.parent_category_id === null
    ? null
    : { id: row.parent_category_id, code: row.parent_category_code, name: row.parent_category_name };

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    setName: row.set_name,
    cardNo: row.card_no,
    language: row.language,
    rarity: row.rarity,
    imageUrl: row.image_url,
    category,
    // 대분류 → 소분류 순서
    breadcrumbs: parentCategory ? [parentCategory, category] : [category],
  };
}

/** 숨김(is_active = 0)이 아닌 품목. id(number) 또는 slug(string)로 찾는다. 없으면 null. */
async function findByIdOrSlug(idOrSlug) {
  const column = typeof idOrSlug === 'number' ? 'i.id' : 'i.slug';
  const [rows] = await pool.execute(`${SELECT_ITEM} WHERE ${column} = ? AND i.is_active = 1`, [idOrSlug]);
  return rows.length === 0 ? null : toItem(rows[0]);
}

/** 시세 필터(condition·gradingService·grade) 중 값이 있는 것만 WHERE 조건으로 만든다. */
function buildFilter({ condition, gradingService, grade }) {
  const conditions = [];
  const params = [];
  if (condition) {
    conditions.push('`condition` = ?');
    params.push(condition);
  }
  if (gradingService) {
    conditions.push('grading_service = ?');
    params.push(gradingService);
  }
  if (grade) {
    conditions.push('grade = ?');
    params.push(grade);
  }
  return { sql: conditions.map((c) => ` AND ${c}`).join(''), params };
}

/** 가장 최근 체결 1건 { price, soldAt }. before가 있으면 그 시각 이전 체결 중에서 찾는다. 없으면 null. */
async function findLastTrade(itemId, filter, before = null) {
  const { sql, params } = buildFilter(filter);
  const beforeSql = before ? ' AND sold_at < ?' : '';
  const [rows] = await pool.execute(
    `SELECT sold_price, sold_at FROM listings
     WHERE item_id = ? AND status = 'sold' AND deleted_at IS NULL${sql}${beforeSql}
     ORDER BY sold_at DESC, id DESC
     LIMIT 1`,
    [itemId, ...params, ...(before ? [before] : [])],
  );
  return rows.length === 0 ? null : { price: rows[0].sold_price, soldAt: rows[0].sold_at };
}

/** 최근 30일 거래완료 건수. */
async function countRecentTrades(itemId, filter) {
  const { sql, params } = buildFilter(filter);
  const [[{ tradeCount }]] = await pool.execute(
    `SELECT COUNT(*) AS tradeCount FROM listings
     WHERE item_id = ? AND status = 'sold' AND deleted_at IS NULL${sql}
       AND sold_at >= UTC_TIMESTAMP() - INTERVAL ${TRADE_COUNT_DAYS} DAY`,
    [itemId, ...params],
  );
  return tradeCount;
}

/** 현재 판매중(status = selling)인 판매글 수. */
async function countSelling(itemId, filter) {
  const { sql, params } = buildFilter(filter);
  const [[{ sellingCount }]] = await pool.execute(
    `SELECT COUNT(*) AS sellingCount FROM listings
     WHERE item_id = ? AND status = 'selling' AND deleted_at IS NULL${sql}`,
    [itemId, ...params],
  );
  return sellingCount;
}

module.exports = { findByIdOrSlug, findLastTrade, countRecentTrades, countSelling };

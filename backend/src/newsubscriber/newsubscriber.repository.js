const pool = require('../config/db');

/**
 * 품목 시세 기준가(ITEM-04)용 체결가 목록.
 * 시세 필터(condition·gradingService·grade)는 값이 있는 것만 조건으로 쓴다 — 생략하면 전체.
 * 기간 안의 체결가를 금액순으로 돌려준다 (중앙값 계산용). 30~90일치라 행 수가 많지 않다.
 */
async function findSoldPrices(itemId, { condition, gradingService, grade }, days) {
  const conditions = ["item_id = ?", "status = 'sold'", 'deleted_at IS NULL', 'sold_at >= UTC_TIMESTAMP() - INTERVAL ? DAY'];
  const params = [itemId, days];
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
  const [rows] = await pool.execute(
    `SELECT sold_price, sold_at FROM listings WHERE ${conditions.join(' AND ')} ORDER BY sold_price, sold_at`,
    params,
  );
  return rows.map((row) => ({ price: row.sold_price, soldAt: row.sold_at }));
}

/** 회원 가입 시각. 없거나 탈퇴한 회원이면 null. */
async function findJoinedAt(userId) {
  const [rows] = await pool.execute('SELECT created_at FROM users WHERE id = ? AND deleted_at IS NULL', [userId]);
  return rows.length === 0 ? null : rows[0].created_at;
}

/** 운영 설정(settings) 값 — { key: value(문자열) }. 없는 키는 빠진다. */
async function findSettings(keys) {
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings WHERE setting_key IN (?)', [keys]);
  return Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));
}

module.exports = { findSoldPrices, findJoinedAt, findSettings };

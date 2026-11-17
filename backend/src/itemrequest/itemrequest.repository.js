const pool = require('../config/db');

const SELECT_REQUEST = `
  SELECT r.id, r.status, r.title, r.body, r.reference_url, r.reject_reason, r.created_at, r.processed_at,
    c.id AS category_id, c.code AS category_code, c.name AS category_name,
    i.id AS item_id, i.slug AS item_slug, i.name AS item_name
  FROM item_requests r
  JOIN categories c ON c.id = r.category_id
  LEFT JOIN items i ON i.id = r.item_id`;

/** DB 행(snake_case) → API용 ItemRequest(camelCase). */
function toItemRequest(row) {
  return {
    id: row.id,
    status: row.status,
    category: { id: row.category_id, code: row.category_code, name: row.category_name },
    title: row.title,
    body: row.body,
    referenceUrl: row.reference_url,
    rejectReason: row.reject_reason,
    item: row.item_id === null ? null : { id: row.item_id, slug: row.item_slug, name: row.item_name },
    createdAt: row.created_at,
    processedAt: row.processed_at,
  };
}

/** 숨기지 않은 카테고리. 없으면 null. parentId가 null이면 대분류. */
async function findActiveCategory(categoryId) {
  const [rows] = await pool.execute(
    'SELECT id, parent_id FROM categories WHERE id = ? AND is_active = 1',
    [categoryId],
  );
  return rows.length === 0 ? null : { id: rows[0].id, parentId: rows[0].parent_id };
}

/** 같은 소분류에 이름이 같은 숨기지 않은 품목. 비교는 컬럼 정렬 규칙(_ai_ci)이라 대소문자를 무시한다. */
async function findActiveItemByName(categoryId, name) {
  const [rows] = await pool.execute(
    'SELECT id, slug, name FROM items WHERE category_id = ? AND name = ? AND is_active = 1 ORDER BY id LIMIT 1',
    [categoryId, name],
  );
  return rows[0] ?? null;
}

/** 내 대기 중 요청 중 같은 소분류 + 같은 제목이 있는지. */
async function hasPendingDuplicate(userId, categoryId, title) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM item_requests
     WHERE user_id = ? AND category_id = ? AND title = ? AND status = 'pending' LIMIT 1`,
    [userId, categoryId, title],
  );
  return rows.length > 0;
}

/** 요청 저장 후 ItemRequest로 돌려준다. */
async function create({ userId, categoryId, title, body, referenceUrl }) {
  const [result] = await pool.execute(
    'INSERT INTO item_requests (user_id, category_id, title, body, reference_url) VALUES (?, ?, ?, ?, ?)',
    [userId, categoryId, title, body, referenceUrl],
  );
  const [[row]] = await pool.execute(`${SELECT_REQUEST} WHERE r.id = ?`, [result.insertId]);
  return toItemRequest(row);
}

/** 내 요청 목록 (최신순). status가 null이면 전체. */
async function listByUser(userId, { status, page, size }) {
  const where = ['r.user_id = ?'];
  const params = [userId];
  if (status) {
    where.push('r.status = ?');
    params.push(status);
  }
  const whereSql = where.join(' AND ');
  const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM item_requests r WHERE ${whereSql}`, params);
  const [rows] = await pool.query(
    `${SELECT_REQUEST} WHERE ${whereSql} ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?`,
    [...params, size, (page - 1) * size],
  );
  return { items: rows.map(toItemRequest), totalCount: Number(count) };
}

module.exports = { findActiveCategory, findActiveItemByName, hasPendingDuplicate, create, listByUser };

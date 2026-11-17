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

/* ───────── 관리자 (ITEM-08·09, #34) ───────── */

// 관리자 목록은 요청자 닉네임을 더 붙인다
const SELECT_ADMIN_REQUEST = `
  SELECT r.id, r.status, r.title, r.body, r.reference_url, r.reject_reason, r.created_at, r.processed_at,
    c.id AS category_id, c.code AS category_code, c.name AS category_name,
    i.id AS item_id, i.slug AS item_slug, i.name AS item_name,
    u.id AS requester_id, u.nickname AS requester_nickname, u.deleted_at AS requester_deleted_at
  FROM item_requests r
  JOIN categories c ON c.id = r.category_id
  JOIN users u ON u.id = r.user_id
  LEFT JOIN items i ON i.id = r.item_id`;

function toAdminItemRequest(row) {
  return {
    ...toItemRequest(row),
    requester: { id: row.requester_id, nickname: row.requester_deleted_at ? null : row.requester_nickname },
  };
}

/** 관리자 목록. 대기 중은 오래된 순(먼저 온 것부터 처리), 그 외는 최신순. status가 null이면 전체. */
async function listAll({ status, page, size }) {
  const whereSql = status ? 'WHERE r.status = ?' : '';
  const params = status ? [status] : [];
  const order = status === 'pending' ? 'r.created_at ASC, r.id ASC' : 'r.created_at DESC, r.id DESC';
  const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM item_requests r ${whereSql}`, params);
  const [rows] = await pool.query(`${SELECT_ADMIN_REQUEST} ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`, [
    ...params,
    size,
    (page - 1) * size,
  ]);
  return { items: rows.map(toAdminItemRequest), totalCount: Number(count) };
}

async function findAdminById(id) {
  const [[row]] = await pool.execute(`${SELECT_ADMIN_REQUEST} WHERE r.id = ?`, [id]);
  return row ? toAdminItemRequest(row) : null;
}

async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** 처리할 요청을 잠그고 읽는다 — 두 관리자가 동시에 처리하지 못하게. 카드 여부 판단용 대분류 code도 함께. */
async function findForUpdate(conn, id) {
  const [[row]] = await conn.execute(
    `SELECT r.id, r.status, r.title, r.category_id, pc.code AS parent_code
     FROM item_requests r
     JOIN categories c ON c.id = r.category_id
     LEFT JOIN categories pc ON pc.id = c.parent_id
     WHERE r.id = ? FOR UPDATE`,
    [id],
  );
  return row ? { id: row.id, status: row.status, title: row.title, categoryId: row.category_id, parentCode: row.parent_code } : null;
}

async function findActiveItemById(conn, id) {
  const [[row]] = await conn.execute('SELECT id, slug, name FROM items WHERE id = ? AND is_active = 1', [id]);
  return row ?? null;
}

/**
 * 새로 만들 품목과 겹치는 기존 품목: 같은 소분류에 이름이 같거나, 세트명·카드번호·언어가 모두 같은 카드(uk_items_card).
 * 카드 기준은 세 값이 모두 있을 때만 본다 (UNIQUE는 NULL끼리 비교하지 않으므로).
 */
async function findConflictingItem(conn, { categoryId, name, setName, cardNo, language }) {
  const [rows] = await conn.execute(
    `SELECT id, slug, name FROM items
     WHERE category_id = ? AND is_active = 1
       AND (name = ? OR (? IS NOT NULL AND ? IS NOT NULL AND ? IS NOT NULL AND set_name = ? AND card_no = ? AND language = ?))
     ORDER BY id LIMIT 1`,
    [categoryId, name, setName, cardNo, language, setName, cardNo, language],
  );
  return rows[0] ?? null;
}

/** 요청 내용으로 공식 품목을 만든다. slug는 요청 id로 만들어 겹치지 않게 한다 (한글 이름은 URL용으로 바꾸기 어려워서). */
async function insertItem(conn, { requestId, categoryId, name, setName, cardNo, language, rarity, imageUrl }) {
  const [result] = await conn.execute(
    `INSERT INTO items (category_id, slug, name, set_name, card_no, language, rarity, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, `item-request-${requestId}`, name, setName, cardNo, language, rarity, imageUrl],
  );
  return result.insertId;
}

/**
 * 승인: 이 요청 + 같은 소분류·같은 제목으로 대기 중인 다른 사람의 요청을 함께 같은 품목으로 승인한다.
 * 제목 비교는 컬럼 정렬 규칙(_ai_ci)이라 대소문자를 무시한다. 승인된 요청 수를 돌려준다.
 */
async function approveWithSameTitle(conn, { categoryId, title, itemId, adminId }) {
  const [result] = await conn.execute(
    `UPDATE item_requests
     SET status = 'approved', item_id = ?, reject_reason = NULL, processed_by = ?, processed_at = UTC_TIMESTAMP()
     WHERE category_id = ? AND title = ? AND status = 'pending'`,
    [itemId, adminId, categoryId, title],
  );
  return result.affectedRows;
}

async function reject(conn, { id, adminId, rejectReason }) {
  await conn.execute(
    `UPDATE item_requests
     SET status = 'rejected', reject_reason = ?, processed_by = ?, processed_at = UTC_TIMESTAMP()
     WHERE id = ? AND status = 'pending'`,
    [rejectReason, adminId, id],
  );
}

module.exports = {
  findActiveCategory,
  findActiveItemByName,
  hasPendingDuplicate,
  create,
  listByUser,
  listAll,
  findAdminById,
  withTransaction,
  findForUpdate,
  findActiveItemById,
  findConflictingItem,
  insertItem,
  approveWithSameTitle,
  reject,
};

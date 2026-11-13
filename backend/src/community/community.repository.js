const pool = require('../config/db');

// 사용자 입력을 SQL에 그대로 넣지 않도록 정렬 키 → ORDER BY 절을 고정해 둔다.
const ORDER_BY = {
  latest: 'p.created_at DESC, p.id DESC',
  popular: '(p.reaction_count + p.comment_count) DESC, p.created_at DESC, p.id DESC',
};

// camelCase 필드 → 컬럼. update에서 이 목록에 있는 필드만 SET 절에 들어간다.
// item_id는 수정 불가(REQ-BEDIT-001)라 목록에 넣지 않는다.
const UPDATABLE_COLUMNS = {
  board: 'board',
  tag: 'tag',
  title: 'title',
  body: 'body',
};

const SELECT_POST = `
  SELECT p.*, u.nickname AS author_nickname
  FROM posts p
  JOIN users u ON u.id = p.user_id
`;

/** DB 행(snake_case) → API용 객체(camelCase). */
function toPost(row) {
  return {
    id: row.id,
    board: row.board,
    tag: row.tag,
    itemId: row.item_id,
    title: row.title,
    body: row.body,
    author: { id: row.user_id, nickname: row.author_nickname },
    reactionCount: row.reaction_count,
    commentCount: row.comment_count,
    editedAt: row.edited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildWhere({ board, itemId, tag }) {
  const conditions = ['p.deleted_at IS NULL'];
  const params = [];
  if (board) {
    conditions.push('p.board = ?');
    params.push(board);
  }
  if (itemId) {
    conditions.push('p.item_id = ?');
    params.push(itemId);
  }
  if (tag) {
    conditions.push('p.tag = ?');
    params.push(tag);
  }
  return { where: `WHERE ${conditions.join(' AND ')}`, params };
}

/** 목록 조회. { posts, totalCount } 반환. */
async function findMany({ board, itemId, tag, sort, limit, offset }) {
  const { where, params } = buildWhere({ board, itemId, tag });
  // LIMIT/OFFSET 플레이스홀더는 execute(서버 prepared statement)에서 타입 오류가 나서 query로 실행한다.
  // query도 ?를 이스케이프해서 채우므로 SQL 인젝션에는 안전하다.
  const [rows] = await pool.query(
    `${SELECT_POST} ${where} ORDER BY ${ORDER_BY[sort]} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [[{ totalCount }]] = await pool.query(
    `SELECT COUNT(*) AS totalCount FROM posts p ${where}`,
    params,
  );
  return { posts: rows.map(toPost), totalCount };
}

async function findById(id) {
  const [rows] = await pool.execute(`${SELECT_POST} WHERE p.id = ? AND p.deleted_at IS NULL`, [id]);
  return rows.length === 0 ? null : toPost(rows[0]);
}

async function create({ userId, board, tag, itemId, title, body }) {
  const [result] = await pool.execute(
    'INSERT INTO posts (user_id, board, tag, item_id, title, body) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, board, tag ?? null, itemId ?? null, title ?? null, body],
  );
  return findById(result.insertId);
}

/** fields에 들어 있는 키만 수정한다. (undefined는 건너뛰고 null은 비운다) */
async function update(id, fields) {
  const entries = Object.entries(fields).filter(
    ([key, value]) => UPDATABLE_COLUMNS[key] && value !== undefined,
  );
  if (entries.length > 0) {
    // edited_at은 "(수정됨)" 표시용(REQ-BEDIT-004). updated_at은 집계 갱신 때도 바뀌어 쓸 수 없다.
    const setClause = [
      ...entries.map(([key]) => `${UPDATABLE_COLUMNS[key]} = ?`),
      'edited_at = CURRENT_TIMESTAMP',
    ].join(', ');
    await pool.execute(
      `UPDATE posts SET ${setClause} WHERE id = ? AND deleted_at IS NULL`,
      [...entries.map(([, value]) => value), id],
    );
  }
  return findById(id);
}

async function softDelete(id) {
  await pool.execute('UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL', [id]);
}

module.exports = { findMany, findById, create, update, softDelete };

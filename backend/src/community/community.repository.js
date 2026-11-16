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

// 작성자가 이 품목을 "보유"했는지: 판매중·예약중 판매글이 있거나, 거래완료 판매글의 구매자.
const OWNER_EXISTS = `EXISTS (
  SELECT 1 FROM listings l JOIN items i ON i.id = l.item_id
  WHERE i.slug = p.item_id AND l.deleted_at IS NULL
    AND ((l.seller_id = p.user_id AND l.status IN ('selling', 'reserved'))
      OR (l.buyer_id = p.user_id AND l.status = 'sold'))
)`;

function buildWhere({ board, itemId, tag, ownerOnly }) {
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
  if (ownerOnly) conditions.push(OWNER_EXISTS);
  return { where: `WHERE ${conditions.join(' AND ')}`, params };
}

/** 목록 조회. { posts, totalCount } 반환. */
async function findMany({ board, itemId, tag, ownerOnly, sort, limit, offset }) {
  const { where, params } = buildWhere({ board, itemId, tag, ownerOnly });
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

const REACTION_TYPES = ['fire', 'surprised', 'laugh', 'ice'];

/** 글별 이모지 개수 Map<postId, { fire, surprised, laugh, ice }>. */
async function countReactions(postIds) {
  const result = new Map(postIds.map((id) => [id, Object.fromEntries(REACTION_TYPES.map((t) => [t, 0]))]));
  if (postIds.length === 0) return result;
  const [rows] = await pool.query(
    'SELECT post_id, type, COUNT(*) AS cnt FROM post_reactions WHERE post_id IN (?) GROUP BY post_id, type',
    [postIds],
  );
  rows.forEach((r) => {
    result.get(r.post_id)[r.type] = Number(r.cnt);
  });
  return result;
}

/** 사용자가 각 글에 남긴 이모지 Map<postId, type>. */
async function findMyReactions(userId, postIds) {
  if (!userId || postIds.length === 0) return new Map();
  const [rows] = await pool.query(
    'SELECT post_id, type FROM post_reactions WHERE user_id = ? AND post_id IN (?)',
    [userId, postIds],
  );
  return new Map(rows.map((r) => [r.post_id, r.type]));
}

/** 글별 사진 Map<postId, [{ id, url }]> (sort_order 순). */
async function findImages(postIds) {
  const result = new Map(postIds.map((id) => [id, []]));
  if (postIds.length === 0) return result;
  const [rows] = await pool.query(
    'SELECT id, post_id, url FROM post_images WHERE post_id IN (?) ORDER BY post_id, sort_order',
    [postIds],
  );
  rows.forEach((r) => result.get(r.post_id).push({ id: r.id, url: r.url }));
  return result;
}

/**
 * 작성자 배지 Map<"slug:userId", { owner, trade }>.
 * owner = 이 품목 판매중·예약중 판매글이 있거나 거래완료 판매글의 구매자, trade = 이 품목 거래완료(판매·구매) 이력.
 */
async function findAuthorBadges(pairs) {
  const result = new Map();
  if (pairs.length === 0) return result;
  const slugs = [...new Set(pairs.map((x) => x.slug))];
  const userIds = [...new Set(pairs.map((x) => x.userId))];
  const [rows] = await pool.query(
    `SELECT i.slug, l.seller_id, l.buyer_id, l.status
     FROM listings l JOIN items i ON i.id = l.item_id
     WHERE i.slug IN (?) AND l.deleted_at IS NULL AND (l.seller_id IN (?) OR l.buyer_id IN (?))`,
    [slugs, userIds, userIds],
  );
  const mark = (slug, userId, key) => {
    const k = `${slug}:${userId}`;
    const v = result.get(k) ?? { owner: false, trade: false };
    v[key] = true;
    result.set(k, v);
  };
  rows.forEach((r) => {
    if (r.status === 'sold') {
      mark(r.slug, r.seller_id, 'trade');
      if (r.buyer_id !== null) {
        mark(r.slug, r.buyer_id, 'trade');
        mark(r.slug, r.buyer_id, 'owner');
      }
    } else {
      mark(r.slug, r.seller_id, 'owner');
    }
  });
  return result;
}

/** 이모지 남기기·바꾸기 (글당 1인 1개). posts.reaction_count를 같은 트랜잭션에서 맞춘다. */
async function upsertReaction(userId, postId, type) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // mysql2는 FOUND_ROWS 플래그를 켜서 ON DUPLICATE KEY의 affectedRows로는 "변화 없음"을 구분할 수 없다.
    const [rows] = await conn.execute(
      'SELECT type FROM post_reactions WHERE user_id = ? AND post_id = ? FOR UPDATE',
      [userId, postId],
    );
    if (rows.length === 0) {
      await conn.execute('INSERT INTO post_reactions (user_id, post_id, type) VALUES (?, ?, ?)', [userId, postId, type]);
      await conn.execute('UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = ?', [postId]);
    } else if (rows[0].type !== type) {
      await conn.execute('UPDATE post_reactions SET type = ? WHERE user_id = ? AND post_id = ?', [type, userId, postId]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** 이모지 취소. 지운 행이 있을 때만 reaction_count − 1. */
async function deleteReaction(userId, postId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute('DELETE FROM post_reactions WHERE user_id = ? AND post_id = ?', [userId, postId]);
    if (result.affectedRows > 0) {
      await conn.execute(
        'UPDATE posts SET reaction_count = GREATEST(reaction_count, 1) - 1 WHERE id = ?',
        [postId],
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  findMany,
  findById,
  create,
  update,
  softDelete,
  countReactions,
  findMyReactions,
  findImages,
  findAuthorBadges,
  upsertReaction,
  deleteReaction,
  REACTION_TYPES,
};

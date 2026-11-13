const pool = require('../config/db');

const DELETED_USER_NICKNAME = '탈퇴한 회원';

const SELECT_COMMENT = `
  SELECT c.*, u.nickname AS author_nickname, u.deleted_at AS author_deleted_at
  FROM comments c
  JOIN users u ON u.id = c.user_id
`;

// 삭제된 댓글이라도 살아 있는 답글이 있으면 목록에 "삭제된 댓글입니다"로 남긴다.
const VISIBLE_TOP_LEVEL = `(c.deleted_at IS NULL OR EXISTS (
  SELECT 1 FROM comments r WHERE r.parent_id = c.id AND r.deleted_at IS NULL
))`;

/** DB 행(snake_case) → API용 Comment(camelCase). 삭제된 댓글은 작성자·본문을 숨긴다. isMine은 service에서 붙인다. */
function toComment(row) {
  const isDeleted = row.deleted_at !== null;
  return {
    id: row.id,
    postId: row.post_id,
    parentId: row.parent_id,
    author: isDeleted
      ? null
      : {
        id: row.user_id,
        nickname: row.author_deleted_at === null ? row.author_nickname : DELETED_USER_NICKNAME,
        // 보유자·거래 인증 데이터가 아직 없어 항상 빈 배열
        badges: [],
      },
    body: isDeleted ? null : row.body,
    isDeleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 삭제되지 않은 게시글이 있는지. */
async function existsPost(postId) {
  const [rows] = await pool.execute('SELECT 1 FROM posts WHERE id = ? AND deleted_at IS NULL', [postId]);
  return rows.length > 0;
}

async function findPostCommentCount(postId) {
  const [[row]] = await pool.execute('SELECT comment_count FROM posts WHERE id = ?', [postId]);
  return row ? row.comment_count : 0;
}

/** 댓글 1건(삭제 여부와 관계없이). 없으면 null. 원본 행을 돌려준다 — 권한·상태 검사용. */
async function findRawById(commentId) {
  const [rows] = await pool.execute(`${SELECT_COMMENT} WHERE c.id = ?`, [commentId]);
  return rows[0] ?? null;
}

/** 게시글의 댓글(답글 제외)을 오래된 순으로. cursor는 직전 페이지 마지막 댓글 id. */
async function findTopLevel(postId, { cursor, limit }) {
  // LIMIT 플레이스홀더는 execute에서 타입 오류가 나서 query로 실행한다 (?는 이스케이프됨).
  const [rows] = await pool.query(
    `${SELECT_COMMENT}
     WHERE c.post_id = ? AND c.parent_id IS NULL AND c.id > ? AND ${VISIBLE_TOP_LEVEL}
     ORDER BY c.id
     LIMIT ?`,
    [postId, cursor, limit],
  );
  return rows;
}

/** 살아 있는 답글을 오래된 순으로. cursor는 직전 페이지 마지막 답글 id. */
async function findReplies(parentId, { cursor, limit }) {
  const [rows] = await pool.query(
    `${SELECT_COMMENT}
     WHERE c.parent_id = ? AND c.id > ? AND c.deleted_at IS NULL
     ORDER BY c.id
     LIMIT ?`,
    [parentId, cursor, limit],
  );
  return rows;
}

/** 여러 댓글의 답글 미리보기(댓글마다 앞에서 previewSize개)와 답글 수. */
async function findReplyPreviews(parentIds, previewSize) {
  if (parentIds.length === 0) return { previews: [], counts: new Map() };
  const [previews] = await pool.query(
    `SELECT * FROM (
       SELECT c.*, u.nickname AS author_nickname, u.deleted_at AS author_deleted_at,
         ROW_NUMBER() OVER (PARTITION BY c.parent_id ORDER BY c.id) AS rn
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.parent_id IN (?) AND c.deleted_at IS NULL
     ) t
     WHERE t.rn <= ?
     ORDER BY t.id`,
    [parentIds, previewSize],
  );
  const [countRows] = await pool.query(
    `SELECT parent_id, COUNT(*) AS cnt FROM comments
     WHERE parent_id IN (?) AND deleted_at IS NULL
     GROUP BY parent_id`,
    [parentIds],
  );
  return { previews, counts: new Map(countRows.map((r) => [r.parent_id, r.cnt])) };
}

/** 살아 있는 답글이 있는지 — 삭제된 부모 댓글을 목록에 남길지 판단. */
async function hasLiveReplies(commentId) {
  const [rows] = await pool.execute(
    'SELECT 1 FROM comments WHERE parent_id = ? AND deleted_at IS NULL LIMIT 1',
    [commentId],
  );
  return rows.length > 0;
}

/** 댓글 작성 + posts.comment_count + 1을 한 트랜잭션으로. 새 댓글 id와 작성 후 댓글 수를 돌려준다. */
async function create({ postId, userId, parentId, body }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'INSERT INTO comments (post_id, user_id, parent_id, body) VALUES (?, ?, ?, ?)',
      [postId, userId, parentId, body],
    );
    await connection.execute('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [postId]);
    const [[{ comment_count: commentCount }]] = await connection.execute(
      'SELECT comment_count FROM posts WHERE id = ?',
      [postId],
    );
    await connection.commit();
    return { id: result.insertId, commentCount };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateBody(commentId, body) {
  await pool.execute('UPDATE comments SET body = ? WHERE id = ? AND deleted_at IS NULL', [body, commentId]);
}

/** 소프트 삭제 + posts.comment_count - 1을 한 트랜잭션으로. */
async function softDelete(commentId, postId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
      [commentId],
    );
    // 동시에 두 번 삭제 요청이 와도 한 번만 줄인다.
    if (result.affectedRows === 1) {
      await connection.execute(
        'UPDATE posts SET comment_count = GREATEST(comment_count, 1) - 1 WHERE id = ?',
        [postId],
      );
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {

  toComment,
  existsPost,
  findPostCommentCount,
  findRawById,
  findTopLevel,
  findReplies,
  findReplyPreviews,
  hasLiveReplies,
  create,
  updateBody,
  softDelete,
};

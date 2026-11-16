const pool = require('../config/db');

const EXCERPT_MAX = 40;

/** 알림 여러 건 저장. db는 pool 또는 트랜잭션 connection. */
async function insertMany(db, rows) {
  if (rows.length === 0) return;
  const values = rows.map((r) => [
    r.userId, r.type, r.actorId ?? null, r.postId ?? null, r.commentId ?? null,
    r.listingId ?? null, r.oldPrice ?? null, r.newPrice ?? null,
  ]);
  await db.query(
    `INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id, listing_id, old_price, new_price)
     VALUES ?`,
    [values],
  );
}

/** 이 판매글을 찜한 회원 id (판매자 제외). */
async function findWisherIds(connection, listingId, sellerId) {
  const [rows] = await connection.execute(
    'SELECT user_id FROM wishes WHERE listing_id = ? AND user_id <> ?',
    [listingId, sellerId],
  );
  return rows.map((r) => r.user_id);
}

/** 댓글 알림을 만들 때 필요한 글·부모 댓글 작성자. */
async function findCommentTargets(postId, parentId) {
  const [[post]] = await pool.execute('SELECT user_id FROM posts WHERE id = ?', [postId]);
  let parentAuthorId = null;
  if (parentId !== null) {
    const [[parent]] = await pool.execute('SELECT user_id FROM comments WHERE id = ?', [parentId]);
    parentAuthorId = parent?.user_id ?? null;
  }
  return { postAuthorId: post?.user_id ?? null, parentAuthorId };
}

// 대상(글·댓글·판매글)이 삭제된 알림은 보여주지 않는다.
const VISIBLE_SQL = `
  (n.post_id IS NULL OR p.deleted_at IS NULL)
  AND (n.comment_id IS NULL OR c.deleted_at IS NULL)
  AND (n.listing_id IS NULL OR l.deleted_at IS NULL)`;

const FROM_SQL = `
  FROM notifications n
  LEFT JOIN users a    ON a.id = n.actor_id
  LEFT JOIN posts p    ON p.id = n.post_id
  LEFT JOIN comments c ON c.id = n.comment_id
  LEFT JOIN listings l ON l.id = n.listing_id`;

const excerpt = (text) => {
  if (text === null || text === undefined) return null;
  const oneLine = String(text).replace(/\s+/g, ' ').trim();
  return oneLine.length > EXCERPT_MAX ? `${oneLine.slice(0, EXCERPT_MAX)}…` : oneLine;
};

const toNotification = (row) => ({
  id: row.id,
  type: row.type,
  isRead: row.read_at !== null,
  createdAt: row.created_at,
  actor: row.actor_id === null ? null : { id: row.actor_id, nickname: row.actor_nickname },
  post: row.post_id === null ? null : { id: row.post_id, itemId: row.post_item_id, board: row.post_board },
  comment: row.comment_id === null ? null : { id: row.comment_id, excerpt: excerpt(row.comment_body) },
  listing: row.listing_id === null
    ? null
    : { id: row.listing_id, title: row.listing_title, status: row.listing_status, thumbnailUrl: row.listing_thumbnail },
  oldPrice: row.old_price,
  newPrice: row.new_price,
});

/** 최근 알림 size건 (최신순). */
async function findRecent(userId, size) {
  const [rows] = await pool.query(
    `SELECT n.*, a.nickname AS actor_nickname,
       p.item_id AS post_item_id, p.board AS post_board,
       c.body AS comment_body,
       l.title AS listing_title, l.status AS listing_status,
       COALESCE((SELECT li.url FROM listing_images li
         WHERE li.listing_id = l.id AND li.type = 'photo' AND li.sort_order = 0), li_item.image_url) AS listing_thumbnail
     ${FROM_SQL}
     LEFT JOIN items li_item ON li_item.id = l.item_id
     WHERE n.user_id = ? AND ${VISIBLE_SQL}
     ORDER BY n.created_at DESC, n.id DESC
     LIMIT ?`,
    [userId, size],
  );
  return rows.map(toNotification);
}

async function countUnread(userId) {
  const [[{ count }]] = await pool.execute(
    `SELECT COUNT(*) AS count ${FROM_SQL} WHERE n.user_id = ? AND n.read_at IS NULL AND ${VISIBLE_SQL}`,
    [userId],
  );
  return Number(count);
}

/** 내 알림 하나를 읽음 처리. 내 알림이 아니면 false. */
async function markRead(userId, notificationId) {
  const [result] = await pool.execute(
    'UPDATE notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ? AND user_id = ?',
    [notificationId, userId],
  );
  return result.affectedRows === 1;
}

async function markAllRead(userId) {
  await pool.execute('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL', [userId]);
}

module.exports = { insertMany, findWisherIds, findCommentTargets, findRecent, countUnread, markRead, markAllRead };

const pool = require('../config/db');

// 판매글 대표 사진. 없으면 공식 품목 이미지로 대신한다 (찜 목록과 같은 규칙).
const THUMBNAIL_SQL = `COALESCE((SELECT li.url FROM listing_images li
  WHERE li.listing_id = l.id AND li.type = 'photo' AND li.sort_order = 0), i.image_url)`;

/** 프로필 + 닉네임 변경 시각. */
async function findProfile(userId) {
  const [rows] = await pool.execute(
    `SELECT id, login_id, nickname, email, profile_image_url, nickname_changed_at, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
    [userId],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    loginId: r.login_id,
    nickname: r.nickname,
    email: r.email,
    profileImageUrl: r.profile_image_url,
    createdAt: r.created_at,
    nicknameChangedAt: r.nickname_changed_at,
  };
}

/** 마이페이지 상단 숫자. 한 번의 왕복으로 모두 센다. */
async function countActivity(userId) {
  const [[row]] = await pool.execute(
    `SELECT
       (SELECT COUNT(*) FROM listings WHERE seller_id = ? AND deleted_at IS NULL AND status = 'selling')  AS selling,
       (SELECT COUNT(*) FROM listings WHERE seller_id = ? AND deleted_at IS NULL AND status = 'reserved') AS reserved,
       (SELECT COUNT(*) FROM listings WHERE seller_id = ? AND deleted_at IS NULL AND status = 'sold')     AS sold,
       (SELECT COUNT(*) FROM listings WHERE buyer_id = ? AND status = 'sold')                             AS purchased,
       (SELECT COUNT(*) FROM wishes w JOIN listings l ON l.id = w.listing_id
          WHERE w.user_id = ? AND l.deleted_at IS NULL)                                                   AS wishes,
       (SELECT COUNT(*) FROM posts WHERE user_id = ? AND deleted_at IS NULL)                             AS posts,
       (SELECT COUNT(*) FROM comments c JOIN posts p ON p.id = c.post_id
          WHERE c.user_id = ? AND c.deleted_at IS NULL AND p.deleted_at IS NULL)                          AS comments,
       (SELECT COALESCE(SUM(sold_price), 0) FROM listings
          WHERE seller_id = ? AND deleted_at IS NULL AND status = 'sold')                                 AS sold_amount`,
    Array(8).fill(userId),
  );
  return {
    selling: Number(row.selling),
    reserved: Number(row.reserved),
    sold: Number(row.sold),
    purchased: Number(row.purchased),
    wishes: Number(row.wishes),
    posts: Number(row.posts),
    comments: Number(row.comments),
    soldAmount: Number(row.sold_amount),
  };
}

/** 내 판매글. status가 null이면 전체. 판매중·예약중을 먼저, 그다음 최신순. */
async function findMyListings(userId, { status, page, size }) {
  const where = ['l.seller_id = ?', 'l.deleted_at IS NULL'];
  const params = [userId];
  if (status) {
    where.push('l.status = ?');
    params.push(status);
  }
  const whereSql = where.join(' AND ');
  const [rows] = await pool.query(
    `SELECT l.id, l.registration_no, l.title, l.price, l.status, l.view_count, l.wish_count,
            l.sold_price, l.sold_at, l.created_at, i.name AS item_name, ${THUMBNAIL_SQL} AS thumbnail_url
       FROM listings l JOIN items i ON i.id = l.item_id
      WHERE ${whereSql}
      ORDER BY FIELD(l.status, 'selling', 'reserved', 'sold'), l.created_at DESC, l.id DESC
      LIMIT ? OFFSET ?`,
    [...params, size, (page - 1) * size],
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM listings l WHERE ${whereSql}`, params);
  return {
    items: rows.map((r) => ({
      listingId: r.id,
      registrationNo: r.registration_no,
      title: r.title,
      itemName: r.item_name,
      price: r.price,
      status: r.status,
      thumbnailUrl: r.thumbnail_url,
      viewCount: r.view_count,
      wishCount: r.wish_count,
      soldPrice: r.sold_price,
      soldAt: r.sold_at,
      createdAt: r.created_at,
    })),
    totalCount: Number(total),
  };
}

/** 내가 산 판매글 (거래완료 + buyer_id = 나). 거래 기록이라 판매자가 지운 글도 보여준다. */
async function findMyPurchases(userId, { page, size }) {
  const [rows] = await pool.query(
    `SELECT l.id, l.registration_no, l.title, l.sold_price, l.sold_at, l.deleted_at,
            i.name AS item_name, ${THUMBNAIL_SQL} AS thumbnail_url,
            u.id AS seller_id, u.nickname AS seller_nickname, u.deleted_at AS seller_deleted_at
       FROM listings l
       JOIN items i ON i.id = l.item_id
       JOIN users u ON u.id = l.seller_id
      WHERE l.buyer_id = ? AND l.status = 'sold'
      ORDER BY l.sold_at DESC, l.id DESC
      LIMIT ? OFFSET ?`,
    [userId, size, (page - 1) * size],
  );
  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM listings WHERE buyer_id = ? AND status = 'sold'`,
    [userId],
  );
  return {
    items: rows.map((r) => ({
      listingId: r.id,
      registrationNo: r.registration_no,
      title: r.title,
      itemName: r.item_name,
      thumbnailUrl: r.thumbnail_url,
      soldPrice: r.sold_price,
      soldAt: r.sold_at,
      isDeleted: r.deleted_at !== null,
      seller: { id: r.seller_id, nickname: r.seller_deleted_at ? null : r.seller_nickname },
    })),
    totalCount: Number(total),
  };
}

/** 내가 쓴 토론글 (최신순). */
async function findMyPosts(userId, { page, size }) {
  const [rows] = await pool.query(
    `SELECT p.id, p.board, p.tag, p.item_id, p.title, p.body, p.reaction_count, p.comment_count, p.created_at,
            i.name AS item_name
       FROM posts p LEFT JOIN items i ON i.slug = p.item_id
      WHERE p.user_id = ? AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ? OFFSET ?`,
    [userId, size, (page - 1) * size],
  );
  const [[{ total }]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM posts WHERE user_id = ? AND deleted_at IS NULL',
    [userId],
  );
  return {
    items: rows.map((r) => ({
      postId: r.id,
      board: r.board,
      tag: r.tag,
      itemId: r.item_id,
      itemName: r.item_name,
      title: r.title,
      body: r.body,
      reactionCount: r.reaction_count,
      commentCount: r.comment_count,
      createdAt: r.created_at,
    })),
    totalCount: Number(total),
  };
}

/** 내가 쓴 댓글·답글 (최신순). 글이 지워진 댓글은 뺀다 — 이동할 곳이 없다. */
async function findMyComments(userId, { page, size }) {
  const [rows] = await pool.query(
    `SELECT c.id, c.body, c.parent_id, c.like_count, c.created_at,
            p.id AS post_id, p.board, p.item_id, p.title AS post_title, p.body AS post_body
       FROM comments c JOIN posts p ON p.id = c.post_id
      WHERE c.user_id = ? AND c.deleted_at IS NULL AND p.deleted_at IS NULL
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT ? OFFSET ?`,
    [userId, size, (page - 1) * size],
  );
  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM comments c JOIN posts p ON p.id = c.post_id
      WHERE c.user_id = ? AND c.deleted_at IS NULL AND p.deleted_at IS NULL`,
    [userId],
  );
  return {
    items: rows.map((r) => ({
      commentId: r.id,
      body: r.body,
      isReply: r.parent_id !== null,
      likeCount: r.like_count,
      createdAt: r.created_at,
      post: {
        id: r.post_id,
        board: r.board,
        itemId: r.item_id,
        // 제목 없는 글(피드 글)은 본문 앞부분을 제목처럼 쓴다
        title: r.post_title || r.post_body.slice(0, 40),
      },
    })),
    totalCount: Number(total),
  };
}

/** 닉네임 중복 확인 (탈퇴 회원 포함 — UNIQUE 제약과 같은 범위). 나 자신은 제외. */
async function isNicknameTaken(nickname, exceptUserId) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE nickname = ? AND id <> ? LIMIT 1', [nickname, exceptUserId]);
  return rows.length > 0;
}

async function updateNickname(userId, nickname) {
  await pool.execute(
    'UPDATE users SET nickname = ?, nickname_changed_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL',
    [nickname, userId],
  );
}

async function findPasswordHash(userId) {
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL', [userId]);
  return rows.length === 0 ? null : rows[0].password_hash;
}

async function updatePasswordHash(userId, passwordHash) {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL', [passwordHash, userId]);
}

module.exports = {
  findProfile,
  countActivity,
  findMyListings,
  findMyPurchases,
  findMyPosts,
  findMyComments,
  isNicknameTaken,
  updateNickname,
  findPasswordHash,
  updatePasswordHash,
};

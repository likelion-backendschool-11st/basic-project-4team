const pool = require('../config/db');

/**
 * SQL의 :이름 자리를 ?로 바꾸고 값 배열을 만든다. 보는 사람(:uid)이 쿼리에 여러 번 나와서 쓴다.
 * (mysql2의 namedPlaceholders는 처음 쓸 때 모듈을 늦게 불러와 node --watch가 재시작하는 문제가 있어 직접 바꾼다.)
 */
function bind(sql, values) {
  const params = [];
  const text = sql.replace(/:([a-zA-Z]+)/g, (match, name) => {
    if (!(name in values)) throw new Error(`SQL 자리표시자 값 없음: ${name}`);
    params.push(values[name]);
    return '?';
  });
  return [text, params];
}

/** 판매글 기본 정보 (채팅방 만들기 검사용). 삭제된 판매글도 돌려준다. 없으면 null. */
async function findListing(listingId) {
  const [rows] = await pool.execute('SELECT id, seller_id, status, deleted_at FROM listings WHERE id = ?', [listingId]);
  return rows[0] ?? null;
}

async function findRoomId(listingId, buyerId) {
  const [rows] = await pool.execute('SELECT id FROM chat_rooms WHERE listing_id = ? AND buyer_id = ?', [listingId, buyerId]);
  return rows[0]?.id ?? null;
}

/** 방을 만든다. 같은 판매글·구매자의 방이 이미 있으면(동시 요청) null. */
async function insertRoom({ listingId, buyerId, sellerId }) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO chat_rooms (listing_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [listingId, buyerId, sellerId],
    );
    return result.insertId;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return null;
    throw err;
  }
}

/** 참여자 확인용 원본 행. 내가 구매자·판매자가 아니면 null. */
async function findMembership(roomId, userId) {
  const [rows] = await pool.execute(
    'SELECT id, buyer_id, seller_id, last_message_id FROM chat_rooms WHERE id = ? AND (buyer_id = ? OR seller_id = ?)',
    [roomId, userId, userId],
  );
  return rows[0] ?? null;
}

// 보는 사람(:uid) 기준의 방 정보 — 상대방, 내 역할, 마지막 메시지, 안 읽은 수, 상대가 읽은 위치.
const ROOM_SELECT = `
  SELECT
    r.id, r.created_at, r.last_message_at,
    IF(r.buyer_id = :uid, 'buyer', 'seller') AS my_role,
    IF(r.buyer_id = :uid, r.seller_read_message_id, r.buyer_read_message_id) AS partner_read_id,
    l.id AS listing_id, l.title AS listing_title, l.price AS listing_price, l.status AS listing_status,
    l.deleted_at AS listing_deleted_at,
    (SELECT url FROM listing_images li
      WHERE li.listing_id = l.id AND li.type = 'photo' AND li.sort_order = 0 LIMIT 1) AS thumbnail_url,
    p.id AS partner_id, p.nickname AS partner_nickname,
    m.id AS last_id, m.sender_id AS last_sender_id, m.type AS last_type, m.body AS last_body, m.created_at AS last_created_at,
    (SELECT COUNT(*) FROM chat_messages um
      WHERE um.room_id = r.id AND um.sender_id <> :uid
        AND um.id > COALESCE(IF(r.buyer_id = :uid, r.buyer_read_message_id, r.seller_read_message_id), 0)) AS unread_count
  FROM chat_rooms r
  JOIN listings l ON l.id = r.listing_id
  JOIN users p ON p.id = IF(r.buyer_id = :uid, r.seller_id, r.buyer_id)
  LEFT JOIN chat_messages m ON m.id = r.last_message_id`;

function toRoom(row) {
  return {
    id: row.id,
    listing: {
      id: row.listing_id,
      title: row.listing_title,
      price: row.listing_price,
      status: row.listing_status,
      thumbnailUrl: row.thumbnail_url ?? null,
      isDeleted: row.listing_deleted_at !== null,
    },
    partner: { id: row.partner_id, nickname: row.partner_nickname },
    myRole: row.my_role,
    lastMessage: row.last_id === null
      ? null
      : { id: row.last_id, senderId: row.last_sender_id, type: row.last_type, body: row.last_body, createdAt: row.last_created_at },
    unreadCount: Number(row.unread_count),
    partnerLastReadMessageId: row.partner_read_id ?? null,
    createdAt: row.created_at,
  };
}

/** 방 하나 (보는 사람 기준). 참여하지 않은 방이면 null. */
async function findRoomView(roomId, userId) {
  const [rows] = await pool.query(
    ...bind(`${ROOM_SELECT} WHERE r.id = :roomId AND (r.buyer_id = :uid OR r.seller_id = :uid)`, { roomId, uid: userId }),
  );
  return rows[0] ? toRoom(rows[0]) : null;
}

/** 내가 참여한 방 중 메시지가 있는 방, 최근 메시지 순. */
async function listRoomViews(userId, limit) {
  const [rows] = await pool.query(
    ...bind(`${ROOM_SELECT}
      WHERE (r.buyer_id = :uid OR r.seller_id = :uid) AND r.last_message_at IS NOT NULL
      ORDER BY r.last_message_at DESC, r.id DESC
      LIMIT :limit`, { uid: userId, limit }),
  );
  return rows.map(toRoom);
}

/** 모든 방의 안 읽은 메시지 수 합계 (상대가 보낸 것만). */
async function countUnread(userId) {
  const [[row]] = await pool.query(
    ...bind(`SELECT COUNT(*) AS n
      FROM chat_rooms r
      JOIN chat_messages m ON m.room_id = r.id AND m.sender_id <> :uid
      WHERE (r.buyer_id = :uid AND m.id > COALESCE(r.buyer_read_message_id, 0))
         OR (r.seller_id = :uid AND m.id > COALESCE(r.seller_read_message_id, 0))`, { uid: userId }),
  );
  return Number(row.n);
}

const MESSAGE_SELECT = `
  SELECT m.id, m.room_id, m.sender_id, m.type, m.body, ci.url AS image_url, m.created_at
  FROM chat_messages m
  LEFT JOIN chat_images ci ON ci.id = m.image_id`;

function toMessage(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    senderId: row.sender_id,
    type: row.type,
    body: row.body,
    imageUrl: row.image_url ?? null,
    createdAt: row.created_at,
  };
}

/** before(메시지 id)보다 이전 메시지를 최신부터 limit개 → 오래된 순으로 돌려준다. */
async function listMessages(roomId, { before, limit }) {
  const params = [roomId];
  let where = 'm.room_id = ?';
  if (before !== undefined) {
    where += ' AND m.id < ?';
    params.push(before);
  }
  params.push(limit);
  const [rows] = await pool.query(`${MESSAGE_SELECT} WHERE ${where} ORDER BY m.id DESC LIMIT ?`, params);
  return rows.reverse().map(toMessage);
}

class ImageNotAvailableError extends Error {}

/**
 * 메시지를 저장하고, 방의 마지막 메시지와 보낸 사람의 읽은 위치를 같은 트랜잭션에서 바꾼다.
 * 사진은 내가 올렸고 아직 보내지 않은 것만 쓸 수 있다 — 아니면 ImageNotAvailableError.
 */
async function insertMessage({ roomId, senderId, senderRole, type, body, imageId }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (type === 'image') {
      const [images] = await connection.execute(
        `SELECT ci.id FROM chat_images ci
         WHERE ci.id = ? AND ci.uploader_id = ?
           AND NOT EXISTS (SELECT 1 FROM chat_messages m WHERE m.image_id = ci.id)
         FOR UPDATE`,
        [imageId, senderId],
      );
      if (images.length === 0) throw new ImageNotAvailableError();
    }
    let messageId;
    try {
      const [result] = await connection.execute(
        'INSERT INTO chat_messages (room_id, sender_id, type, body, image_id) VALUES (?, ?, ?, ?, ?)',
        [roomId, senderId, type, type === 'text' ? body : null, type === 'image' ? imageId : null],
      );
      messageId = result.insertId;
    } catch (err) {
      // 같은 사진을 동시에 두 번 보낸 경우 (uk_chat_messages_image)
      if (err.code === 'ER_DUP_ENTRY') throw new ImageNotAvailableError();
      throw err;
    }
    const readColumn = senderRole === 'buyer' ? 'buyer_read_message_id' : 'seller_read_message_id';
    await connection.execute(
      `UPDATE chat_rooms
       SET last_message_id = ?, last_message_at = (SELECT created_at FROM chat_messages WHERE id = ?), ${readColumn} = ?
       WHERE id = ?`,
      [messageId, messageId, messageId, roomId],
    );
    await connection.commit();
    const [[row]] = await pool.execute(`${MESSAGE_SELECT} WHERE m.id = ?`, [messageId]);
    return toMessage(row);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/** 이 방의 마지막 메시지까지 읽음. 읽은 위치가 바뀌었으면 새 위치, 그대로면 null. */
async function markRead(roomId, role) {
  const column = role === 'buyer' ? 'buyer_read_message_id' : 'seller_read_message_id';
  const [result] = await pool.execute(
    `UPDATE chat_rooms SET ${column} = last_message_id
     WHERE id = ? AND last_message_id IS NOT NULL AND (${column} IS NULL OR ${column} < last_message_id)`,
    [roomId],
  );
  if (result.affectedRows === 0) return null;
  const [[row]] = await pool.execute(`SELECT ${column} AS read_id FROM chat_rooms WHERE id = ?`, [roomId]);
  return row.read_id;
}

module.exports = {
  findListing,
  findRoomId,
  insertRoom,
  findMembership,
  findRoomView,
  listRoomViews,
  countUnread,
  listMessages,
  insertMessage,
  markRead,
  ImageNotAvailableError,
};

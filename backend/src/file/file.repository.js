const pool = require('../config/db');

/**
 * 미연결(고아) 이미지 — 업로드만 하고 판매글·토론글·채팅에 쓰지 않은 채 olderThanHours가 지난 이미지 행.
 * 판매글 수정으로 빠진 사진, 하드 삭제된 글의 사진(FK ON DELETE SET NULL)도 여기에 포함된다.
 * 각 테이블에 같은 모양의 쿼리 3벌: find(후보 조회) / delete(그 사이 연결됐으면 지우지 않음).
 */
const ORPHAN_TABLES = Object.freeze({
  listing_images: {
    find: `SELECT id, url FROM listing_images
            WHERE listing_id IS NULL AND created_at < UTC_TIMESTAMP() - INTERVAL ? HOUR
            ORDER BY id LIMIT ?`,
    remove: 'DELETE FROM listing_images WHERE id = ? AND listing_id IS NULL',
  },
  post_images: {
    find: `SELECT id, url FROM post_images
            WHERE post_id IS NULL AND created_at < UTC_TIMESTAMP() - INTERVAL ? HOUR
            ORDER BY id LIMIT ?`,
    remove: 'DELETE FROM post_images WHERE id = ? AND post_id IS NULL',
  },
  chat_images: {
    find: `SELECT ci.id, ci.url FROM chat_images ci
            WHERE ci.created_at < UTC_TIMESTAMP() - INTERVAL ? HOUR
              AND NOT EXISTS (SELECT 1 FROM chat_messages m WHERE m.image_id = ci.id)
            ORDER BY ci.id LIMIT ?`,
    remove: `DELETE FROM chat_images
              WHERE id = ? AND NOT EXISTS (SELECT 1 FROM chat_messages m WHERE m.image_id = chat_images.id)`,
  },
});

/** table의 미연결 이미지 후보 최대 limit개 ({ id, url }). */
async function findOrphanImages(table, olderThanHours, limit) {
  // LIMIT 자리표시자는 execute(prepared)에서 문자열로 넘어가면 에러가 나서 query를 쓴다.
  const [rows] = await pool.query(ORPHAN_TABLES[table].find, [olderThanHours, limit]);
  return rows;
}

/** 미연결 이미지 행 1개를 지운다. 조회 후 그 사이 글·메시지에 연결됐으면 지우지 않고 false. */
async function deleteOrphanImage(table, id) {
  const [result] = await pool.execute(ORPHAN_TABLES[table].remove, [id]);
  return result.affectedRows === 1;
}

/** DB가 가리키는 모든 이미지 URL — 디스크에만 남은 파일을 찾을 때 "아직 쓰는 파일"을 지우지 않기 위해 쓴다. */
async function findAllReferencedUrls() {
  // 테이블마다 collation이 다를 수 있어(예전에 만든 로컬 DB) UNION 대신 따로 조회해 합친다.
  const sources = [
    'SELECT url FROM listing_images',
    'SELECT url FROM post_images',
    'SELECT url FROM chat_images',
    'SELECT image_url AS url FROM items WHERE image_url IS NOT NULL',
    'SELECT profile_image_url AS url FROM users WHERE profile_image_url IS NOT NULL',
  ];
  const urls = [];
  for (const sql of sources) {
    const [rows] = await pool.query(sql);
    for (const row of rows) urls.push(row.url);
  }
  return urls;
}

module.exports = { ORPHAN_TABLES, findOrphanImages, deleteOrphanImage, findAllReferencedUrls };

const pool = require('../config/db');

/** 글에 아직 연결되지 않은 이미지 행을 만든다 (post_id NULL). 글 등록 때 연결한다. */
async function createPostImage(uploaderId, url) {
  const [result] = await pool.execute(
    'INSERT INTO post_images (post_id, uploader_id, url, sort_order) VALUES (NULL, ?, ?, 0)',
    [uploaderId, url],
  );
  return { id: result.insertId, url };
}

module.exports = { createPostImage };

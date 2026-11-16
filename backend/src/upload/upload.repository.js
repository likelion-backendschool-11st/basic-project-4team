const pool = require('../config/db');

/** 글에 아직 연결되지 않은 이미지 행을 만든다 (post_id NULL). 글 등록 때 연결한다. */
async function createPostImage(uploaderId, url) {
  const [result] = await pool.execute(
    'INSERT INTO post_images (post_id, uploader_id, url, sort_order) VALUES (NULL, ?, ?, 0)',
    [uploaderId, url],
  );
  return { id: result.insertId, url };
}

/** 채팅 사진 행을 만든다. 메시지가 image_id로 가리키기 전까지는 보내지 않은 사진이다. */
async function createChatImage(uploaderId, url) {
  const [result] = await pool.execute('INSERT INTO chat_images (uploader_id, url) VALUES (?, ?)', [uploaderId, url]);
  return { id: result.insertId, url };
}

module.exports = { createPostImage, createChatImage };

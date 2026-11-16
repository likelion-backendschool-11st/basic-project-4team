const pool = require('../config/db');

/** 방향별 투표 수 (전체 기간 누적). idx_item_votes_item_date 인덱스만 읽는다. */
async function countByDirection(itemId) {
  const [rows] = await pool.execute(
    'SELECT direction, COUNT(*) AS count FROM item_votes WHERE item_id = ? GROUP BY direction',
    [itemId],
  );
  const counts = { up: 0, down: 0 };
  rows.forEach((row) => {
    counts[row.direction] = Number(row.count);
  });
  return counts;
}

/** 해당 날짜에 사용자가 투표한 방향. 없으면 null. */
async function findDirection(userId, itemId, voteDate) {
  const [rows] = await pool.execute(
    'SELECT direction FROM item_votes WHERE user_id = ? AND item_id = ? AND vote_date = ?',
    [userId, itemId, voteDate],
  );
  return rows.length === 0 ? null : rows[0].direction;
}

/** 투표 저장. 같은 날 중복이면 mysql2가 ER_DUP_ENTRY 에러를 던진다. */
async function insert({ userId, itemId, voteDate, direction }) {
  await pool.execute(
    'INSERT INTO item_votes (user_id, item_id, vote_date, direction) VALUES (?, ?, ?, ?)',
    [userId, itemId, voteDate, direction],
  );
}

module.exports = { countByDirection, findDirection, insert };

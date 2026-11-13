// 모든 테이블이 InnoDB·utf8mb4_0900_ai_ci인지, 이모지가 깨지지 않고 저장되는지 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const { TEST_DB, EXPECTED_TABLES, freshSchema, dbConnection } = require('./helpers/db');

test('테이블 엔진·문자셋·정렬 규칙', async () => {
  await freshSchema();
  const conn = await dbConnection();
  try {
    const [tables] = await conn.query(
      'SELECT TABLE_NAME AS name, ENGINE AS engine, TABLE_COLLATION AS coll FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
      [TEST_DB],
    );
    assert.equal(tables.length, EXPECTED_TABLES.length);
    for (const t of tables) {
      assert.equal(t.engine, 'InnoDB', `${t.name} 엔진`);
      assert.equal(t.coll, 'utf8mb4_0900_ai_ci', `${t.name} 정렬 규칙`);
    }

    const [cols] = await conn.query(
      `SELECT TABLE_NAME AS t, COLUMN_NAME AS c, CHARACTER_SET_NAME AS cs, COLLATION_NAME AS coll
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND CHARACTER_SET_NAME IS NOT NULL`,
      [TEST_DB],
    );
    assert.ok(cols.length > 0);
    for (const col of cols) {
      assert.equal(col.cs, 'utf8mb4', `${col.t}.${col.c} 문자셋`);
      assert.equal(col.coll, 'utf8mb4_0900_ai_ci', `${col.t}.${col.c} 정렬 규칙`);
    }

    const body = '오늘 시세 🔥😮😂🧊';
    await conn.query(
      "INSERT INTO users (login_id, password_hash, nickname, email) VALUES ('emoji1', 'x', '이모지😀', 'e@x.dev')",
    );
    await conn.query(
      "INSERT INTO posts (user_id, board, body) SELECT id, 'free', ? FROM users WHERE login_id = 'emoji1'",
      [body],
    );
    const [[post]] = await conn.query('SELECT body FROM posts');
    assert.equal(post.body, body);
    const [[user]] = await conn.query("SELECT nickname FROM users WHERE login_id = 'emoji1'");
    assert.equal(user.nickname, '이모지😀');
  } finally {
    await conn.end();
  }
});

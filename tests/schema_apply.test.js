// 빈 DB에 db-init.js를 두 번 실행해도 성공하고, 테이블 14개가 정확히 생기며, 기존 시드가 들어가는지 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const { TEST_DB, EXPECTED_TABLES, runScript, freshSchema, dbConnection } = require('./helpers/db');

test('빈 DB에 스키마 적용 → 두 번째 실행도 성공 → 테이블 14개 → 시드 성공', async () => {
  await freshSchema();

  const second = runScript('db-init.js');
  assert.equal(second.status, 0, `두 번째 db-init 실패\n${second.stdout}\n${second.stderr}`);

  const conn = await dbConnection();
  try {
    const [rows] = await conn.query(
      'SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [TEST_DB],
    );
    assert.deepEqual(rows.map((r) => r.name), EXPECTED_TABLES);
  } finally {
    await conn.end();
  }

  const seed = runScript('db-seed.js');
  assert.equal(seed.status, 0, `db-seed 실패\n${seed.stdout}\n${seed.stderr}`);
});

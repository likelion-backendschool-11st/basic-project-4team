// 스키마 테스트 공용 도구: 테스트 전용 DB를 새로 만들고 backend의 실제 db-init.js로 스키마를 적용한다.
const path = require('path');
const { spawnSync } = require('child_process');

const BACKEND = path.join(__dirname, '..', '..', 'backend');
const TEST_DB = 'repick_schema_test';

// backend/.env보다 먼저 정해 두면 dotenv가 덮어쓰지 않는다 → 실제 개발 DB는 건드리지 않음
process.env.DB_NAME = TEST_DB;

const mysql = require(path.join(BACKEND, 'node_modules', 'mysql2', 'promise'));
const env = require(path.join(BACKEND, 'src', 'config', 'env'));

if (env.db.database !== TEST_DB || !TEST_DB.endsWith('_schema_test')) {
  throw new Error(`테스트 DB 이름이 이상합니다: ${env.db.database}`);
}

const EXPECTED_TABLES = [
  'categories', 'comment_likes', 'comments', 'item_votes', 'items',
  'listing_images', 'listing_views', 'listings', 'post_images', 'post_reactions',
  'posts', 'refresh_tokens', 'users', 'wishes',
];

function runScript(name) {
  return spawnSync(process.execPath, [path.join(BACKEND, 'scripts', name)], {
    env: { ...process.env, DB_NAME: TEST_DB },
    encoding: 'utf8',
  });
}

async function serverConnection() {
  const { database, ...server } = env.db;
  return mysql.createConnection({ ...server, multipleStatements: true });
}

async function dropTestDb() {
  const conn = await serverConnection();
  try {
    await conn.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
  } finally {
    await conn.end();
  }
}

/** 테스트 DB를 지우고 db-init.js로 스키마를 새로 적용한다. 실패하면 출력과 함께 예외. */
async function freshSchema() {
  await dropTestDb();
  const result = runScript('db-init.js');
  if (result.status !== 0) {
    throw new Error(`db-init.js 실패 (종료 코드 ${result.status})\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

async function dbConnection() {
  return mysql.createConnection({ ...env.db, database: TEST_DB, timezone: 'Z' });
}

/** promise가 지정한 MySQL 에러 코드로 실패해야 통과. */
async function expectDbError(promise, code) {
  try {
    await promise;
  } catch (err) {
    if (err.code === code) return;
    throw new Error(`기대한 에러 ${code}, 실제 ${err.code}: ${err.message}`);
  }
  throw new Error(`에러 ${code}를 기대했지만 성공했습니다`);
}

module.exports = {
  TEST_DB, EXPECTED_TABLES, runScript, freshSchema, dropTestDb, dbConnection, expectDbError,
};

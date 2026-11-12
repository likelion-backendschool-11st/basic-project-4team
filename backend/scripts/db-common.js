const mysql = require('mysql2/promise');
const env = require('../src/config/env');

/** 스크립트용 단일 커넥션. withDatabase=false면 DB를 고르지 않고 접속한다(DB 생성 전). */
async function connect({ withDatabase = true, multipleStatements = false } = {}) {
  const { database, ...server } = env.db;
  const connection = await mysql.createConnection({
    ...server,
    ...(withDatabase ? { database } : {}),
    multipleStatements,
    timezone: 'Z',
  });
  await connection.query("SET time_zone = '+00:00'");
  return connection;
}

/** 자주 나는 접속 에러를 팀원이 바로 고칠 수 있는 안내문으로 바꿔 출력하고 종료한다. */
function exitWithHint(err) {
  const hints = {
    ECONNREFUSED: `MySQL에 연결할 수 없습니다 (${env.db.host}:${env.db.port}).\n  → MySQL이 실행 중인지 확인하세요. README의 "MySQL 실행 확인"을 참고하세요.`,
    ER_ACCESS_DENIED_ERROR: `MySQL 로그인 실패 (사용자: ${env.db.user}).\n  → backend/.env 의 DB_PASSWORD가 내 MySQL 비밀번호와 같은지 확인하세요.`,
    ER_BAD_DB_ERROR: `데이터베이스 '${env.db.database}'가 없습니다.\n  → 먼저 npm run db:init 을 실행하세요.`,
    ER_NO_SUCH_TABLE: '테이블이 없습니다.\n  → 먼저 npm run db:init 을 실행하세요.',
  };
  console.error(`\n❌ ${hints[err.code] ?? err.message}\n`);
  process.exit(1);
}

module.exports = { env, connect, exitWithHint };

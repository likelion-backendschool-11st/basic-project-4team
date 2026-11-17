/** npm run db:init — DB가 없으면 만들고 db/schema.sql을 실행한다. 여러 번 실행해도 안전하다. */
const fs = require('fs');
const path = require('path');
const { escapeId } = require('mysql2');
const { env, connect, exitWithHint } = require('./db-common');
const { rebuildMarket } = require('./db-market');

const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

// schema.sql은 CREATE TABLE IF NOT EXISTS라서, 테이블이 먼저 만들어진 DB에는 나중에 추가된 컬럼이 안 생긴다.
// MySQL에는 ADD COLUMN IF NOT EXISTS가 없으므로 여기서 빠진 컬럼만 추가한다. 정의는 schema.sql과 같게 유지한다.
const LATE_COLUMNS = [
  { table: 'users', column: 'nickname_changed_at', definition: "DATETIME NULL COMMENT '닉네임 변경 시각 (30일에 1번)' AFTER nickname" },
  { table: 'users', column: 'profile_image_url', definition: 'VARCHAR(500) NULL AFTER email' },
  { table: 'users', column: 'role', definition: "VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT 'user | admin' AFTER profile_image_url" },
];

/** 빠진 컬럼을 추가하고, 추가한 목록을 돌려준다. */
async function addMissingColumns(connection, dbName) {
  const added = [];
  for (const { table, column, definition } of LATE_COLUMNS) {
    const [rows] = await connection.query(
      'SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, column],
    );
    if (rows.length === 0) {
      await connection.query(`ALTER TABLE ${escapeId(table)} ADD COLUMN ${escapeId(column)} ${definition}`);
      added.push(`${table}.${column}`);
    }
  }
  return added;
}

async function main() {
  const connection = await connect({ withDatabase: false, multipleStatements: true });
  try {
    const dbName = escapeId(env.db.database);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE ${dbName}`);
    await connection.query(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    const added = await addMissingColumns(connection, env.db.database);
    if (added.length > 0) console.log(`🔧 빠진 컬럼 추가: ${added.join(', ')}`);
    // 집계표가 새로 생겼거나 어긋났을 수 있으니 거래완료 판매글로 다시 만든다 (데이터는 지우지 않음)
    const marketRows = await rebuildMarket(connection);
    console.log(`📈 일별 시세 집계 ${marketRows}행`);

    const [tables] = await connection.query('SHOW TABLES');
    const names = tables.map((row) => Object.values(row)[0]);
    console.log(`✅ DB '${env.db.database}' 준비 완료. 테이블: ${names.join(', ')}`);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

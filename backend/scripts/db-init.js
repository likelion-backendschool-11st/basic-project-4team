/** npm run db:init — DB가 없으면 만들고 db/schema.sql을 실행한다. 여러 번 실행해도 안전하다. */
const fs = require('fs');
const path = require('path');
const { escapeId } = require('mysql2');
const { env, connect, exitWithHint } = require('./db-common');

const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

async function main() {
  const connection = await connect({ withDatabase: false, multipleStatements: true });
  try {
    const dbName = escapeId(env.db.database);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE ${dbName}`);
    await connection.query(fs.readFileSync(SCHEMA_PATH, 'utf8'));

    const [tables] = await connection.query('SHOW TABLES');
    const names = tables.map((row) => Object.values(row)[0]);
    console.log(`✅ DB '${env.db.database}' 준비 완료. 테이블: ${names.join(', ')}`);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

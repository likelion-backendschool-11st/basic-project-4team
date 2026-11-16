/**
 * npm run db:seed — db/seed.sql을 실행해 팀 공용 더미 데이터를 넣는다.
 * ⚠️ 모든 테이블의 데이터를 지우고 다시 채운다(id 고정). 로컬에서 만든 글·판매글은 사라진다.
 * 먼저 npm run db:init 으로 테이블을 만들어 둔다.
 */
const fs = require('fs');
const path = require('path');
const { env, connect, exitWithHint } = require('./db-common');

const SEED_PATH = path.join(__dirname, '..', 'db', 'seed.sql');

async function main() {
  const connection = await connect({ multipleStatements: true });
  try {
    await connection.query(fs.readFileSync(SEED_PATH, 'utf8'));
    const tables = ['users', 'items', 'listings', 'posts', 'comments', 'item_votes'];
    const counts = [];
    for (const table of tables) {
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) AS count FROM ${table}`);
      counts.push(`${table} ${count}`);
    }
    console.log(`✅ DB '${env.db.database}' 시드 완료 — ${counts.join(', ')}`);
    console.log('   계정: test1~3 외 8명(신규 가입자 확인용 newbie 포함), 비밀번호는 모두 test1234');
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

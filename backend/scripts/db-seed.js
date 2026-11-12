/** npm run db:seed — 개발용 더미 유저를 넣는다. 이미 있는 아이디는 건너뛴다. */
const bcrypt = require('bcryptjs');
const { connect, exitWithHint } = require('./db-common');

const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = 'test1234';
const SEED_USERS = [
  { loginId: 'test1', nickname: '테스트유저1', email: 'test1@repick.dev' },
  { loginId: 'test2', nickname: '테스트유저2', email: 'test2@repick.dev' },
  { loginId: 'test3', nickname: '테스트유저3', email: 'test3@repick.dev' },
];

async function main() {
  const connection = await connect();
  try {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
    for (const user of SEED_USERS) {
      const [existing] = await connection.execute('SELECT id FROM users WHERE login_id = ?', [user.loginId]);
      if (existing.length > 0) {
        console.log(`⏭  ${user.loginId} 이미 있음 — 건너뜀`);
        continue;
      }
      await connection.execute(
        'INSERT INTO users (login_id, password_hash, nickname, email) VALUES (?, ?, ?, ?)',
        [user.loginId, passwordHash, user.nickname, user.email],
      );
      console.log(`➕ ${user.loginId} 추가`);
    }
    console.log(`✅ 시드 완료. 비밀번호는 모두 ${SEED_PASSWORD}`);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

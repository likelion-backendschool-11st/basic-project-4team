/**
 * npm run db:newbie — 신규 가입자 확인용 계정 newbie(/test1234)를 "하루 전 가입"으로 만든다 (#54).
 * db:seed와 달리 다른 데이터는 지우지 않는다. 내 DB에서 만든 글·판매글은 그대로 남는다.
 * 이미 있으면 가입 시각만 하루 전으로 되돌린다 → 7일이 지나 신규 가입자가 아니게 되면 다시 실행하면 된다.
 */
const { env, connect, exitWithHint } = require('./db-common');

const NEWBIE = {
  loginId: 'newbie',
  // db/seed.sql의 다른 계정과 같은 test1234 해시
  passwordHash: '$2b$10$IOhC/QGFUV/94i/UGluqqOCdvMcWFTfxqJHoi2MV/Cg0fd.QVZcdq',
  nickname: '새내기',
  email: 'newbie@repick.dev',
};
const JOINED_MINUTES_AGO = 1440;

async function main() {
  const connection = await connect();
  try {
    const [rows] = await connection.execute('SELECT id FROM users WHERE login_id = ?', [NEWBIE.loginId]);
    if (rows.length > 0) {
      // 탈퇴 처리된 상태였다면 되살린다.
      await connection.execute(
        `UPDATE users SET created_at = UTC_TIMESTAMP() - INTERVAL ${JOINED_MINUTES_AGO} MINUTE, deleted_at = NULL WHERE id = ?`,
        [rows[0].id],
      );
      console.log(`✅ DB '${env.db.database}' — newbie(id ${rows[0].id}) 가입 시각을 하루 전으로 되돌렸습니다.`);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO users (login_id, password_hash, nickname, email, created_at)
         VALUES (?, ?, ?, ?, UTC_TIMESTAMP() - INTERVAL ${JOINED_MINUTES_AGO} MINUTE)`,
        [NEWBIE.loginId, NEWBIE.passwordHash, NEWBIE.nickname, NEWBIE.email],
      );
      console.log(`✅ DB '${env.db.database}' — newbie(id ${result.insertId}) 계정을 만들었습니다.`);
    }
    console.log('   newbie / test1234 로 로그인하면 7일 동안 신규 가입자 안내·제한이 보입니다. 다른 데이터는 그대로입니다.');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error(`닉네임 '${NEWBIE.nickname}' 또는 이메일 '${NEWBIE.email}'을 다른 회원이 쓰고 있어 newbie를 만들 수 없습니다.`);
    }
    throw err;
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

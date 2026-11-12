/** npm run db:seed — 개발용 더미 유저·토론글을 넣는다. 이미 있는 데이터는 건너뛴다. */
const bcrypt = require('bcryptjs');
const { connect, exitWithHint } = require('./db-common');

const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = 'test1234';
const SEED_USERS = [
  { loginId: 'test1', nickname: '테스트유저1', email: 'test1@repick.dev' },
  { loginId: 'test2', nickname: '테스트유저2', email: 'test2@repick.dev' },
  { loginId: 'test3', nickname: '테스트유저3', email: 'test3@repick.dev' },
];
const SEED_POSTS = [
  {
    loginId: 'test1', board: 'pokemon', tag: 'analysis', itemId: 'charizard-ex-sar', title: null,
    body: 'PSA10 물량이 국내 유통 채널에서 눈에 띄게 줄어서 당분간 30만 원대 초반 지지선은 견고할 것 같아요.',
  },
  {
    loginId: 'test2', board: 'pokemon', tag: 'qna', itemId: 'charizard-ex-sar', title: null,
    body: '지금 사면 고점일까요? 이번 주에만 4만 원 올랐네요.',
  },
  {
    loginId: 'test3', board: 'sneakers', tag: 'poll', itemId: 'jordan-1-chicago',
    title: '조던 1 시카고 2015 OG vs 2022 로스트앤파운드, 어떤 것을 소장하시겠습니까?',
    body: '가성비 실착 vs 대장급 오리지널 소장가치 중 회원님들의 선택은?',
  },
  {
    loginId: 'test1', board: 'watch', tag: 'qna', itemId: 'rolex-submariner',
    title: '서브마리너 풀세트 vs 단품, 리셀 시 차이 얼마나 나나요?',
    body: '보증서와 박스 유무에 따라 체결가 차이가 어느 정도인지 실거래 경험 공유 부탁드립니다.',
  },
];

/** 토론글은 테이블이 비어 있을 때만 넣는다 (반복 실행 시 중복 방지). */
async function seedPosts(connection) {
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM posts');
  if (count > 0) {
    console.log('⏭  토론글이 이미 있음 — 건너뜀');
    return;
  }
  for (const post of SEED_POSTS) {
    await connection.execute(
      `INSERT INTO posts (user_id, board, tag, item_id, title, body)
       SELECT id, ?, ?, ?, ?, ? FROM users WHERE login_id = ?`,
      [post.board, post.tag, post.itemId, post.title, post.body, post.loginId],
    );
  }
  console.log(`➕ 토론글 ${SEED_POSTS.length}개 추가`);
}

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
    await seedPosts(connection);
    console.log(`✅ 시드 완료. 비밀번호는 모두 ${SEED_PASSWORD}`);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

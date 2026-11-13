/** npm run db:seed — 개발용 더미 유저·품목·판매글·토론글을 넣는다. 이미 있는 데이터는 건너뛴다. */
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

// 대분류 → 소분류. 소분류는 parent에 대분류 code를 적는다.
const SEED_CATEGORIES = [
  { code: 'card', name: '트레이딩 카드 (TCG)', parent: null },
  { code: 'sneaker', name: '한정판 스니커즈', parent: null },
  { code: 'luxury', name: '명품 / 시계', parent: null },
  { code: 'pokemon', name: '포켓몬 카드', parent: 'card' },
  { code: 'onepiece', name: '원피스 카드 게임', parent: 'card' },
  { code: 'yugioh', name: '유희왕', parent: 'card' },
  { code: 'nike', name: '나이키 / 조던', parent: 'sneaker' },
  { code: 'watch', name: '시계', parent: 'luxury' },
];

// 시세 계산용 판매글. soldDaysAgo가 있으면 거래완료(그 시각에 체결), 없으면 판매중.
// condition을 생략하면 PSA 10 그레이딩 카드.
const sold = (seller, soldPrice, soldDaysAgo, extra = {}) => ({ seller, price: soldPrice, soldPrice, soldDaysAgo, ...extra });
const selling = (seller, price, extra = {}) => ({ seller, price, ...extra });
const UNOPENED = { condition: 'unopened' };

// slug는 토론글 시드(item_id)·프론트 목 데이터 링크·명세 예시와 같은 값
const SEED_ITEMS = [
  {
    slug: 'charizard-ex-sar', category: 'pokemon', name: '리자몽 ex SAR',
    setName: '포켓몬 151 (SV2a)', cardNo: '201/165', language: 'ko', rarity: 'SAR',
    // 상승: 271,000 → 320,000 (+49,000, +18.1%)
    listings: [
      sold('test2', 255000, 20), sold('test3', 265000, 7), sold('test2', 271000, 1.1), sold('test3', 320000, 0.05),
      selling('test2', 330000), selling('test3', 345000),
    ],
  },
  {
    // api-spec-all.md 2장 예시 slug. 한국판과 겹치지 않게 일본판으로 둔다(uk_items_card)
    slug: 'charizard-ex-sar-sv2a-201', category: 'pokemon', name: '리자몽 ex SAR (일본판)',
    setName: '포켓몬 151 (SV2a)', cardNo: '201/165', language: 'ja', rarity: 'SAR',
    // 하락: 300,000 → 285,000 (-15,000, -5.0%)
    listings: [
      sold('test1', 310000, 12), sold('test3', 300000, 2), sold('test1', 285000, 0.1),
      selling('test1', 290000), selling('test2', 299000), selling('test3', 315000),
    ],
  },
  {
    slug: 'luffy-gear5', category: 'onepiece', name: '몽키 D. 루피 (기어5) 패러렐',
    setName: '신시대의 주역 (OP-05)', cardNo: 'OP05-119', language: 'ja', rarity: 'etc',
    // 보합: 180,000 → 180,000
    listings: [sold('test2', 175000, 9), sold('test1', 180000, 3), sold('test3', 180000, 0.2), selling('test2', 189000)],
  },
  {
    slug: 'blue-eyes-white-dragon', category: 'yugioh', name: '푸른 눈의 백룡',
    setName: 'QUARTER CENTURY CHRONICLE', cardNo: 'QCCU-KR001', language: 'ko', rarity: 'UR',
    // 전일 체결 없음(첫 거래만 있음) → 변동 0
    listings: [sold('test1', 95000, 0.3), selling('test3', 99000)],
  },
  {
    slug: 'jordan-1-chicago', category: 'nike', name: '조던 1 레트로 하이 OG 시카고',
    listings: [selling('test1', 2100000, UNOPENED)],
  },
  {
    slug: 'dunk-low-panda', category: 'nike', name: '나이키 덩크 로우 레트로 블랙 화이트',
    listings: [
      sold('test2', 139000, 15, UNOPENED), sold('test3', 132000, 1.5, UNOPENED), sold('test2', 128000, 0.1, UNOPENED),
      selling('test3', 135000, UNOPENED), selling('test1', 129000, UNOPENED),
    ],
  },
  // 거래 이력·매물 없음 → "거래 이력 없음", "현재 매물 (0)"
  { slug: 'rolex-submariner', category: 'watch', name: '롤렉스 서브마리너 데이트', listings: [] },
];

async function insertListing(connection, slug, listing) {
  const condition = listing.condition ?? 'graded';
  const graded = condition === 'graded';
  const isSold = listing.soldDaysAgo !== undefined;
  const soldMinutesAgo = Math.round((listing.soldDaysAgo ?? 0) * 24 * 60);
  await connection.execute(
    `INSERT INTO listings
       (seller_id, item_id, category_id, title, price, \`condition\`, grading_service, grade,
        delivery, agreed_at, status, sold_price, sold_at, created_at)
     SELECT u.id, i.id, i.category_id, CONCAT(?, i.name), ?, ?, ?, ?, 1, UTC_TIMESTAMP(), ?, ?,
       IF(?, UTC_TIMESTAMP() - INTERVAL ? MINUTE, NULL), UTC_TIMESTAMP() - INTERVAL ? MINUTE
     FROM users u, items i WHERE u.login_id = ? AND i.slug = ?`,
    [graded ? '[PSA 10] ' : '', listing.price, condition, graded ? 'PSA' : null, graded ? '10' : null,
      isSold ? 'sold' : 'selling', isSold ? listing.soldPrice : null,
      isSold, soldMinutesAgo, soldMinutesAgo + 24 * 60,
      listing.seller, slug],
  );
}

/** 카테고리·품목·판매글. 이미 있는 slug의 품목은 판매글까지 통째로 건너뛴다 (반복 실행 시 중복 방지). */
async function seedItems(connection) {
  for (const [index, category] of SEED_CATEGORIES.entries()) {
    await connection.execute(
      `INSERT IGNORE INTO categories (parent_id, code, name, sort_order)
       VALUES ((SELECT id FROM (SELECT id FROM categories WHERE code = ?) AS parent), ?, ?, ?)`,
      [category.parent, category.code, category.name, index],
    );
  }
  for (const item of SEED_ITEMS) {
    const [existing] = await connection.execute('SELECT id FROM items WHERE slug = ?', [item.slug]);
    if (existing.length > 0) {
      console.log(`⏭  품목 ${item.slug} 이미 있음 — 건너뜀`);
      continue;
    }
    await connection.execute(
      `INSERT INTO items (category_id, slug, name, set_name, card_no, language, rarity)
       SELECT id, ?, ?, ?, ?, ?, ? FROM categories WHERE code = ?`,
      [item.slug, item.name, item.setName ?? null, item.cardNo ?? null,
        item.language ?? null, item.rarity ?? null, item.category],
    );
    for (const listing of item.listings) {
      await insertListing(connection, item.slug, listing);
    }
    console.log(`➕ 품목 ${item.slug} + 판매글 ${item.listings.length}개 추가`);
  }
}

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
    await seedItems(connection);
    await seedPosts(connection);
    console.log(`✅ 시드 완료. 비밀번호는 모두 ${SEED_PASSWORD}`);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

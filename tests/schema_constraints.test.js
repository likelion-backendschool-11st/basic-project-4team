// 정상 데이터는 들어가고, 잘못된 값(Enum 오타·등급 조합·범위·중복)은 DB의 CHECK·UNIQUE가 거부하는지 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const { freshSchema, dbConnection, expectDbError } = require('./helpers/db');

const CHECK = 'ER_CHECK_CONSTRAINT_VIOLATED';
const DUP = 'ER_DUP_ENTRY';

async function idOf(conn, sql, params = []) {
  const [[row]] = await conn.query(sql, params);
  return row.id;
}

/** 정상 데이터 한 벌을 넣고 id들을 돌려준다. 여기서 실패하면 스키마가 정상 입력을 막는 것. */
async function seedValid(conn) {
  await conn.query(
    "INSERT INTO users (login_id, password_hash, nickname, email) VALUES ('seller', 'x', '판매자', 's@x.dev'), ('buyer', 'x', '구매자', 'b@x.dev')",
  );
  const seller = await idOf(conn, "SELECT id FROM users WHERE login_id = 'seller'");
  const buyer = await idOf(conn, "SELECT id FROM users WHERE login_id = 'buyer'");

  await conn.query("INSERT INTO categories (code, name) VALUES ('card', '카드')");
  const top = await idOf(conn, "SELECT id FROM categories WHERE code = 'card'");
  await conn.query("INSERT INTO categories (parent_id, code, name, sort_order) VALUES (?, 'pokemon', '포켓몬 카드', 1)", [top]);
  const cat = await idOf(conn, "SELECT id FROM categories WHERE code = 'pokemon'");

  await conn.query(
    `INSERT INTO items (category_id, slug, name, set_name, card_no, language, rarity)
     VALUES (?, 'charizard-ex-sar-sv2a-201', '리자몽 ex SAR', '포켓몬 151 (SV2a)', '201/165', 'ko', 'SAR')`,
    [cat],
  );
  const item = await idOf(conn, 'SELECT id FROM items');

  await conn.query(
    `INSERT INTO listings (seller_id, item_id, category_id, title, description, price, \`condition\`,
                           grading_service, grade, delivery, direct, direct_location, attributes, agreed_at)
     VALUES (?, ?, ?, '[PSA 10] 리자몽', '', 300000, 'graded', 'PSA', '10', 1, 1, '서울 관악구 남현동', NULL, NOW())`,
    [seller, item, cat],
  );
  const listing = await idOf(conn, 'SELECT id FROM listings');
  await conn.query("UPDATE listings SET registration_no = CONCAT('RPC-2026-', LPAD(id, 6, '0')) WHERE id = ?", [listing]);
  await conn.query(
    "UPDATE listings SET status = 'sold', sold_price = 290000, sold_at = NOW(), buyer_id = ? WHERE id = ?",
    [buyer, listing],
  );

  await conn.query(
    `INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order)
     VALUES (?, ?, 'photo', 'p0', 0), (?, ?, 'photo', 'p9', 9), (?, ?, 'auth', 'a0', 0)`,
    [listing, seller, listing, seller, listing, seller],
  );
  await conn.query('INSERT INTO wishes (user_id, listing_id) VALUES (?, ?)', [buyer, listing]);
  await conn.query("INSERT INTO listing_views (listing_id, viewer_key, viewed_on) VALUES (?, 'u:1', '2026-11-13')", [listing]);

  await conn.query(
    "INSERT INTO posts (user_id, board, tag, item_id, title, body) VALUES (?, 'pokemon', 'qna', 'charizard-ex-sar', NULL, '지금 사도 될까요?')",
    [buyer],
  );
  const post = await idOf(conn, 'SELECT id FROM posts');
  await conn.query("INSERT INTO post_images (post_id, uploader_id, url, sort_order) VALUES (?, ?, 'i3', 3)", [post, buyer]);
  await conn.query("INSERT INTO post_reactions (user_id, post_id, type) VALUES (?, ?, 'fire')", [seller, post]);

  await conn.query("INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, '저는 샀어요')", [post, seller]);
  const comment = await idOf(conn, 'SELECT id FROM comments');
  await conn.query("INSERT INTO comments (post_id, user_id, parent_id, body) VALUES (?, ?, ?, '답글')", [post, buyer, comment]);
  await conn.query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [buyer, comment]);

  await conn.query("INSERT INTO item_votes (user_id, item_id, vote_date, direction) VALUES (?, ?, '2026-11-13', 'up')", [buyer, item]);

  return { seller, buyer, cat, item, listing, post, comment };
}

function listingSql(overrides = {}) {
  const v = {
    status: "'selling'", price: '1000', cond: "'unopened'", gs: 'NULL', grade: 'NULL',
    delivery: '1', direct: '0', soldPrice: 'NULL', soldAt: 'NULL', ...overrides,
  };
  return `INSERT INTO listings (seller_id, item_id, category_id, title, price, \`condition\`, grading_service, grade,
                                delivery, direct, status, sold_price, sold_at, agreed_at)
          VALUES (?, ?, ?, 't', ${v.price}, ${v.cond}, ${v.gs}, ${v.grade}, ${v.delivery}, ${v.direct},
                  ${v.status}, ${v.soldPrice}, ${v.soldAt}, NOW())`;
}

test('정상 데이터는 모두 들어간다', async () => {
  await freshSchema();
  const conn = await dbConnection();
  try {
    const ids = await seedValid(conn);
    const [[l]] = await conn.query('SELECT registration_no, status, view_count, wish_count FROM listings');
    assert.equal(l.registration_no, `RPC-2026-${String(ids.listing).padStart(6, '0')}`);
    assert.equal(l.status, 'sold');
    assert.equal(l.view_count, 0);
    assert.equal(l.wish_count, 0);
    const [[u]] = await conn.query('SELECT role FROM users WHERE id = ?', [ids.seller]);
    assert.equal(u.role, 'user', 'role 기본값은 user');
  } finally {
    await conn.end();
  }
});

test('잘못된 값은 DB가 거부한다', async () => {
  await freshSchema();
  const conn = await dbConnection();
  try {
    const { seller, buyer, cat, item, listing, post } = await seedValid(conn);
    const base = [seller, item, cat];

    // 중복
    await expectDbError(conn.query("INSERT INTO users (login_id, password_hash, nickname) VALUES ('seller', 'x', '다른닉')"), DUP);
    await expectDbError(conn.query("INSERT INTO users (login_id, password_hash, nickname) VALUES ('new1', 'x', '판매자')"), DUP);
    await expectDbError(conn.query("INSERT INTO users (login_id, password_hash, nickname, role) VALUES ('new2', 'x', 'n2', 'superuser')"), CHECK);

    // 판매글 Enum·조합·범위
    await expectDbError(conn.query(listingSql({ status: "'SELLING'" }), base), CHECK);
    await expectDbError(conn.query(listingSql({ cond: "'mint'" }), base), CHECK);
    await expectDbError(conn.query(listingSql({ cond: "'graded'" }), base), CHECK); // 그레이딩인데 등급 없음
    await expectDbError(conn.query(listingSql({ gs: "'PSA'", grade: "'10'" }), base), CHECK); // 미개봉인데 등급 있음
    await expectDbError(conn.query(listingSql({ cond: "'graded'", gs: "'XYZ'", grade: "'10'" }), base), CHECK);
    await expectDbError(conn.query(listingSql({ cond: "'graded'", gs: "'PSA'", grade: "'11'" }), base), CHECK);
    await expectDbError(conn.query(listingSql({ delivery: '0', direct: '0' }), base), CHECK);
    await expectDbError(conn.query(listingSql({ price: '0' }), base), CHECK);
    await expectDbError(conn.query(listingSql({ price: '1000000001' }), base), CHECK);
    await expectDbError(conn.query(listingSql({ status: "'sold'" }), base), CHECK); // 거래완료인데 거래가 없음

    // 이미지
    await expectDbError(conn.query("INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'auth', 'a1', 0)", [listing, seller]), DUP);
    await expectDbError(conn.query("INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'auth', 'a1', 1)", [listing, seller]), CHECK);
    await expectDbError(conn.query("INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'photo', 'p10', 10)", [listing, seller]), CHECK);
    await expectDbError(conn.query("INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'video', 'v', 1)", [listing, seller]), CHECK);
    await expectDbError(conn.query("INSERT INTO post_images (post_id, uploader_id, url, sort_order) VALUES (?, ?, 'i4', 4)", [post, buyer]), CHECK);

    // 찜·리액션·좋아요·투표 중복
    await expectDbError(conn.query('INSERT INTO wishes (user_id, listing_id) VALUES (?, ?)', [buyer, listing]), DUP);
    await expectDbError(conn.query("INSERT INTO post_reactions (user_id, post_id, type) VALUES (?, ?, 'ice')", [seller, post]), DUP);
    await expectDbError(conn.query("INSERT INTO post_reactions (user_id, post_id, type) VALUES (?, ?, 'like')", [buyer, post]), CHECK);
    await expectDbError(conn.query("INSERT INTO item_votes (user_id, item_id, vote_date, direction) VALUES (?, ?, '2026-11-13', 'down')", [buyer, item]), DUP);
    await expectDbError(conn.query("INSERT INTO item_votes (user_id, item_id, vote_date, direction) VALUES (?, ?, '2026-11-14', 'sideways')", [buyer, item]), CHECK);
    await conn.query("INSERT INTO item_votes (user_id, item_id, vote_date, direction) VALUES (?, ?, '2026-11-14', 'down')", [buyer, item]); // 다음 날은 허용

    // 토론글·품목 Enum
    await expectDbError(conn.query("INSERT INTO posts (user_id, board, body) VALUES (?, 'music', 'x')", [buyer]), CHECK);
    await expectDbError(conn.query("INSERT INTO posts (user_id, board, tag, body) VALUES (?, 'free', 'chat', 'x')", [buyer]), CHECK);
    await expectDbError(conn.query("INSERT INTO items (category_id, slug, name, language) VALUES (?, 'x2', 'x', 'fr')", [cat]), CHECK);
    await expectDbError(conn.query("INSERT INTO items (category_id, slug, name, set_name, card_no, language) VALUES (?, 'dup-card', 'x', '포켓몬 151 (SV2a)', '201/165', 'ko')", [cat]), DUP);
  } finally {
    await conn.end();
  }
});

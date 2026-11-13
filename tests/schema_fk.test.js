// erd.md의 외래키 25개가 참조 대상·삭제 규칙까지 일치하는지, 없는 행 참조가 거부되는지 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const { TEST_DB, freshSchema, dbConnection, expectDbError } = require('./helpers/db');

// [테이블, 컬럼, 참조 테이블, ON DELETE 규칙] — 참조 컬럼은 모두 id
const EXPECTED_FKS = [
  ['categories', 'parent_id', 'categories', 'RESTRICT'],
  ['comment_likes', 'comment_id', 'comments', 'CASCADE'],
  ['comment_likes', 'user_id', 'users', 'CASCADE'],
  ['comments', 'parent_id', 'comments', 'CASCADE'],
  ['comments', 'post_id', 'posts', 'CASCADE'],
  ['comments', 'user_id', 'users', 'RESTRICT'],
  ['item_votes', 'item_id', 'items', 'CASCADE'],
  ['item_votes', 'user_id', 'users', 'CASCADE'],
  ['items', 'category_id', 'categories', 'RESTRICT'],
  ['listing_images', 'listing_id', 'listings', 'SET NULL'],
  ['listing_images', 'uploader_id', 'users', 'RESTRICT'],
  ['listing_views', 'listing_id', 'listings', 'CASCADE'],
  ['listings', 'buyer_id', 'users', 'SET NULL'],
  ['listings', 'category_id', 'categories', 'RESTRICT'],
  ['listings', 'item_id', 'items', 'RESTRICT'],
  ['listings', 'seller_id', 'users', 'RESTRICT'],
  ['post_images', 'post_id', 'posts', 'SET NULL'],
  ['post_images', 'uploader_id', 'users', 'RESTRICT'],
  ['post_reactions', 'post_id', 'posts', 'CASCADE'],
  ['post_reactions', 'user_id', 'users', 'CASCADE'],
  ['posts', 'user_id', 'users', 'RESTRICT'],
  ['refresh_tokens', 'user_id', 'users', 'CASCADE'],
  ['wishes', 'listing_id', 'listings', 'CASCADE'],
  ['wishes', 'user_id', 'users', 'CASCADE'],
];
// erd.md 기준 25개 중 posts.item_id를 뺀 24개 (posts.item_id는 이번 범위에서 FK 없음, SPEC 참고)

test('외래키 목록·삭제 규칙', async () => {
  await freshSchema();
  const conn = await dbConnection();
  try {
    const [rows] = await conn.query(
      `SELECT k.TABLE_NAME AS t, k.COLUMN_NAME AS c, k.REFERENCED_TABLE_NAME AS rt,
              k.REFERENCED_COLUMN_NAME AS rc, r.DELETE_RULE AS del
         FROM information_schema.KEY_COLUMN_USAGE k
         JOIN information_schema.REFERENTIAL_CONSTRAINTS r
           ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
        WHERE k.TABLE_SCHEMA = ? AND k.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY k.TABLE_NAME, k.COLUMN_NAME`,
      [TEST_DB],
    );
    for (const r of rows) assert.equal(r.rc, 'id', `${r.t}.${r.c}는 id를 참조해야 함`);
    assert.deepEqual(rows.map((r) => [r.t, r.c, r.rt, r.del]), EXPECTED_FKS);
    assert.ok(!rows.some((r) => r.t === 'posts' && r.c === 'item_id'), 'posts.item_id에는 FK가 없어야 함');
  } finally {
    await conn.end();
  }
});

test('없는 행 참조 거부 + CASCADE / SET NULL 동작', async () => {
  await freshSchema();
  const conn = await dbConnection();
  try {
    await expectDbError(
      conn.query("INSERT INTO items (category_id, slug, name) VALUES (999, 'x', 'x')"),
      'ER_NO_REFERENCED_ROW_2',
    );

    await conn.query("INSERT INTO users (login_id, password_hash, nickname) VALUES ('fk1', 'x', 'fk1')");
    const [[{ id: userId }]] = await conn.query("SELECT id FROM users WHERE login_id = 'fk1'");
    await conn.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, REPEAT('a', 64), NOW())",
      [userId],
    );
    await conn.query('DELETE FROM users WHERE id = ?', [userId]);
    const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM refresh_tokens');
    assert.equal(n, 0, '회원을 하드 삭제하면 refresh 토큰도 CASCADE로 지워져야 함');

    await conn.query("INSERT INTO users (login_id, password_hash, nickname) VALUES ('fk2', 'x', 'fk2')");
    const [[{ id: u2 }]] = await conn.query("SELECT id FROM users WHERE login_id = 'fk2'");
    await conn.query("INSERT INTO categories (code, name) VALUES ('pokemon', '포켓몬 카드')");
    const [[{ id: catId }]] = await conn.query('SELECT id FROM categories');
    await conn.query("INSERT INTO items (category_id, slug, name) VALUES (?, 'i1', '리자몽')", [catId]);
    const [[{ id: itemId }]] = await conn.query('SELECT id FROM items');
    await conn.query(
      `INSERT INTO listings (seller_id, item_id, category_id, title, price, \`condition\`, delivery, agreed_at)
       VALUES (?, ?, ?, '리자몽', 1000, 'unopened', 1, NOW())`,
      [u2, itemId, catId],
    );
    const [[{ id: listingId }]] = await conn.query('SELECT id FROM listings');
    await conn.query(
      "INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'photo', 'u', 0)",
      [listingId, u2],
    );
    await conn.query('DELETE FROM listings WHERE id = ?', [listingId]);
    const [[img]] = await conn.query('SELECT listing_id FROM listing_images');
    assert.equal(img.listing_id, null, '판매글을 하드 삭제하면 이미지의 listing_id는 NULL이 되어야 함');

    await expectDbError(
      conn.query('DELETE FROM categories WHERE id = ?', [catId]),
      'ER_ROW_IS_REFERENCED_2',
    );
  } finally {
    await conn.end();
  }
});

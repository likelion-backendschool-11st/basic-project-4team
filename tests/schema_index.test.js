// erd.md 2장의 인덱스(UNIQUE·일반·FULLTEXT·복합 PK)가 이름·컬럼 순서·종류까지 있는지 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const { TEST_DB, freshSchema, dbConnection } = require('./helpers/db');

// [테이블, 인덱스 이름, 컬럼(순서대로), 종류] 종류: PK | UNIQUE | INDEX | FULLTEXT
const EXPECTED_INDEXES = [
  ['users', 'PRIMARY', ['id'], 'PK'],
  ['users', 'uk_users_login_id', ['login_id'], 'UNIQUE'],
  ['users', 'uk_users_nickname', ['nickname'], 'UNIQUE'],
  ['users', 'uk_users_email', ['email'], 'UNIQUE'],

  ['refresh_tokens', 'PRIMARY', ['id'], 'PK'],
  ['refresh_tokens', 'uk_refresh_tokens_hash', ['token_hash'], 'UNIQUE'],
  ['refresh_tokens', 'idx_refresh_tokens_expires', ['expires_at'], 'INDEX'],

  ['categories', 'PRIMARY', ['id'], 'PK'],
  ['categories', 'uk_categories_code', ['code'], 'UNIQUE'],
  ['categories', 'idx_categories_parent_sort', ['parent_id', 'sort_order'], 'INDEX'],

  ['items', 'PRIMARY', ['id'], 'PK'],
  ['items', 'uk_items_slug', ['slug'], 'UNIQUE'],
  ['items', 'uk_items_card', ['category_id', 'set_name', 'card_no', 'language'], 'UNIQUE'],
  ['items', 'ft_items_name', ['name', 'set_name'], 'FULLTEXT'],

  ['listings', 'PRIMARY', ['id'], 'PK'],
  ['listings', 'uk_listings_registration_no', ['registration_no'], 'UNIQUE'],
  ['listings', 'idx_listings_cat_status_created', ['category_id', 'status', 'created_at'], 'INDEX'],
  ['listings', 'idx_listings_cat_status_price', ['category_id', 'status', 'price'], 'INDEX'],
  ['listings', 'idx_listings_item_status_price', ['item_id', 'status', 'price'], 'INDEX'],
  ['listings', 'idx_listings_market',
    ['item_id', 'status', 'condition', 'grading_service', 'grade', 'sold_at'], 'INDEX'],
  ['listings', 'idx_listings_seller_status_created', ['seller_id', 'status', 'created_at'], 'INDEX'],
  ['listings', 'idx_listings_status_sold_at', ['status', 'sold_at'], 'INDEX'],
  ['listings', 'ft_listings_title', ['title'], 'FULLTEXT'],

  ['listing_images', 'PRIMARY', ['id'], 'PK'],
  ['listing_images', 'uk_listing_images_order', ['listing_id', 'type', 'sort_order'], 'UNIQUE'],
  ['listing_images', 'idx_listing_images_orphan', ['listing_id', 'created_at'], 'INDEX'],

  ['wishes', 'PRIMARY', ['user_id', 'listing_id'], 'PK'],

  ['listing_views', 'PRIMARY', ['listing_id', 'viewer_key', 'viewed_on'], 'PK'],
  ['listing_views', 'idx_listing_views_date', ['viewed_on'], 'INDEX'],

  ['posts', 'PRIMARY', ['id'], 'PK'],
  ['posts', 'idx_posts_board_created', ['board', 'created_at'], 'INDEX'],
  ['posts', 'idx_posts_item_created', ['item_id', 'created_at'], 'INDEX'],
  ['posts', 'idx_posts_created_item', ['created_at', 'item_id'], 'INDEX'],

  ['post_images', 'PRIMARY', ['id'], 'PK'],
  ['post_images', 'uk_post_images_order', ['post_id', 'sort_order'], 'UNIQUE'],
  ['post_images', 'idx_post_images_orphan', ['post_id', 'created_at'], 'INDEX'],

  ['post_reactions', 'PRIMARY', ['user_id', 'post_id'], 'PK'],
  ['post_reactions', 'idx_post_reactions_post_type', ['post_id', 'type'], 'INDEX'],

  ['comments', 'PRIMARY', ['id'], 'PK'],
  ['comments', 'idx_comments_post_parent_id', ['post_id', 'parent_id', 'id'], 'INDEX'],
  ['comments', 'idx_comments_parent_id', ['parent_id', 'id'], 'INDEX'],
  ['comments', 'idx_comments_created', ['created_at'], 'INDEX'],

  ['comment_likes', 'PRIMARY', ['user_id', 'comment_id'], 'PK'],

  ['item_votes', 'PRIMARY', ['user_id', 'item_id', 'vote_date'], 'PK'],
  ['item_votes', 'idx_item_votes_item_date', ['item_id', 'vote_date', 'direction'], 'INDEX'],
];

function kindOf(row) {
  if (row.name === 'PRIMARY') return 'PK';
  if (row.type === 'FULLTEXT') return 'FULLTEXT';
  return row.nonUnique ? 'INDEX' : 'UNIQUE';
}

test('erd.md 인덱스가 모두 존재 (이름·컬럼 순서·종류)', async () => {
  await freshSchema();
  const conn = await dbConnection();
  try {
    const [rows] = await conn.query(
      `SELECT TABLE_NAME AS t, INDEX_NAME AS name, COLUMN_NAME AS col, SEQ_IN_INDEX AS seq,
              NON_UNIQUE AS nonUnique, INDEX_TYPE AS type
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`,
      [TEST_DB],
    );
    const actual = new Map();
    for (const r of rows) {
      const key = `${r.t}.${r.name}`;
      if (!actual.has(key)) actual.set(key, { cols: [], kind: kindOf(r) });
      actual.get(key).cols.push(r.col);
    }

    const problems = [];
    for (const [table, name, cols, kind] of EXPECTED_INDEXES) {
      const got = actual.get(`${table}.${name}`);
      if (!got) {
        problems.push(`없음: ${table}.${name}`);
      } else if (got.cols.join(',') !== cols.join(',') || got.kind !== kind) {
        problems.push(`다름: ${table}.${name} 기대 ${kind}(${cols}) 실제 ${got.kind}(${got.cols})`);
      }
    }
    assert.deepEqual(problems, []);

    const [[{ 'Create Table': ddl }]] = await conn.query('SHOW CREATE TABLE items');
    assert.match(ddl, /FULLTEXT KEY `ft_items_name`[^\n]*WITH PARSER `ngram`/, 'FULLTEXT는 ngram 파서');
  } finally {
    await conn.end();
  }
});

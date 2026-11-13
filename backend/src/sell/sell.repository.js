const pool = require('../config/db');

const MARKET_PRICE_DAYS = 30;

const SELECT_LISTING_DETAIL = `
  SELECT
    l.*,
    i.slug AS item_slug, i.name AS item_name, i.set_name AS item_set_name,
    i.card_no AS item_card_no, i.language AS item_language, i.rarity AS item_rarity,
    i.image_url AS item_image_url,
    c.id AS category_id, c.code AS category_code, c.name AS category_name,
    pc.id AS parent_category_id, pc.code AS parent_category_code, pc.name AS parent_category_name,
    u.nickname AS seller_nickname
  FROM listings l
  JOIN items i ON i.id = l.item_id
  JOIN categories c ON c.id = i.category_id
  LEFT JOIN categories pc ON pc.id = c.parent_id
  JOIN users u ON u.id = l.seller_id
  WHERE l.id = ? AND l.deleted_at IS NULL
`;

/** DB 행(snake_case) → API용 객체(camelCase). 시세·찜·이미지처럼 별도 쿼리로 얻는 값은 service에서 붙인다. */
function toListingDetail(row) {
  const category = { id: row.category_id, code: row.category_code, name: row.category_name };
  const parentCategory = row.parent_category_id === null
    ? null
    : { id: row.parent_category_id, code: row.parent_category_code, name: row.parent_category_name };

  return {
    id: row.id,
    registrationNo: row.registration_no,
    title: row.title,
    price: row.price,
    status: row.status,
    condition: row.condition,
    gradingService: row.grading_service,
    grade: row.grade,
    directLocation: row.direct ? row.direct_location : null,
    wishCount: row.wish_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    delivery: Boolean(row.delivery),
    direct: Boolean(row.direct),
    item: {
      id: row.item_id,
      slug: row.item_slug,
      name: row.item_name,
      setName: row.item_set_name,
      cardNo: row.item_card_no,
      language: row.item_language,
      rarity: row.item_rarity,
      imageUrl: row.item_image_url,
      category,
    },
    // 대분류 → 소분류 순서
    breadcrumbs: parentCategory ? [parentCategory, category] : [category],
    viewCount: row.view_count,
    seller: { id: row.seller_id, nickname: row.seller_nickname },
    soldPrice: row.sold_price,
  };
}

/** 삭제되지 않은 판매글 상세. 없으면 null. */
async function findDetailById(listingId) {
  const [rows] = await pool.execute(SELECT_LISTING_DETAIL, [listingId]);
  return rows.length === 0 ? null : toListingDetail(rows[0]);
}

/** 상품 사진(sortOrder 오름차순)과 실물 인증 사진. */
async function findImages(listingId) {
  const [rows] = await pool.execute(
    'SELECT id, type, url, sort_order FROM listing_images WHERE listing_id = ? ORDER BY type, sort_order',
    [listingId],
  );
  const images = rows
    .filter((row) => row.type === 'photo')
    .map((row) => ({ id: row.id, url: row.url, sortOrder: row.sort_order }));
  const authRow = rows.find((row) => row.type === 'auth');
  return { images, authImage: authRow ? { id: authRow.id, url: authRow.url } : null };
}

/** 같은 품목·상태·그레이딩사·등급의 최근 30일 체결가. 거래 이력이 없으면 null. */
async function findMarketPrice({ itemId, condition, gradingService, grade }) {
  // <=> 는 NULL끼리도 같다고 보는 비교 — 그레이딩이 없는 판매글(NULL)도 같은 조건끼리 묶인다.
  const [[row]] = await pool.execute(
    `SELECT AVG(sold_price) AS averagePrice, COUNT(*) AS tradeCount
     FROM listings
     WHERE item_id = ? AND status = 'sold' AND \`condition\` = ?
       AND grading_service <=> ? AND grade <=> ?
       AND sold_at >= UTC_TIMESTAMP() - INTERVAL ${MARKET_PRICE_DAYS} DAY
       AND deleted_at IS NULL`,
    [itemId, condition, gradingService, grade],
  );
  if (row.tradeCount === 0) return null;
  // AVG 결과는 DECIMAL이라 문자열로 온다. 금액은 원 단위 정수.
  return { averagePrice: Math.round(Number(row.averagePrice)), tradeCount: row.tradeCount };
}

/** 판매자의 거래완료 판매글 수. */
async function countSoldBySeller(sellerId) {
  const [[{ soldCount }]] = await pool.execute(
    "SELECT COUNT(*) AS soldCount FROM listings WHERE seller_id = ? AND status = 'sold' AND deleted_at IS NULL",
    [sellerId],
  );
  return soldCount;
}

async function isWishedBy(listingId, userId) {
  const [rows] = await pool.execute(
    'SELECT 1 FROM wishes WHERE user_id = ? AND listing_id = ? LIMIT 1',
    [userId, listingId],
  );
  return rows.length > 0;
}

/**
 * 같은 사람이 같은 날 처음 볼 때만 조회수를 1 올린다.
 * 올렸으면 true. listing_views 기록과 view_count 증가를 한 트랜잭션으로 묶는다.
 */
async function increaseViewCount(listingId, viewerKey, viewedOn) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'INSERT IGNORE INTO listing_views (listing_id, viewer_key, viewed_on) VALUES (?, ?, ?)',
      [listingId, viewerKey, viewedOn],
    );
    const isFirstView = result.affectedRows === 1;
    if (isFirstView) {
      await connection.execute('UPDATE listings SET view_count = view_count + 1 WHERE id = ?', [listingId]);
    }
    await connection.commit();
    return isFirstView;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  findDetailById,
  findImages,
  findMarketPrice,
  countSoldBySeller,
  isWishedBy,
  increaseViewCount,
};

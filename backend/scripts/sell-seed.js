/**
 * npm run db:seed:sell — 판매글 화면 확인용 더미 데이터(카테고리·품목·판매글·사진).
 * npm run db:seed(테스트 계정) 다음에 실행한다. 이미 있는 데이터는 건너뛴다.
 *  1) 상세 화면용: 리자몽 판매글 1건 + 거래완료 2건 (/listings/1)
 *  2) 검색 결과 화면용: 목 카드 10건 + 카드별 거래완료 1건 (sell-seed-cards.js)
 */
const { connect, exitWithHint } = require('./db-common');
const SEARCH_CARDS = require('./sell-seed-cards');

const MINUTES_PER_DAY = 24 * 60;
const CARD_SOLD_DAYS_AGO = 5;
const CARD_SOLD_CREATED_DAYS_AGO = 15;

const IMG = 'https://lh3.googleusercontent.com/aida-public/';
const IMAGES = {
  front: `${IMG}AB6AXuBz6f5RB_Wu1rjJSocCNZRzZGPaNxwKouAjsEDZMLYhz5h2DuFAT89nl-IITFebBSH8CSuvWRJDROqC0hzCfe4PxMaXnPpoJpo3mmoofRuHyimt2mgKeQjJ812s5pb3PD6hXCFFG5uN0DJUBoOOTxmTFtN36ejzs-IibTxckKlKBycWv0vL4c5Gkmtj1ohZXiJQMpAbycWF-mXX5cpOzE5N7cMPN-xCnIuqIbUlUDs`,
  back: `${IMG}AB6AXuB_y3X02C2Lb3Bat1Vk4VhGMWPfE8Q34PO3iu54um1gLnpX1u6jQNdv0he3AnDCJSXDAF_7cK8PvZmTiG4zMgt_6YK3HjaLr-8pyWcK5VC-rVynWmDgc8oPJbYSD2JqDvAkDhKfEmJ6DJxjAuozgx1BJPhbv1JRgZ7g-L-0Ek6HvN-5ISF_dYKsHMin87USw2DqNDn0iYcJo5Q-huwKm_7cWgmt2CQgIHrW4t0TSCY`,
  corner: `${IMG}AB6AXuCQeI2PNeoNd89MnjgZUhdzZueVf2ksinibQSU0B26UyXb6VkHWP6Oqc7PdsjnjZ2UegZpDTWRjS3EeQ7N43tmpNsp2vzh7FIc8U_qSJH7ey9o7UX3aTsm2e6O7s2DrSRjKojavXZxwgMb_Oz8IA88Fx8J_Of_4aePzEQL8szsyNmZBuOaeWO1dhDh-2MSTtcZSqy0iTSRHuexRKBH-ujsoFvU8CaOJNwLy63UFBqI`,
  label: `${IMG}AB6AXuBUkz3a_q2GLIzAbqIZo1sXBCNMQ6EZtJi9_0BGIHYR5tOUabKxlSJc8CnyBA1EdDfQl-FtqPNtbt6gsBA0cnQQX7rFZcA0lBkhsMysZt3NA-HtZ_M3Qegg6a8CIlVJw08qidBjntkmeS6BXV20kafuZTZ1lAUT7bg22YLTmarWmii1lFVx7pi_V7zSz7il2YLAUU2pUFq5-nl-N6KPDKzLczz4HdmT1lmw7VP_Zbo`,
  auth: `${IMG}AB6AXuBLyvGJdN3n_Qlhae5aMXkQKmNS7njyl9i0FyhU1P--1FXtZNKJfSi-jE6eqPtBJP678nRtnL5mysy9Jc8HxxbOOP8CQYj1TjHRKjBXt5Zq2yVW5ETy8BRwOEv946z8g8XIrSEtWcj__rGb71bqeX_ZkXOHGiZghFgV36-StZOEL3H_kqVBxYjRtWOxdSvjhk2DIWSqHwsbiC7MWFXKEE-rnCZW5VG1ECTecPrTH98`,
};

const ITEM = {
  slug: 'charizard-ex-sar-sv2a-201',
  name: '리자몽 ex SAR',
  setName: '포켓몬 151 (SV2a)',
  cardNo: '201/165',
  language: 'ko',
  rarity: 'SAR',
  imageUrl: IMAGES.front,
};

const DESCRIPTION = [
  '직접 한국판 포켓몬 151 박스를 개봉해 얻은 뒤 바로 PSA에 그레이딩을 접수한 원오너 소장품입니다.',
  '보관 상태: PSA 슬랩 전용 슬리브 + 제습 캐비닛에 보관했습니다.\n케이스 외부 스크래치 없고 모서리·홀로그램 상태 좋습니다.',
  '거래 방식: 사당역 부근 직거래 가능, 택배는 3중 완충 포장 + 안심택배로 당일 발송합니다.',
].join('\n\n');

/** 테이블이 비어 있으면 id를 1부터 다시 쓰게 한다 — /listings/1 로 바로 확인할 수 있도록. */
async function resetAutoIncrementIfEmpty(connection, table) {
  const [[{ count }]] = await connection.query(`SELECT COUNT(*) AS count FROM ${table}`);
  if (count === 0) await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
}

async function findUserId(connection, loginId) {
  const [[user]] = await connection.execute('SELECT id FROM users WHERE login_id = ?', [loginId]);
  if (!user) throw new Error(`테스트 계정 ${loginId}가 없습니다. 먼저 npm run db:seed 를 실행하세요.`);
  return user.id;
}

async function insertListing(connection, listing) {
  const [result] = await connection.execute(
    `INSERT INTO listings
       (seller_id, item_id, category_id, title, description, price, \`condition\`, grading_service, grade,
        delivery, direct, direct_location, agreed_at, status, view_count, wish_count, sold_price, sold_at, buyer_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?, ?, ?,
             IF(? IS NULL, NULL, UTC_TIMESTAMP() - INTERVAL ? DAY), ?, UTC_TIMESTAMP() - INTERVAL ? MINUTE)`,
    [
      listing.sellerId, listing.itemId, listing.categoryId, listing.title, listing.description ?? '',
      listing.price, listing.condition, listing.gradingService ?? null, listing.grade ?? null,
      listing.delivery ? 1 : 0, listing.direct ? 1 : 0, listing.directLocation ?? null,
      listing.status ?? 'selling', listing.viewCount ?? 0, listing.wishCount ?? 0, listing.soldPrice ?? null,
      listing.soldDaysAgo ?? null, listing.soldDaysAgo ?? 0, listing.buyerId ?? null,
      listing.createdMinutesAgo ?? (listing.createdDaysAgo ?? 0) * MINUTES_PER_DAY,
    ],
  );
  const id = result.insertId;
  await connection.execute(
    "UPDATE listings SET registration_no = CONCAT('RPC-', YEAR(created_at), '-', LPAD(id, 6, '0')) WHERE id = ?",
    [id],
  );
  return id;
}

/** 카드 > 포켓몬 카테고리를 만들고(이미 있으면 그대로) 포켓몬 카테고리 id를 돌려준다. */
async function ensurePokemonCategory(connection) {
  await connection.execute(
    "INSERT IGNORE INTO categories (code, name, sort_order) VALUES ('card', '트레이딩 카드 (TCG)', 1)",
  );
  const [[card]] = await connection.query("SELECT id FROM categories WHERE code = 'card'");
  await connection.execute(
    "INSERT IGNORE INTO categories (parent_id, code, name, sort_order) VALUES (?, 'pokemon', '포켓몬 카드', 1)",
    [card.id],
  );
  const [[pokemon]] = await connection.query("SELECT id FROM categories WHERE code = 'pokemon'");
  return pokemon.id;
}

/** 1) 상세 화면용 리자몽 판매글. 품목이 이미 있으면 건너뛴다. */
async function seedDetailListing(connection) {
  const [existing] = await connection.execute('SELECT id FROM items WHERE slug = ?', [ITEM.slug]);
  if (existing.length > 0) {
    console.log('⏭  상세 화면용 판매글이 이미 있음 — 건너뜀');
    return;
  }
  const seller = await findUserId(connection, 'test1');
  const buyers = [await findUserId(connection, 'test2'), await findUserId(connection, 'test3')];

  for (const table of ['categories', 'items', 'listings', 'listing_images']) {
    await resetAutoIncrementIfEmpty(connection, table);
  }

  await connection.beginTransaction();
  try {
    const pokemonId = await ensurePokemonCategory(connection);
    const pokemon = { id: pokemonId };

    const [item] = await connection.execute(
      `INSERT INTO items (category_id, slug, name, set_name, card_no, language, rarity, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pokemon.id, ITEM.slug, ITEM.name, ITEM.setName, ITEM.cardNo, ITEM.language, ITEM.rarity, ITEM.imageUrl],
    );
    const base = { sellerId: seller, itemId: item.insertId, categoryId: pokemon.id };

    // 1번: 판매중인 판매글 (화면 확인용)
    const listingId = await insertListing(connection, {
      ...base,
      title: '[PSA 10] 리자몽 ex SAR (SV2a 201/165)',
      description: DESCRIPTION,
      price: 300000,
      condition: 'graded',
      gradingService: 'PSA',
      grade: '10',
      delivery: true,
      direct: true,
      directLocation: '서울 관악구 남현동 (사당역 인근)',
      viewCount: 1420,
      createdDaysAgo: 9,
    });
    const photos = [IMAGES.front, IMAGES.back, IMAGES.corner, IMAGES.label];
    for (const [sortOrder, url] of photos.entries()) {
      await connection.execute(
        "INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'photo', ?, ?)",
        [listingId, seller, url, sortOrder],
      );
    }
    await connection.execute(
      "INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'auth', ?, 0)",
      [listingId, seller, IMAGES.auth],
    );

    // 같은 품목·등급의 거래완료 2건 → 30일 시세 320,000원, 판매자 거래완료 2회
    for (const [i, soldPrice] of [310000, 330000].entries()) {
      await insertListing(connection, {
        ...base,
        title: `[PSA 10] 리자몽 ex SAR 거래완료 ${i + 1}`,
        price: soldPrice,
        condition: 'graded',
        gradingService: 'PSA',
        grade: '10',
        delivery: true,
        status: 'sold',
        soldPrice,
        soldDaysAgo: 3 + i * 7,
        buyerId: buyers[i],
        createdDaysAgo: 20,
      });
    }

    await connection.commit();
    console.log(`➕ 상세 화면용 판매글 추가 — http://127.0.0.1:4173/listings/${listingId}`);
  } catch (err) {
    await connection.rollback().catch(() => {});
    throw err;
  }
}

/** 목 카드의 "시세 대비 %"가 나오도록 하는 30일 평균 체결가. 0%면 같은 가격. */
const toMarketPrice = (price, rate) => Math.round(price / (1 + rate / 100));

/** 2) 검색 결과 화면용 카드 10건. 카드마다 품목 slug로 확인해 이미 있으면 건너뛴다. */
async function seedSearchCards(connection) {
  const users = {
    test1: await findUserId(connection, 'test1'),
    test2: await findUserId(connection, 'test2'),
    test3: await findUserId(connection, 'test3'),
  };
  let added = 0;
  for (const card of SEARCH_CARDS) {
    const [existing] = await connection.execute('SELECT id FROM items WHERE slug = ?', [card.slug]);
    if (existing.length > 0) continue;

    await connection.beginTransaction();
    try {
      const categoryId = await ensurePokemonCategory(connection);
      const [item] = await connection.execute(
        `INSERT INTO items (category_id, slug, name, set_name, card_no, language, rarity, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [categoryId, card.slug, card.itemName, card.setName, card.cardNo, card.language, card.rarity, card.imageUrl],
      );
      const sellerId = users[card.seller];
      const base = {
        itemId: item.insertId,
        categoryId,
        condition: card.condition,
        gradingService: card.gradingService,
        grade: card.grade,
        delivery: true,
      };
      const listingId = await insertListing(connection, {
        ...base,
        sellerId,
        title: card.title,
        price: card.price,
        direct: Boolean(card.directLocation),
        directLocation: card.directLocation,
        status: card.status,
        wishCount: card.wishCount,
        createdMinutesAgo: card.createdMinutesAgo,
      });
      await connection.execute(
        "INSERT INTO listing_images (listing_id, uploader_id, type, url, sort_order) VALUES (?, ?, 'photo', ?, 0)",
        [listingId, sellerId, card.imageUrl],
      );
      // 같은 품목·등급의 거래완료 1건 → 카드에 목 데이터와 같은 "시세 대비 %"가 나온다.
      const soldPrice = toMarketPrice(card.price, card.marketRate);
      await insertListing(connection, {
        ...base,
        sellerId,
        title: `${card.title} (거래완료)`,
        price: soldPrice,
        status: 'sold',
        soldPrice,
        soldDaysAgo: CARD_SOLD_DAYS_AGO,
        buyerId: users[card.seller === 'test2' ? 'test3' : 'test2'],
        createdDaysAgo: CARD_SOLD_CREATED_DAYS_AGO,
      });
      await connection.commit();
      added += 1;
    } catch (err) {
      await connection.rollback().catch(() => {});
      throw err;
    }
  }
  console.log(added > 0
    ? `➕ 검색 결과 화면용 카드 ${added}건 추가 — http://127.0.0.1:4173/search?q=리자몽`
    : '⏭  검색 결과 화면용 카드가 이미 있음 — 건너뜀');
}

async function main() {
  const connection = await connect();
  try {
    await seedDetailListing(connection);
    await seedSearchCards(connection);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

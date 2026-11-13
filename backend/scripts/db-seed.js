/** npm run db:seed — 개발용 더미 유저·품목·판매글·토론글·댓글·좋아요·신고를 넣는다. 이미 있는 데이터는 건너뛴다. */
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
  // 4~9: 품목별 토론방 더미 (#38). item_id는 품목 slug
  {
    loginId: 'test2', board: 'pokemon', tag: 'analysis', itemId: 'charizard-ex-sar-sv2a-201', title: null,
    body: '일본판 SV2a 리자몽 PSA10, 이번 주 들어 5% 정도 빠졌네요. 한국판과 가격 차이가 좁혀지는 중입니다.',
  },
  {
    loginId: 'test3', board: 'pokemon', tag: 'qna', itemId: 'charizard-ex-sar-sv2a-201', title: null,
    body: '일본판 vs 한국판, 장기 소장용이면 어느 쪽이 나을까요?',
  },
  {
    loginId: 'test1', board: 'pokemon', tag: 'info', itemId: 'charizard-ex-sar-sv2a-201', title: null,
    body: 'PSA 접수 대행 이번 달 마감 일정 공유합니다. 일본판 SAR은 센터링 기준이 까다로우니 꼭 확인하고 보내세요.',
  },
  {
    loginId: 'test1', board: 'onepiece', tag: 'analysis', itemId: 'luffy-gear5', title: null,
    body: '기어5 패러렐 시세가 3일째 18만 원에서 보합이네요. 신규 부스터 발매 전까지는 이 가격대 유지될 듯.',
  },
  {
    // 유희왕 게시판이 없어 자유게시판(free)
    loginId: 'test3', board: 'free', tag: 'info', itemId: 'blue-eyes-white-dragon', title: null,
    body: '쿼터 센츄리 크로니클 푸른 눈의 백룡 첫 거래가 9만 5천 원에 체결됐습니다.',
  },
  {
    loginId: 'test2', board: 'sneakers', tag: 'verify', itemId: 'dunk-low-panda', title: null,
    body: '덩크 로우 범고래 정품 검수 포인트 정리했어요. 힐탭 자수 간격과 박스 라벨 폰트를 먼저 보세요.',
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
  let added = 0;
  for (const [index, post] of SEED_POSTS.entries()) {
    // 같은 품목·본문의 글이 있으면 건너뛴다 → 나중에 추가한 시드 글만 들어간다.
    const [existing] = await connection.execute(
      'SELECT 1 FROM posts WHERE item_id <=> ? AND body = ? LIMIT 1',
      [post.itemId, post.body],
    );
    if (existing.length > 0) continue;
    // 댓글보다 먼저 쓴 글이 되도록 하루 이상 전으로. 앞쪽 글일수록 오래됨(3시간 간격).
    const hoursAgo = 24 + (SEED_POSTS.length - index) * 3;
    await connection.execute(
      `INSERT INTO posts (user_id, board, tag, item_id, title, body, created_at, updated_at)
       SELECT id, ?, ?, ?, ?, ?, UTC_TIMESTAMP() - INTERVAL ? HOUR, UTC_TIMESTAMP() - INTERVAL ? HOUR
       FROM users WHERE login_id = ?`,
      [post.board, post.tag, post.itemId, post.title, post.body, hoursAgo, hoursAgo, post.loginId],
    );
    added += 1;
  }
  console.log(added ? `➕ 토론글 ${added}개 추가` : '⏭  토론글이 이미 있음 — 건너뜀');
}

// 댓글. post는 SEED_POSTS의 인덱스. deleted면 소프트 삭제된 댓글(답글이 있으면 "삭제된 댓글입니다"로 남음).
// 0번 글: 댓글 12개(프론트 첫 페이지 10개 → "댓글 더보기"), 답글 5개(미리보기 3개 → "답글 더보기"), 삭제된 댓글
// 3번 글: 댓글 없음(빈 상태 확인용)
const SEED_COMMENTS = [
  {
    post: 0, author: 'test2', body: '저도 같은 생각이에요. 30만 원 아래로는 매물이 거의 안 보이네요.',
    replies: [
      { author: 'test1', body: '맞아요. 특히 PSA10은 더 귀해졌어요.' },
      { author: 'test3', body: '그래도 신규 팩 재판 소식 나오면 흔들릴 수 있지 않을까요?' },
      { author: 'test2', body: '재판은 일본판 기준이라 한국판은 영향이 적을 것 같아요.' },
      { author: 'test1', body: '작년 재판 때도 한국판은 거의 안 빠졌어요.' },
      { author: 'test3', body: '좋은 정보 감사합니다!' },
    ],
  },
  {
    post: 0, author: 'test3', body: '그레이딩 비용까지 생각하면 지금 가격도 비싸진 않은 것 같아요.', deleted: true,
    replies: [{ author: 'test1', body: '삭제하셨네요 ㅎㅎ 그래도 동의합니다.' }],
  },
  { post: 0, author: 'test3', body: '해외 시세도 같이 오르고 있어서 당분간은 버틸 듯합니다.' },
  { post: 0, author: 'test1', body: '저는 한 장 더 사두려고요.', replies: [{ author: 'test2', body: '어디서 사셨어요?' }] },
  { post: 0, author: 'test2', body: '센터링 좋은 개체는 프리미엄이 더 붙더라고요.' },
  { post: 0, author: 'test3', body: '최근 체결가 그래프 보면 우상향이 확실하네요.' },
  { post: 0, author: 'test1', body: '다음 달 대회 시즌 끝나면 조정 올 수도 있어요.' },
  { post: 0, author: 'test2', body: '대회랑 SAR 시세는 큰 상관 없지 않나요?' },
  { post: 0, author: 'test3', body: '컬렉터 수요가 꾸준해서 장기적으로는 괜찮다고 봅니다.' },
  { post: 0, author: 'test1', body: '실물 인증 사진 꼭 확인하고 사세요. 가품 슬랩도 돌아요.' },
  { post: 0, author: 'test2', body: '좋은 분석 감사합니다. 참고할게요!' },
  { post: 0, author: 'test3', body: '저는 반대로 지금이 고점이라 봐서 정리했어요.' },
  {
    post: 1, author: 'test1', body: '단기 고점일 수는 있는데 장기로 보면 괜찮을 것 같아요.',
    replies: [{ author: 'test2', body: '장기 보유 생각이면 사도 될까요?' }, { author: 'test1', body: '네, 저라면 분할 매수하겠습니다.' }],
  },
  { post: 1, author: 'test3', body: '한 주 정도 지켜보고 사셔도 늦지 않아요.' },
  { post: 1, author: 'test1', body: '거래량이 같이 늘고 있어서 급락은 없을 듯합니다.' },
  { post: 2, author: 'test1', body: '저는 무조건 2015 OG요. 오리지널은 대체 불가죠.' },
  {
    post: 2, author: 'test2', body: '실착용이면 로스트앤파운드가 마음 편해요.',
    replies: [{ author: 'test3', body: '빈티지 박스 감성도 좋더라고요.' }],
  },
  // 품목별 토론방 글 (4~9). 8번 글은 댓글 없음
  {
    post: 4, author: 'test1', body: '한국판이 오를 때 일본판은 따라가지 못하는 흐름이네요.',
    replies: [
      { author: 'test2', body: '네, 해외 물량이 계속 들어오는 게 큰 것 같아요.' },
      { author: 'test3', body: '그래도 PSA10 기준으로는 아직 일본판이 귀하지 않나요?' },
    ],
  },
  { post: 4, author: 'test3', body: '28만 원대면 저는 매수 고려해 볼 만하다고 봅니다.' },
  {
    post: 4, author: 'test1', body: '체결가 그래프 보니 2주 전 31만 원이 고점이었네요.',
    replies: [{ author: 'test2', body: '맞아요. 그때 팔 걸 그랬습니다 ㅠ' }],
  },
  { post: 4, author: 'test2', body: '다음 주 재판 발표 전까지는 더 지켜보려고요.', deleted: true, replies: [{ author: 'test3', body: '재판 소식 있으면 공유 부탁드려요!' }] },
  {
    post: 5, author: 'test1', body: '장기 소장이면 한국판이 물량이 적어서 유리하다고 생각해요.',
    replies: [{ author: 'test3', body: '물량 차이가 그렇게 큰가요?' }, { author: 'test1', body: '한국판 SV2a는 초판 이후 재판이 거의 없었어요.' }],
  },
  { post: 5, author: 'test2', body: '해외 판매까지 생각하면 일본판이 거래하기 편합니다.' },
  { post: 5, author: 'test1', body: '둘 다 PSA10이면 결국 개체 상태가 더 중요하더라고요.' },
  { post: 6, author: 'test2', body: '정보 감사합니다! 이번 달에 꼭 보내야겠네요.' },
  { post: 7, author: 'test2', body: '부스터 발매 일정 나오면 다시 움직일 것 같아요.', replies: [{ author: 'test1', body: '저도 그때까지 홀드합니다.' }] },
  { post: 7, author: 'test3', body: '패러렐 실물 보면 확실히 예쁘긴 하네요.' },
  { post: 9, author: 'test1', body: '박스 라벨 폰트 비교 사진도 올려주실 수 있나요?' },
  { post: 9, author: 'test3', body: '힐탭 자수 팁 감사합니다. 덕분에 가품 걸렀어요.' },
];

/** 댓글이 하나도 없는 시드 글에만 댓글을 넣고, 넣은 뒤 posts.comment_count를 실제 개수로 맞춘다. */
async function seedComments(connection) {
  // 작성 순서(id)와 작성 시각이 같은 순서가 되도록 오래된 것부터 1분씩 늘린다.
  const totalRows = SEED_COMMENTS.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
  let minutesAgo = totalRows * 7;
  // 댓글 시각은 글 작성 시각보다 늦어야 한다 → GREATEST로 보정.
  const insert = async (postId, author, body, parentId) => {
    const [result] = await connection.execute(
      `INSERT INTO comments (post_id, user_id, parent_id, body, created_at, updated_at)
       SELECT p.id, u.id, ?, ?, t.at, t.at
       FROM posts p
       JOIN users u ON u.login_id = ?
       JOIN (SELECT UTC_TIMESTAMP() - INTERVAL ? MINUTE AS at) t
       WHERE p.id = ?`,
      [parentId, body, author, minutesAgo, postId],
    );
    // 답글은 부모 댓글보다도 늦어야 한다.
    await connection.execute(
      `UPDATE comments c
       JOIN posts p ON p.id = c.post_id
       LEFT JOIN comments parent ON parent.id = c.parent_id
       SET c.created_at = GREATEST(c.created_at, COALESCE(parent.created_at, p.created_at) + INTERVAL 1 MINUTE),
           c.updated_at = GREATEST(c.created_at, COALESCE(parent.created_at, p.created_at) + INTERVAL 1 MINUTE)
       WHERE c.id = ?`,
      [result.insertId],
    );
    minutesAgo -= 7;
    return result.insertId;
  };

  let inserted = 0;
  // 시드 글 인덱스 → 글 id. 이미 댓글이 있는 글은 null(건너뜀) — 반복 실행해도 중복되지 않는다.
  const postIds = new Map();
  for (const index of new Set(SEED_COMMENTS.map((c) => c.post))) {
    const [[post]] = await connection.execute(
      `SELECT p.id, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS cnt
       FROM posts p WHERE p.item_id <=> ? AND p.body = ? AND p.deleted_at IS NULL ORDER BY p.id LIMIT 1`,
      [SEED_POSTS[index].itemId, SEED_POSTS[index].body],
    );
    postIds.set(index, post && post.cnt === 0 ? post.id : null);
  }
  for (const comment of SEED_COMMENTS) {
    const post = postIds.get(comment.post) ? { id: postIds.get(comment.post) } : null;
    if (!post) continue;
    const commentId = await insert(post.id, comment.author, comment.body, null);
    for (const reply of comment.replies ?? []) {
      await insert(post.id, reply.author, reply.body, commentId);
    }
    if (comment.deleted) {
      await connection.execute('UPDATE comments SET deleted_at = UTC_TIMESTAMP() WHERE id = ?', [commentId]);
    }
    inserted += 1 + (comment.replies?.length ?? 0);
  }
  await connection.query(
    `UPDATE posts p SET comment_count = (
       SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL
     )`,
  );
  console.log(inserted ? `➕ 댓글·답글 ${inserted}개 추가` : '⏭  댓글이 이미 있음 — 건너뜀');
}

/**
 * 댓글 좋아요. 좋아요 테이블이 비어 있을 때만, 살아 있는 댓글마다 test1~3이 규칙적으로 누른다.
 * (댓글 id + 사용자 순번) % 3 === 0 이면 누르지 않음 → 댓글마다 좋아요 0~3개가 섞인다.
 * 넣은 뒤 comments.like_count를 실제 개수로 맞춘다.
 */
async function seedCommentLikes(connection) {
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM comment_likes');
  if (count > 0) {
    console.log('⏭  댓글 좋아요가 이미 있음 — 건너뜀');
    return;
  }
  const [comments] = await connection.query('SELECT id FROM comments WHERE deleted_at IS NULL');
  const [users] = await connection.query(
    "SELECT id FROM users WHERE login_id IN ('test1', 'test2', 'test3') ORDER BY login_id",
  );
  let added = 0;
  for (const { id: commentId } of comments) {
    for (const [index, { id: userId }] of users.entries()) {
      if ((commentId * 2 + index) % 3 === 0) continue;
      await connection.execute('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userId, commentId]);
      added += 1;
    }
  }
  await connection.query(
    `UPDATE comments c SET like_count = (SELECT COUNT(*) FROM comment_likes l WHERE l.comment_id = c.id)`,
  );
  console.log(`➕ 댓글 좋아요 ${added}개 추가`);
}

/** 신고 예시 2건 (신고 테이블이 비어 있을 때만). 본인 글·댓글은 신고하지 않는다. */
async function seedReports(connection) {
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM reports');
  if (count > 0) {
    console.log('⏭  신고가 이미 있음 — 건너뜀');
    return;
  }
  const [result1] = await connection.query(
    `INSERT INTO reports (reporter_id, target_type, target_id, reason)
     SELECT u.id, 'comment', c.id, 'spam' FROM users u
     JOIN comments c ON c.user_id <> u.id AND c.deleted_at IS NULL
     WHERE u.login_id = 'test1' ORDER BY c.id LIMIT 1`,
  );
  const [result2] = await connection.query(
    `INSERT INTO reports (reporter_id, target_type, target_id, reason, detail)
     SELECT u.id, 'post', p.id, 'etc', '시세 조작이 의심되는 글입니다.' FROM users u
     JOIN posts p ON p.user_id <> u.id AND p.deleted_at IS NULL
     WHERE u.login_id = 'test2' ORDER BY p.id LIMIT 1`,
  );
  console.log(`➕ 신고 ${result1.affectedRows + result2.affectedRows}개 추가`);
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
    await seedComments(connection);
    await seedCommentLikes(connection);
    await seedReports(connection);
    console.log(`✅ 시드 완료. 비밀번호는 모두 ${SEED_PASSWORD}`);
  } finally {
    await connection.end();
  }
}

main().catch(exitWithHint);

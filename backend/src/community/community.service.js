const communityRepository = require('./community.repository');
const HttpError = require('../utils/HttpError');

function postNotFound() {
  return new HttpError(404, 'POST_NOT_FOUND', '토론글을 찾을 수 없습니다.');
}

/**
 * 글 목록에 화면용 값을 붙인다 — isMine, 이모지 개수·내 이모지, 사진, 작성자 배지.
 * 글마다 쿼리하지 않고 글 id를 모아 한 번씩 조회한다. 비로그인이면 viewerId는 undefined.
 */
async function enrich(posts, viewerId) {
  const ids = posts.map((p) => p.id);
  const pairs = posts.filter((p) => p.itemId).map((p) => ({ slug: p.itemId, userId: p.author.id }));
  const [reactions, mine, images, badges] = await Promise.all([
    communityRepository.countReactions(ids),
    communityRepository.findMyReactions(viewerId, ids),
    communityRepository.findImages(ids),
    communityRepository.findAuthorBadges(pairs),
  ]);
  return posts.map((post) => {
    const badge = post.itemId ? badges.get(`${post.itemId}:${post.author.id}`) : null;
    return {
      ...post,
      author: {
        ...post.author,
        // owner = 이 품목 보유자, trade = 이 품목 거래완료 이력
        badges: badge ? ['owner', 'trade'].filter((k) => badge[k]) : [],
      },
      reactions: reactions.get(post.id),
      myReaction: mine.get(post.id) ?? null,
      images: images.get(post.id),
      isMine: viewerId !== undefined && post.author.id === viewerId,
    };
  });
}

async function enrichOne(post, viewerId) {
  const [result] = await enrich([post], viewerId);
  return result;
}

/** 본인 글인지 확인하고 글을 돌려준다. 없으면 404, 남의 글이면 403. */
async function getOwnPost(postId, userId) {
  const post = await communityRepository.findById(postId);
  if (!post) throw postNotFound();
  if (post.author.id !== userId) {
    throw new HttpError(403, 'FORBIDDEN', '본인이 작성한 글만 수정·삭제할 수 있습니다.');
  }
  return post;
}

/** 목록 조회 + 페이지 정보. */
async function listPosts({ board, itemId, tag, ownerOnly, sort, page, size }, viewerId) {
  const { posts, totalCount } = await communityRepository.findMany({
    board,
    itemId,
    tag,
    ownerOnly,
    sort,
    limit: size,
    offset: (page - 1) * size,
  });
  return {
    posts: await enrich(posts, viewerId),
    page,
    size,
    totalCount,
    hasNext: page * size < totalCount,
  };
}

async function getPost(postId, viewerId) {
  const post = await communityRepository.findById(postId);
  if (!post) throw postNotFound();
  return enrichOne(post, viewerId);
}

async function createPost(userId, fields) {
  const post = await communityRepository.create({ userId, ...fields });
  return enrichOne(post, userId);
}

async function updatePost(postId, userId, fields) {
  await getOwnPost(postId, userId);
  const post = await communityRepository.update(postId, fields);
  return enrichOne(post, userId);
}

async function deletePost(postId, userId) {
  await getOwnPost(postId, userId);
  await communityRepository.softDelete(postId);
}

/** 이모지 현황 { reactions, myReaction }. */
async function reactionSummary(postId, userId) {
  const [counts, mine] = await Promise.all([
    communityRepository.countReactions([postId]),
    communityRepository.findMyReactions(userId, [postId]),
  ]);
  return { reactions: counts.get(postId), myReaction: mine.get(postId) ?? null };
}

/** 이모지 남기기·바꾸기 (글당 1인 1개, REQ-BOARD-008). */
async function setReaction(postId, userId, type) {
  if (!(await communityRepository.findById(postId))) throw postNotFound();
  await communityRepository.upsertReaction(userId, postId, type);
  return reactionSummary(postId, userId);
}

/** 이모지 취소. 남긴 적이 없어도 성공(현황 반환). */
async function removeReaction(postId, userId) {
  if (!(await communityRepository.findById(postId))) throw postNotFound();
  await communityRepository.deleteReaction(userId, postId);
  return reactionSummary(postId, userId);
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, setReaction, removeReaction };

const communityRepository = require('./community.repository');
const HttpError = require('../utils/HttpError');

function postNotFound() {
  return new HttpError(404, 'POST_NOT_FOUND', '토론글을 찾을 수 없습니다.');
}

/** 로그인 사용자 기준으로 isMine을 붙인다. 비로그인이면 viewerId는 undefined. */
function withIsMine(post, viewerId) {
  return { ...post, isMine: viewerId !== undefined && post.author.id === viewerId };
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
async function listPosts({ board, itemId, tag, sort, page, size }, viewerId) {
  const { posts, totalCount } = await communityRepository.findMany({
    board,
    itemId,
    tag,
    sort,
    limit: size,
    offset: (page - 1) * size,
  });
  return {
    posts: posts.map((post) => withIsMine(post, viewerId)),
    page,
    size,
    totalCount,
    hasNext: page * size < totalCount,
  };
}

async function getPost(postId, viewerId) {
  const post = await communityRepository.findById(postId);
  if (!post) throw postNotFound();
  return withIsMine(post, viewerId);
}

async function createPost(userId, fields) {
  const post = await communityRepository.create({ userId, ...fields });
  return withIsMine(post, userId);
}

async function updatePost(postId, userId, fields) {
  await getOwnPost(postId, userId);
  const post = await communityRepository.update(postId, fields);
  return withIsMine(post, userId);
}

async function deletePost(postId, userId) {
  await getOwnPost(postId, userId);
  await communityRepository.softDelete(postId);
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost };

const communityRepository = require('./community.repository');
const itemCommunityRepository = require('../itemcommunity/itemcommunity.repository');
const itemCommunityService = require('../itemcommunity/itemcommunity.service');
const badgeService = require('../badge/badge.service');
const HttpError = require('../utils/HttpError');
const { maskProfanity } = require('../utils/profanity');

const { POLL_VOTE_RESULT } = communityRepository;

/** 제목·본문·투표 선택지의 욕설을 가린다 (REQ-COMMON-006). 보내지 않은 필드는 그대로 둔다. */
function maskPostText(fields) {
  const masked = { ...fields };
  if (fields.title !== undefined) masked.title = maskProfanity(fields.title);
  if (fields.body !== undefined) masked.body = maskProfanity(fields.body);
  if (fields.poll) masked.poll = { ...fields.poll, options: fields.poll.options.map(maskProfanity) };
  return masked;
}

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
  const slugs = [...new Set(posts.map((p) => p.itemId).filter(Boolean))];
  const [reactions, mine, images, badges, polls, myVotes, items, priceTags] = await Promise.all([
    communityRepository.countReactions(ids),
    communityRepository.findMyReactions(viewerId, ids),
    communityRepository.findImages(ids),
    badgeService.getItemBadges(pairs),
    communityRepository.findPolls(ids),
    communityRepository.findMyPollVotes(viewerId, ids),
    findItemTags(slugs),
    communityRepository.findPriceTags(ids),
  ]);
  return posts.map((post) => {
    return {
      ...post,
      author: {
        ...post.author,
        // 품목 글만: owner 보유자, trade 거래 인증 (기준은 badge/badge.rules.js)
        badges: post.itemId ? badges.get(post.itemId, post.author.id) : [],
      },
      reactions: reactions.get(post.id),
      myReaction: mine.get(post.id) ?? null,
      images: images.get(post.id),
      item: (post.itemId && items.get(post.itemId)) || null,
      poll: toPoll(polls.get(post.id), myVotes.get(post.id)),
      priceTag: priceTags.get(post.id) ?? null,
      isMine: viewerId !== undefined && post.author.id === viewerId,
    };
  });
}

/** 투표 응답 형식. 투표가 없으면 null. */
function toPoll(poll, myOptionId) {
  if (!poll) return null;
  return {
    options: poll.options,
    totalVotes: poll.options.reduce((sum, o) => sum + o.votes, 0),
    myOptionId: myOptionId ?? null,
    deadlineAt: poll.deadlineAt,
    closed: poll.closed,
  };
}

/** 시세 태그 — 글의 품목(slug)별 품목명·이미지·최근 체결가. Map<slug, ItemTag>. 없는·숨김 품목은 빠진다. */
async function findItemTags(slugs) {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const item = await itemCommunityRepository.findByIdOrSlug(slug);
      if (!item) return null;
      const summary = await itemCommunityService.getMarketSummary(item.id, {});
      return [
        slug,
        {
          id: item.id,
          slug: item.slug,
          name: item.name,
          imageUrl: item.imageUrl,
          latestPrice: summary?.latestPrice ?? null,
          changeRate: summary?.changeRate ?? 0,
        },
      ];
    }),
  );
  return new Map(entries.filter(Boolean));
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

/**
 * 글 등록. itemId(시세 태그)는 존재하는 품목 slug여야 한다.
 * imageIds는 내가 올렸고 아직 연결되지 않은 사진만 허용된다.
 */
async function createPost(userId, input) {
  const fields = maskPostText(input);
  if (fields.priceTag !== null && fields.priceTag !== undefined && !fields.itemId) {
    throw new HttpError(400, 'VALIDATION_ERROR', '희망 체결가는 품목이 있는 글에만 붙일 수 있습니다.');
  }
  if (fields.itemId && !(await itemCommunityRepository.findByIdOrSlug(fields.itemId))) {
    throw new HttpError(404, 'ITEM_NOT_FOUND', '태그한 품목을 찾을 수 없습니다.');
  }
  try {
    const post = await communityRepository.create({ userId, ...fields });
    return enrichOne(post, userId);
  } catch (err) {
    if (err instanceof communityRepository.ImageNotAvailableError) {
      throw new HttpError(400, 'IMAGE_NOT_AVAILABLE', '첨부할 수 없는 사진이 있습니다. 사진을 다시 올려 주세요.');
    }
    throw err;
  }
}

/** 글 수정 (작성자만). priceTag는 품목 글에만, null이면 희망 체결가를 지운다. */
async function updatePost(postId, userId, input) {
  const own = await getOwnPost(postId, userId);
  const { priceTag, imageIds, ...rest } = maskPostText(input);
  const priceChanged = priceTag !== undefined;
  if (priceChanged && priceTag !== null && !own.itemId) {
    throw new HttpError(400, 'VALIDATION_ERROR', '희망 체결가는 품목이 있는 글에만 붙일 수 있습니다.');
  }
  // 사진을 먼저 바꾼다 — 첨부할 수 없는 사진이면 다른 필드도 바꾸지 않고 끝낸다.
  if (imageIds !== undefined) {
    try {
      await communityRepository.replaceImages(postId, userId, imageIds);
    } catch (err) {
      if (err instanceof communityRepository.ImageNotAvailableError) {
        throw new HttpError(400, 'IMAGE_NOT_AVAILABLE', '첨부할 수 없는 사진이 있습니다. 사진을 다시 올려 주세요.');
      }
      throw err;
    }
  }
  if (priceChanged) await communityRepository.setPriceTag(postId, priceTag);
  // 희망 체결가·사진은 posts 밖 테이블이라, 그것만 바뀌어도 "(수정됨)"을 표시한다.
  const post = await communityRepository.update(postId, rest, { markEdited: priceChanged || imageIds !== undefined });
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

/** 투표 참여 (글당 1인 1표, 변경 불가). 반영된 투표 현황을 돌려준다. */
async function votePoll(postId, userId, optionId) {
  if (!(await communityRepository.findById(postId))) throw postNotFound();
  const outcome = await communityRepository.votePoll(userId, postId, optionId);
  if (outcome === POLL_VOTE_RESULT.NO_POLL) throw new HttpError(404, 'POLL_NOT_FOUND', '투표가 없는 글입니다.');
  if (outcome === POLL_VOTE_RESULT.CLOSED) throw new HttpError(400, 'POLL_CLOSED', '마감된 투표입니다.');
  if (outcome === POLL_VOTE_RESULT.BAD_OPTION) {
    throw new HttpError(400, 'VALIDATION_ERROR', '이 투표의 선택지가 아닙니다.');
  }
  if (outcome === POLL_VOTE_RESULT.DUPLICATE) throw new HttpError(409, 'ALREADY_VOTED', '이미 투표했습니다.');
  const [polls, mine] = await Promise.all([
    communityRepository.findPolls([postId]),
    communityRepository.findMyPollVotes(userId, [postId]),
  ]);
  return toPoll(polls.get(postId), mine.get(postId));
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  setReaction,
  removeReaction,
  votePoll,
};

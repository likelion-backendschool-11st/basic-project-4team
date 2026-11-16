import { toAssetUrl } from '../../api/client';
import type { Post } from '../../api/types';
import {
  discussionReactionTemplate,
  feedCopy,
  postBadgeMeta,
  postImageAlt,
  priceTagCopy,
  type CommunityBadge,
  type CommunityImage,
  type FeedItemTag,
  type FeedPoll,
  type PostPriceTagView,
  type ReactionSeed,
} from '../../data/community';

/** API Post의 이모지 개수 → 화면용 🔥😮😂🧊 4종. */
export const toReactionSeeds = (post: Post): readonly ReactionSeed[] =>
  discussionReactionTemplate(post.reactions.fire, post.reactions.surprised, post.reactions.laugh, post.reactions.ice);

/** API author.badges → 화면 배지. */
export const toBadges = (post: Post): readonly CommunityBadge[] =>
  post.author.badges.map((b) => postBadgeMeta[b]).filter((b): b is CommunityBadge => Boolean(b));

/** API images → 화면용 이미지. 없으면 undefined (사진 영역을 그리지 않음). */
export const toImages = (post: Post): readonly CommunityImage[] | undefined =>
  post.images.length === 0
    ? undefined
    : post.images.map((img, i) => ({ src: toAssetUrl(img.url), alt: postImageAlt(post.author.nickname, i + 1) }));

/** API poll → 피드 투표 카드. 투표 없는 글은 undefined. */
export const toFeedPoll = (post: Post): FeedPoll | undefined =>
  post.poll
    ? {
        postId: post.id,
        options: post.poll.options.map((o, i) => ({ key: feedCopy.pollLetters[i] ?? String(i + 1), id: o.id, label: o.label, votes: o.votes })),
        deadlineLabel: feedCopy.pollDeadline(post.poll.deadlineAt, post.poll.closed),
        myOptionId: post.poll.myOptionId,
        closed: post.poll.closed,
      }
    : undefined;

/** API item → 시세 태그 카드. 태그 없는 글은 undefined. */
export const toItemTag = (post: Post): FeedItemTag | undefined => {
  const { item } = post;
  if (!item) return undefined;
  const hasPrice = item.latestPrice !== null;
  return {
    slug: item.slug,
    name: item.name,
    imageSrc: item.imageUrl ? toAssetUrl(item.imageUrl) : null,
    priceLabel: feedCopy.itemTagPrice(item.latestPrice),
    changeLabel: feedCopy.itemTagChange(item.changeRate, hasPrice),
    trend: !hasPrice || item.changeRate === 0 ? 'flat' : item.changeRate > 0 ? 'up' : 'down',
  };
};

/** 희망 체결가 → 카드 표시. 시세(태그 품목의 최근 체결가)가 있으면 차이도 보여준다. */
export const toPriceTag = (post: Post): PostPriceTagView | undefined => {
  if (post.priceTag === null) return undefined;
  const market = post.item?.latestPrice ?? null;
  const diff = market === null ? 0 : post.priceTag - market;
  return {
    label: priceTagCopy.label(post.priceTag),
    diffLabel: market === null ? '' : priceTagCopy.diff(post.priceTag, market),
    tone: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
  };
};

import type { Post } from '../../api/types';
import {
  discussionReactionTemplate,
  postBadgeMeta,
  postImageAlt,
  type CommunityBadge,
  type CommunityImage,
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
    : post.images.map((img, i) => ({ src: img.url, alt: postImageAlt(post.author.nickname, i + 1) }));

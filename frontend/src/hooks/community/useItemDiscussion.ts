import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { createPost, getPosts } from '../../api/community';
import type { Post } from '../../api/types';
import {
  discussionPostCopy,
  formatTimeAgo,
  type DiscussionPost,
  type DiscussionSort,
} from '../../data/community';
import { boardByCategory, DISCUSSION_PAGE_SIZE, discussionErrorCopy } from '../../data/itemcommunity';
import { useItemDetail } from '../itemcommunity/useItemDetail';
import { toBadges, toImages, toReactionSeeds } from './postMapping';

/** API Post → 토론방 카드용 DiscussionPost. */
const toDiscussionPost = (post: Post): DiscussionPost => ({
  id: `post-${post.id}`,
  postId: post.id,
  isMine: post.isMine,
  author: {
    name: post.author.nickname,
    initials: post.author.nickname.slice(0, 1),
    tone: post.isMine ? 'primary' : 'neutral',
  },
  badges: toBadges(post),
  isOwner: post.author.badges.includes('owner'),
  meta: `${formatTimeAgo(post.createdAt)}${post.editedAt ? ` ${discussionPostCopy.edited}` : ''}`,
  body: post.body,
  images: toImages(post),
  reactions: toReactionSeeds(post),
  myReaction: post.myReaction,
  commentCount: post.commentCount,
  order: post.id,
});

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.status !== 0 && error.status < 500 ? error.message : fallback;

/** 품목 토론방: 헤더(ITEM-03) + 토론글 목록·등록(posts API, itemId = 품목 slug). */
export const useItemDiscussion = () => {
  const { id } = useParams<{ id: string }>();
  const { hash } = useLocation();
  // 라우트(/community/items/:id)에서만 쓰여 id는 항상 있다.
  const itemId = id ?? '';
  const { item, status: itemStatus } = useItemDetail(itemId);

  const [sort, setSort] = useState<DiscussionSort>('popular');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [posts, setPosts] = useState<readonly Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // 정렬·품목을 바꾼 뒤 늦게 도착한 이전 응답을 버리기 위한 요청 번호.
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (nextPage: number) => {
      const reqId = ++requestId.current;
      setLoading(true);
      try {
        const result = await getPosts({ itemId, sort, ownerOnly: verifiedOnly || undefined, page: nextPage, size: DISCUSSION_PAGE_SIZE });
        if (reqId !== requestId.current) return;
        setPosts((prev) => (nextPage === 1 ? result.posts : [...prev, ...result.posts]));
        setPage(nextPage);
        setHasMore(result.hasNext);
        setTotalCount(result.totalCount);
        setError(null);
      } catch (e) {
        if (reqId !== requestId.current) return;
        setHasMore(false);
        setError(errorMessage(e, discussionErrorCopy.load));
      } finally {
        if (reqId === requestId.current) setLoading(false);
      }
    },
    [itemId, sort, verifiedOnly],
  );

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    fetchPage(1);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchPage(page + 1);
  }, [loading, hasMore, page, fetchPage]);

  /** 글 등록 — 이 토론방의 품목으로 고정. 로그인 확인은 페이지에서 한다. */
  const addPost = useCallback(
    async (text: string) => {
      try {
        const board = (item?.categoryCode && boardByCategory[item.categoryCode]) || 'free';
        const created = await createPost({ board, itemId, body: text });
        setPosts((prev) => [created, ...prev]);
        setTotalCount((n) => n + 1);
        setError(null);
      } catch (e) {
        setError(errorMessage(e, discussionErrorCopy.create));
      }
    },
    [item, itemId],
  );

  // "인증 보유자 글만 보기"는 서버(ownerOnly)에서 거른다 — 페이지·총 개수가 맞도록.
  const visiblePosts = useMemo(() => posts.map(toDiscussionPost), [posts]);

  return {
    itemId,
    item,
    itemStatus,
    sort,
    setSort,
    verifiedOnly,
    setVerifiedOnly,
    posts: visiblePosts,
    totalDiscussions: totalCount,
    addPost,
    hasMore,
    loadMore,
    loading,
    error,
    /** URL #post-N — 이 글의 댓글을 펼치고 스크롤한다. */
    focusedPostId: hash.slice(1),
  };
};

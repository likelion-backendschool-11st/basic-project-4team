import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { createPost, getPosts } from '../../api/community';
import type { Post } from '../../api/types';
import {
  defaultDiscussionItem,
  discussionItems,
  discussionPostCopy,
  discussionReactionTemplate,
  formatTimeAgo,
  type DiscussionPost,
  type DiscussionSort,
} from '../../data/community';
import { boardByCategory, DISCUSSION_PAGE_SIZE, discussionErrorCopy } from '../../data/itemcommunity';
import { useItemDetail } from '../itemcommunity/useItemDetail';

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
  // 보유자·거래 인증 배지는 데이터가 아직 없다.
  badges: [],
  isOwner: false,
  meta: `${formatTimeAgo(post.createdAt)}${post.editedAt ? ` ${discussionPostCopy.edited}` : ''}`,
  body: post.body,
  // 토론글 이모지 반응 API(#59)가 생기기 전까지는 화면에서만 토글된다.
  reactions: discussionReactionTemplate(0, 0, 0, 0),
  commentCount: post.commentCount,
  order: post.id,
});

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.status !== 0 && error.status < 500 ? error.message : fallback;

/** 품목 토론방: 헤더(ITEM-03) + 토론글 목록·등록(posts API, itemId = 품목 slug). */
export const useItemDiscussion = () => {
  const { id } = useParams<{ id: string }>();
  const itemId = id ?? defaultDiscussionItem.id;
  // 감성 투표는 board API가 생기기 전까지 목 데이터를 쓴다.
  const mockItem = useMemo(() => discussionItems.find((i) => i.id === itemId) ?? defaultDiscussionItem, [itemId]);
  const { item, status: itemStatus } = useItemDetail(itemId, mockItem);

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
        const result = await getPosts({ itemId, sort, page: nextPage, size: DISCUSSION_PAGE_SIZE });
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
    [itemId, sort],
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

  const visiblePosts = useMemo(() => {
    const mapped = posts.map(toDiscussionPost);
    return verifiedOnly ? mapped.filter((p) => p.isOwner) : mapped;
  }, [posts, verifiedOnly]);

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
  };
};

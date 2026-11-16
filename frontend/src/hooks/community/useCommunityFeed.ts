import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { createPost, deletePost, getPosts, updatePost } from '../../api/community';
import type { Post, PostBoard, PostTag } from '../../api/types';
import {
  feedBoardMeta,
  feedComposer,
  feedErrorCopy,
  formatTimeAgo,
  type FeedCategoryKey,
  type FeedPost,
} from '../../data/community';
import { ROUTES } from '../../data/layout';
import { useAuth } from '../auth/useAuth';
import type { FeedComposerPayload } from './useFeedComposer';
import { toBadges, toFeedPoll, toImages, toItemTag, toPriceTag, toReactionSeeds } from './postMapping';

const PAGE_SIZE = 10;

/** API Post → 피드 카드용 FeedPost. */
const toFeedPost = (post: Post): FeedPost => {
  const meta = feedBoardMeta[post.board] ?? feedBoardMeta.free;
  const tagLabel = feedComposer.tagOptions.find((t) => t.value === post.tag)?.label ?? '';
  return {
    id: `post-${post.id}`,
    postId: post.id,
    category: meta.category,
    board: { label: meta.label, icon: meta.icon, itemId: post.itemId },
    author: {
      name: post.author.nickname,
      initials: post.author.nickname.slice(0, 1),
      tone: post.isMine ? 'primary' : 'neutral',
    },
    badge: toBadges(post)[0],
    timeAgo: formatTimeAgo(post.createdAt),
    context: tagLabel,
    title: post.title ?? '',
    body: post.body,
    images: toImages(post),
    poll: toFeedPoll(post),
    itemTag: toItemTag(post),
    reactions: toReactionSeeds(post),
    myReaction: post.myReaction,
    priceTag: toPriceTag(post),
    commentCount: post.commentCount,
    isMine: post.isMine,
    edited: post.editedAt !== null,
  };
};

/** 피드 필터(category) → API board 쿼리. '전체'는 필터 없음. */
const toBoardQuery = (category: FeedCategoryKey): PostBoard | undefined =>
  category === 'all' ? undefined : category;

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.status !== 0 && error.status < 500 ? error.message : fallback;

/** Community feed (P-017): 카테고리 필터, 무한 스크롤, 글 등록·수정·삭제를 API로 처리. */
export const useCommunityFeed = () => {
  const navigate = useNavigate();
  const { status } = useAuth();
  const [category, setCategory] = useState<FeedCategoryKey>('all');
  const [board, setBoard] = useState<string>(feedComposer.boardOptions[0].value);
  const [tag, setTag] = useState<string>(feedComposer.tagOptions[0].value);
  const [posts, setPosts] = useState<readonly Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 카테고리를 바꾼 뒤 늦게 도착한 이전 응답을 버리기 위한 요청 번호.
  const requestId = useRef(0);

  const fetchPage = useCallback(async (nextPage: number, target: FeedCategoryKey) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await getPosts({ board: toBoardQuery(target), page: nextPage, size: PAGE_SIZE });
      if (id !== requestId.current) return;
      setPosts((prev) => (nextPage === 1 ? result.posts : [...prev, ...result.posts]));
      setPage(nextPage);
      setHasMore(result.hasNext);
      setError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      setHasMore(false);
      setError(errorMessage(e, feedErrorCopy.load));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    fetchPage(1, category);
  }, [category, fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchPage(page + 1, category);
  }, [loading, hasMore, page, category, fetchPage]);

  const requireLogin = useCallback(() => {
    if (status === 'authenticated') return false;
    navigate(ROUTES.login);
    return true;
  }, [status, navigate]);

  /** 이모지처럼 로그인이 필요한 동작 전에 호출. 비로그인이면 로그인 화면으로 보내고 false. */
  const ensureLogin = useCallback(() => !requireLogin(), [requireLogin]);

  /** 글 등록 — 사진·투표·시세 태그 포함. 성공하면 true (글쓰기 입력을 비운다). */
  const addPost = useCallback(
    async (payload: FeedComposerPayload): Promise<boolean> => {
      if (requireLogin()) return false;
      try {
        const created = await createPost({
          board: board as PostBoard,
          tag: tag as PostTag,
          body: payload.body,
          imageIds: payload.imageIds,
          itemId: payload.itemId,
          poll: payload.poll,
        });
        const visible = category === 'all' || created.board === category;
        if (visible) setPosts((prev) => [created, ...prev]);
        setError(null);
        return true;
      } catch (e) {
        setError(errorMessage(e, feedErrorCopy.create));
        return false;
      }
    },
    [requireLogin, board, tag, category],
  );

  /** 본문 수정. 성공하면 true. */
  const editPost = useCallback(async (postId: number, body: string): Promise<boolean> => {
    try {
      const updated = await updatePost(postId, { body });
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setError(null);
      return true;
    } catch (e) {
      setError(errorMessage(e, feedErrorCopy.update));
      return false;
    }
  }, []);

  const removePost = useCallback(async (postId: number) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setError(null);
    } catch (e) {
      setError(errorMessage(e, feedErrorCopy.remove));
    }
  }, []);

  return {
    category,
    setCategory,
    board,
    setBoard,
    tag,
    setTag,
    posts: posts.map(toFeedPost),
    addPost,
    editPost,
    removePost,
    ensureLogin,
    hasMore,
    loadMore,
    loading,
    error,
  };
};

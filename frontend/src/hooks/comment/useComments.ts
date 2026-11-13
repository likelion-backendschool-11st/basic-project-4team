import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import {
  createComment,
  deleteComment,
  getComments,
  getReplies,
} from '../../api/comment';
import type { Comment, CommentReply } from '../../api/types';
import { COMMENT_PAGE_SIZE, commentCopy } from '../../data/comment';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/** id가 같은 항목은 뒤에 온 것을 버린다 — 방금 쓴 댓글이 다음 페이지에 다시 오는 경우. */
const appendUnique = <T extends { readonly id: number }>(prev: readonly T[], next: readonly T[]): T[] => {
  const seen = new Set(prev.map((c) => c.id));
  return [...prev, ...next.filter((c) => !seen.has(c.id))];
};

/** 서버가 준 4xx 메시지는 그대로, 네트워크·서버 오류는 기본 문구로. */
const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.status !== 0 && error.status < 500 ? error.message : fallback;

const isTopLevel = (comment: Comment | CommentReply): comment is Comment => comment.parentId === null;

/**
 * 토론글 카드 아래로 펼치는 댓글 영역 (피드·품목 토론방 공용).
 * 처음 펼칠 때 첫 페이지를 불러오고, 이후 접었다 펴도 다시 불러오지 않는다.
 * initiallyOpen이면 처음부터 펼친다 (URL #post-N으로 들어온 경우).
 */
export const useComments = (postId: number, initialCount: number, initiallyOpen = false) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<readonly Comment[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [actionError, setActionError] = useState<string | null>(null);
  // 답글 입력창을 연 댓글 id (한 번에 하나만).
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  // 같은 페이지를 두 번 요청하지 않도록.
  const loadingRef = useRef(false);

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setStatus('loading');
      try {
        const page = await getComments(postId, { cursor, size: COMMENT_PAGE_SIZE });
        setComments((prev) => (cursor ? appendUnique(prev, page.items) : page.items));
        setNextCursor(page.nextCursor);
        setTotalCount(page.totalCount);
        setStatus('ready');
      } catch {
        setStatus('error');
      } finally {
        loadingRef.current = false;
      }
    },
    [postId],
  );

  useEffect(() => {
    if (!initiallyOpen) return;
    setOpen(true);
    fetchPage(null);
    // 처음 마운트될 때 한 번만 — initiallyOpen이 나중에 바뀌어도 다시 펼치지 않는다.
  }, []);

  const toggle = useCallback(() => {
    if (!open && status === 'idle') fetchPage(null);
    setOpen(!open);
  }, [open, status, fetchPage]);

  const retry = useCallback(() => fetchPage(null), [fetchPage]);
  const loadMore = useCallback(() => {
    if (nextCursor) fetchPage(nextCursor);
  }, [nextCursor, fetchPage]);

  /** 답글 더보기 — 지금 보이는 마지막 답글 다음부터. */
  const loadReplies = useCallback(async (comment: Comment) => {
    const last = comment.replies[comment.replies.length - 1];
    try {
      const page = await getReplies(comment.id, { cursor: last ? String(last.id) : null, size: 50 });
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, replies: appendUnique(c.replies, page.items) } : c)),
      );
    } catch (e) {
      setActionError(errorMessage(e, commentCopy.loadError));
    }
  }, []);

  /** 댓글·답글 작성. 성공하면 true. 새 댓글은 오래된 순 목록의 맨 끝에 붙인다. */
  const submit = useCallback(
    async (body: string, parentId: number | null = null): Promise<boolean> => {
      try {
        const { comment, commentCount } = await createComment(postId, body, parentId);
        setTotalCount(commentCount);
        setActionError(null);
        if (isTopLevel(comment)) {
          setComments((prev) => appendUnique(prev, [comment]));
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replyCount: c.replyCount + 1, replies: appendUnique(c.replies, [comment]) }
                : c,
            ),
          );
          setReplyingTo(null);
        }
        return true;
      } catch (e) {
        setActionError(errorMessage(e, commentCopy.submitError));
        return false;
      }
    },
    [postId],
  );

  /** 내 댓글 삭제. 답글이 남는 댓글은 "삭제된 댓글"로 바뀌므로 목록을 처음부터 다시 불러온다. */
  const remove = useCallback(
    async (commentId: number) => {
      try {
        await deleteComment(commentId);
        setActionError(null);
        await fetchPage(null);
      } catch (e) {
        setActionError(errorMessage(e, commentCopy.deleteError));
      }
    },
    [fetchPage],
  );

  return {
    open,
    toggle,
    comments,
    loading: status === 'loading',
    loadError: status === 'error',
    retry,
    hasMore: nextCursor !== null,
    loadMore,
    loadReplies,
    submit,
    remove,
    totalCount,
    actionError,
    replyingTo,
    setReplyingTo,
  };
};

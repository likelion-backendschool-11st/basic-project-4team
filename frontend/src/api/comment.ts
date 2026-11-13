import { apiRequest } from './client';
import type {
  CommentListResponse,
  CreateCommentResponse,
  ReplyListResponse,
} from './types';

export interface CursorQuery {
  readonly cursor?: string | null;
  readonly size?: number;
}

function toQueryString({ cursor, size }: CursorQuery): string {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (size !== undefined) params.set('size', String(size));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** 게시글의 댓글 목록 (오래된 순, 커서 페이징). 댓글마다 답글 3개 미리보기 포함. */
export const getComments = (postId: number, query: CursorQuery = {}): Promise<CommentListResponse> =>
  apiRequest<CommentListResponse>(`/community/posts/${postId}/comments${toQueryString(query)}`);

/** 답글 더보기. */
export const getReplies = (commentId: number, query: CursorQuery = {}): Promise<ReplyListResponse> =>
  apiRequest<ReplyListResponse>(`/community/comments/${commentId}/replies${toQueryString(query)}`);

/** 댓글·답글 작성. 로그인 필요. parentId가 있으면 답글. */
export const createComment = (postId: number, body: string, parentId: number | null = null): Promise<CreateCommentResponse> =>
  apiRequest<CreateCommentResponse>(`/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, parentId }),
  });

/** 댓글 삭제(소프트 삭제). 작성자만 가능. */
export const deleteComment = (commentId: number): Promise<void> =>
  apiRequest<void>(`/community/comments/${commentId}`, { method: 'DELETE' });


import { apiRequest } from './client';
import type { Post, PostBoard, PostListResponse, PostSort, PostTag } from './types';

export interface PostListQuery {
  readonly board?: PostBoard;
  readonly itemId?: string;
  readonly tag?: PostTag;
  readonly sort?: PostSort;
  readonly page?: number;
  readonly size?: number;
}

export interface CreatePostRequest {
  readonly board: PostBoard;
  readonly body: string;
  readonly tag?: PostTag | null;
  readonly itemId?: string | null;
  readonly title?: string | null;
}

/** 품목(itemId)은 수정할 수 없다 (REQ-BEDIT-001). */
export interface UpdatePostRequest {
  readonly board?: PostBoard;
  readonly body?: string;
  readonly tag?: PostTag | null;
  readonly title?: string | null;
}

function toQueryString(query: PostListQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** 토론글 목록 (피드는 board, 품목 토론방은 itemId로 거른다). */
export const getPosts = (query: PostListQuery = {}): Promise<PostListResponse> =>
  apiRequest<PostListResponse>(`/posts${toQueryString(query)}`);

/** 토론글 등록. 로그인 필요. */
export const createPost = async (body: CreatePostRequest): Promise<Post> => {
  const { post } = await apiRequest<{ readonly post: Post }>('/posts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return post;
};

/** 토론글 부분 수정. 작성자만 가능. */
export const updatePost = async (id: number, body: UpdatePostRequest): Promise<Post> => {
  const { post } = await apiRequest<{ readonly post: Post }>(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return post;
};

/** 토론글 삭제(소프트 삭제). 작성자만 가능. */
export const deletePost = (id: number): Promise<void> =>
  apiRequest<void>(`/posts/${id}`, { method: 'DELETE' });

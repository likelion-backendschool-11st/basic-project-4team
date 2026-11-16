import { apiRequest } from './client';
import type {
  Post,
  PostBoard,
  PostImage,
  PostListResponse,
  PostPoll,
  PostSort,
  PostTag,
  ReactionSummary,
  ReactionType,
} from './types';

export interface PostListQuery {
  readonly board?: PostBoard;
  readonly itemId?: string;
  readonly tag?: PostTag;
  /** true면 이 품목 보유자가 쓴 글만 (품목 토론방 "인증 보유자 글만 보기"). */
  readonly ownerOnly?: boolean;
  readonly sort?: PostSort;
  readonly page?: number;
  readonly size?: number;
}

export interface CreatePostRequest {
  readonly board: PostBoard;
  readonly body: string;
  readonly tag?: PostTag | null;
  /** 시세 태그 — 품목 slug. */
  readonly itemId?: string | null;
  readonly title?: string | null;
  /** uploadPostImage로 올린 사진 id (최대 4장, 순서 = 표시 순서). */
  readonly imageIds?: readonly number[];
  readonly poll?: { readonly options: readonly string[]; readonly durationDays: number } | null;
  /** 희망 체결가(원). itemId가 있을 때만. */
  readonly priceTag?: number | null;
}

/** 품목(itemId)은 수정할 수 없다 (REQ-BEDIT-001). */
export interface UpdatePostRequest {
  readonly board?: PostBoard;
  readonly body?: string;
  readonly tag?: PostTag | null;
  readonly title?: string | null;
  /** null이면 희망 체결가를 지운다. */
  readonly priceTag?: number | null;
  /** 수정 후 사진 전체 목록(최대 4장). []이면 사진을 모두 뺀다. */
  readonly imageIds?: readonly number[];
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

/** 이모지 남기기·바꾸기 (글당 1인 1개). 로그인 필요. */
export const setPostReaction = (id: number, type: ReactionType): Promise<ReactionSummary> =>
  apiRequest<ReactionSummary>(`/posts/${id}/reaction`, { method: 'PUT', body: JSON.stringify({ type }) });

/** 이모지 취소. 로그인 필요. */
export const removePostReaction = (id: number): Promise<ReactionSummary> =>
  apiRequest<ReactionSummary>(`/posts/${id}/reaction`, { method: 'DELETE' });

/** 토론글 사진 1장 업로드. 글 등록 때 imageIds로 연결한다. 로그인 필요. */
export const uploadPostImage = async (file: File): Promise<PostImage> => {
  const form = new FormData();
  form.append('image', file);
  const { image } = await apiRequest<{ readonly image: PostImage }>('/uploads/post-images', { method: 'POST', body: form });
  return image;
};

/** 투표 참여 (1인 1표, 변경 불가 → 409 ALREADY_VOTED). 로그인 필요. */
export const votePostPoll = async (postId: number, optionId: number): Promise<PostPoll> => {
  const { poll } = await apiRequest<{ readonly poll: PostPoll }>(`/posts/${postId}/poll/votes`, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  });
  return poll;
};

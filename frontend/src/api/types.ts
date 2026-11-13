/** backend/docs/api-spec.md 와 똑같이 맞춘 응답 타입. */

export interface User {
  readonly id: number;
  readonly loginId: string;
  readonly nickname: string;
  readonly email: string | null;
  readonly createdAt: string;
}

export interface ApiSuccess<T> {
  readonly data: T;
}

export interface ApiErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

/* 토론글 (커뮤니티) — backend/docs/api-spec-all.md 5장 */

export type PostBoard = 'pokemon' | 'sneakers' | 'onepiece' | 'watch' | 'free';
export type PostTag = 'analysis' | 'verify' | 'unboxing' | 'poll' | 'qna' | 'info';
export type PostSort = 'latest' | 'popular';

export interface Post {
  readonly id: number;
  readonly board: PostBoard;
  readonly tag: PostTag | null;
  readonly itemId: string | null;
  readonly title: string | null;
  readonly body: string;
  readonly author: { readonly id: number; readonly nickname: string };
  readonly reactionCount: number;
  readonly commentCount: number;
  readonly isMine: boolean;
  /** 수정한 적이 없으면 null. "(수정됨)" 표시용. */
  readonly editedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PostListResponse {
  readonly posts: readonly Post[];
  readonly page: number;
  readonly size: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

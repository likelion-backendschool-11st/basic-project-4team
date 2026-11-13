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

/* 품목 (품목 토론방) — backend/docs/api-spec-all.md 2장 ITEM-03 */

export type ItemCondition = 'unopened' | 'opened_raw' | 'graded';
export type GradingService = 'PSA' | 'BGS' | 'CGC' | 'BRG';
export type Grade = '10' | '9.5' | '9' | '8.5' | '8' | '7';

export interface ItemCategory {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}

export interface MarketSummary {
  readonly latestPrice: number;
  /** 전일 대비 변동액(원). 음수 가능. */
  readonly changeAmount: number;
  /** 전일 대비 변동률(%, 소수 1자리). */
  readonly changeRate: number;
  readonly tradeCount30d: number;
}

export interface ItemDetail {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly setName: string | null;
  readonly cardNo: string | null;
  readonly language: string | null;
  readonly rarity: string | null;
  readonly imageUrl: string | null;
  readonly category: ItemCategory;
  /** 대분류 → 소분류 순서. */
  readonly breadcrumbs: readonly ItemCategory[];
  /** 거래 이력이 없으면 null. */
  readonly marketSummary: MarketSummary | null;
  readonly sellingCount: number;
}

/* 댓글 — backend/docs/api-spec-all.md 6장 */


export interface CommentAuthor {
  readonly id: number;
  readonly nickname: string;
  /** ITEM_OWNER(보유자), TRADE_VERIFIED(거래 인증). 해당 없으면 []. */
  readonly badges: readonly string[];
}

export interface CommentReply {
  readonly id: number;
  readonly postId: number;
  /** 답글이면 부모 댓글 id, 댓글이면 null. */
  readonly parentId: number | null;
  /** 삭제된 댓글이면 null. */
  readonly author: CommentAuthor | null;
  /** 삭제된 댓글이면 null. */
  readonly body: string | null;
  readonly isDeleted: boolean;
  readonly isMine: boolean;
  readonly createdAt: string;
  /** createdAt과 다르면 "(수정됨)". */
  readonly updatedAt: string;
}

/** 댓글(답글이 아닌 것). 답글 수와 앞쪽 답글 3개 미리보기가 붙는다. */
export interface Comment extends CommentReply {
  readonly replyCount: number;
  readonly replies: readonly CommentReply[];
}

export interface CommentListResponse {
  readonly items: readonly Comment[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
  /** 게시글의 commentCount (댓글 + 답글). */
  readonly totalCount: number;
}

export interface ReplyListResponse {
  readonly items: readonly CommentReply[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

export interface CreateCommentResponse {
  readonly comment: Comment | CommentReply;
  /** 작성 후 게시글의 댓글 수. */
  readonly commentCount: number;
}

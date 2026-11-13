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

/* ------------------------------------------------------------------ */
/* 판매글 (api-spec-all.md 3장)                                         */
/* ------------------------------------------------------------------ */

export type ListingStatus = 'selling' | 'reserved' | 'sold';
export type ItemCondition = 'unopened' | 'opened_raw' | 'graded';

export interface Category {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}

export interface ItemSummary {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly setName: string | null;
  readonly cardNo: string | null;
  readonly language: string | null;
  readonly rarity: string | null;
  readonly imageUrl: string | null;
  readonly category: Category;
}

export interface ListingImage {
  readonly id: number;
  readonly url: string;
  readonly sortOrder: number;
}

/** LISTING-02 판매글 상세 응답. */
export interface ListingDetail {
  readonly id: number;
  readonly registrationNo: string | null;
  readonly title: string;
  readonly price: number;
  readonly status: ListingStatus;
  readonly condition: ItemCondition;
  readonly gradingService: string | null;
  readonly grade: string | null;
  readonly thumbnailUrl: string | null;
  readonly directLocation: string | null;
  readonly wishCount: number;
  readonly isWished: boolean;
  readonly priceDiffRate: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly description: string;
  readonly images: readonly ListingImage[];
  readonly authImage: { readonly id: number; readonly url: string } | null;
  readonly delivery: boolean;
  readonly direct: boolean;
  readonly item: ItemSummary;
  readonly breadcrumbs: readonly Category[];
  readonly marketPrice: { readonly averagePrice: number; readonly tradeCount: number } | null;
  readonly viewCount: number;
  readonly seller: { readonly id: number; readonly nickname: string; readonly soldCount: number };
  readonly isOwner: boolean;
  readonly soldPrice: number | null;
}

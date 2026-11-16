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
export type ReactionType = 'fire' | 'surprised' | 'laugh' | 'ice';
/** owner = 이 품목 보유자, trade = 이 품목 거래완료 이력. 품목 없는 글은 빈 배열. */
export type AuthorBadge = 'owner' | 'trade';

export type ReactionCounts = Readonly<Record<ReactionType, number>>;

/** PUT·DELETE /posts/:id/reaction 응답. */
export interface ReactionSummary {
  readonly reactions: ReactionCounts;
  readonly myReaction: ReactionType | null;
}

export interface PostImage {
  readonly id: number;
  /** /uploads/... 경로 또는 전체 URL. 화면에서는 toAssetUrl()로 바꿔 쓴다. */
  readonly url: string;
}

/** 시세 태그 — 글에 붙인 품목과 최근 체결가. */
export interface PostItemTag {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly imageUrl: string | null;
  /** 거래 이력이 없으면 null. */
  readonly latestPrice: number | null;
  readonly changeRate: number;
}

export interface PostPollOption {
  readonly id: number;
  readonly label: string;
  readonly votes: number;
}

/** 토론글 투표. 글당 1인 1표, 변경 불가. */
export interface PostPoll {
  readonly options: readonly PostPollOption[];
  readonly totalVotes: number;
  /** 내가 고른 선택지. 안 했거나 비로그인이면 null. */
  readonly myOptionId: number | null;
  readonly deadlineAt: string;
  readonly closed: boolean;
}

/** 품목 검색 결과 (GET /items?q=). */
export interface ItemSearchResult {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly setName: string | null;
  readonly rarity: string | null;
  readonly imageUrl: string | null;
  readonly category: { readonly id: number; readonly code: string; readonly name: string };
  readonly latestPrice: number | null;
  readonly changeRate: number;
}

export interface Post {
  readonly id: number;
  readonly board: PostBoard;
  readonly tag: PostTag | null;
  readonly itemId: string | null;
  readonly title: string | null;
  readonly body: string;
  readonly author: { readonly id: number; readonly nickname: string; readonly badges: readonly AuthorBadge[] };
  readonly reactionCount: number;
  readonly reactions: ReactionCounts;
  readonly myReaction: ReactionType | null;
  readonly images: readonly PostImage[];
  /** 시세 태그. itemId가 없거나 품목이 숨김이면 null. */
  readonly item: PostItemTag | null;
  readonly poll: PostPoll | null;
  /** 희망 체결가(원). 없으면 null. 품목 글에만 붙는다. */
  readonly priceTag: number | null;
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

/** GET /items/trending 항목 — 토론방 "연관 품목". */
export interface TrendingItemResponse {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly rarity: string | null;
  readonly category: ItemCategory;
  readonly postCount: number;
  readonly marketSummary: MarketSummary | null;
}

/* ------------------------------------------------------------------ */
/* 판매글 (api-spec-all.md 3장)                                         */
/* ItemCondition·ItemCategory는 위 품목 타입을 함께 쓴다.                   */
/* ------------------------------------------------------------------ */

export type ListingStatus = 'selling' | 'reserved' | 'sold';

/** 판매글에 딸린 품목 요약 (ItemDetail에서 시세·breadcrumbs를 뺀 형태). */
export interface ItemSummary {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly setName: string | null;
  readonly cardNo: string | null;
  readonly language: string | null;
  readonly rarity: string | null;
  readonly imageUrl: string | null;
  readonly category: ItemCategory;
}

export interface ListingImage {
  readonly id: number;
  readonly url: string;
  readonly sortOrder: number;
}

/** UPLOAD-01 이미지 종류. photo = 상품 사진, auth = 실물 인증 사진. */
export type ListingImageType = 'photo' | 'auth';

/** UPLOAD-01 이미지 업로드 응답. */
export interface UploadedImage {
  readonly imageId: number;
  readonly url: string;
  readonly type: ListingImageType;
}

/** LISTING-04 판매글 수정 요청. 보낸 필드만 바뀐다. 품목·카테고리는 바꿀 수 없다. */
export interface UpdateListingRequest {
  /** 보내면 전체 교체. 배열 순서가 노출 순서. */
  readonly imageIds?: readonly number[];
  readonly authImageId?: number;
  readonly condition?: ItemCondition;
  readonly gradingService?: string | null;
  readonly grade?: string | null;
  readonly title?: string;
  readonly price?: number;
  readonly description?: string;
  readonly delivery?: boolean;
  readonly direct?: boolean;
  readonly directLocation?: string | null;
}

/** LISTING-06 판매 상태 변경 응답. sold는 LISTING-07로만 바꾼다. */
export interface ListingStatusResponse {
  readonly id: number;
  readonly status: ListingStatus;
}

/** LISTING-07 거래완료 요청. */
export interface CompleteListingRequest {
  /** 실제 거래 금액 (원). 시세 계산에 들어간다. */
  readonly soldPrice: number;
  /** 구매 회원. 외부 거래·미등록 구매자면 null. */
  readonly buyerId?: number | null;
  readonly requestReview?: boolean;
}

/** LISTING-07 거래완료 응답. */
export interface CompleteListingResponse {
  readonly id: number;
  readonly status: ListingStatus;
  readonly soldPrice: number;
  readonly soldAt: string;
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
  readonly breadcrumbs: readonly ItemCategory[];
  readonly marketPrice: { readonly averagePrice: number; readonly tradeCount: number } | null;
  readonly viewCount: number;
  readonly seller: { readonly id: number; readonly nickname: string; readonly soldCount: number };
  readonly isOwner: boolean;
  readonly soldPrice: number | null;
}

/* 댓글 — backend/docs/api-spec-all.md 6장 */

export interface CommentLikeResponse {
  readonly likeCount: number;
  readonly isLiked: boolean;
}

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
  /** 좋아요 수. 삭제된 댓글은 0. */
  readonly likeCount: number;
  /** 내가 좋아요를 눌렀는지. 비로그인이면 false. */
  readonly isLiked: boolean;
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

/* 신고 — backend/docs/api-spec-all.md 6장 POST /reports */

export type ReportTargetType = 'post' | 'comment';
export type ReportReason = 'fraud' | 'spam' | 'abuse' | 'inappropriate' | 'etc';

export interface Report {
  readonly id: number;
  readonly targetType: ReportTargetType;
  readonly targetId: number;
  readonly reason: ReportReason;
  readonly detail: string | null;
  readonly status: 'pending' | 'resolved' | 'rejected';
  readonly createdAt: string;
}

/** LISTING-01 목록 카드 (ListingSummary). LISTING-10, ITEM-05도 같은 형식. */
export interface ListingSummary {
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
  readonly item: { readonly id: number; readonly slug: string; readonly name: string; readonly setName: string | null };
  readonly createdAt: string;
}

export interface ListingListResponse {
  readonly items: readonly ListingSummary[];
  readonly page: number;
  readonly size: number;
  readonly totalCount: number;
}

/* 시세 전망 투표 (CommunityVote) — backend/docs/api-spec-all.md 8장 */

export type VoteDirection = 'up' | 'down';

export interface CommunityVote {
  readonly itemId: number;
  readonly up: number;
  readonly down: number;
  readonly total: number;
  /** 정수 %. total이 0이면 50. */
  readonly upRate: number;
  readonly downRate: number;
  /** 오늘(KST) 내가 투표한 방향. 안 했거나 비로그인이면 null. */
  readonly myVote: VoteDirection | null;
  /** 로그인했고 오늘 아직 투표하지 않았으면 true. */
  readonly canVote: boolean;
}

/* 카테고리·품목 검색 (ITEM-01, ITEM-02) — backend/docs/api-spec-all.md 2장 */

export interface CategoryRef {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}

export interface CategoryChild extends CategoryRef {
  readonly parentId: number;
}

/** ITEM-01 카테고리 트리의 대분류. 소분류는 children. */
export interface CategoryNode extends CategoryRef {
  readonly children: readonly CategoryChild[];
}

/** ITEM-02 품목 검색 결과 한 건. 시세는 전체 조건 기준. */
export interface ItemSummary {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly setName: string | null;
  readonly cardNo: string | null;
  readonly language: string | null;
  readonly rarity: string | null;
  readonly imageUrl: string | null;
  readonly category: CategoryRef;
  /** 최근 체결가. 거래 이력이 없으면 null. */
  readonly latestPrice: number | null;
  readonly changeRate: number;
}

export interface ItemSearchResponse {
  readonly items: readonly ItemSummary[];
  readonly page: number;
  readonly size: number;
  readonly totalCount: number;
}

/* 판매글 등록 (UPLOAD-01, LISTING-03) — backend/docs/api-spec-all.md 3장 */

export interface CreateListingRequest {
  readonly itemId: number;
  /** 노출 순서. 첫 장이 대표 사진. */
  readonly imageIds: readonly number[];
  readonly authImageId: number;
  readonly condition: ItemCondition;
  /** condition이 'graded'일 때만 보낸다. */
  readonly gradingService?: GradingService;
  readonly grade?: Grade;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly delivery: boolean;
  readonly direct: boolean;
  /** direct가 true일 때만 보낸다. */
  readonly directLocation?: string;
  readonly agreed: true;
}

export interface CreateListingResponse {
  readonly id: number;
  readonly registrationNo: string;
}

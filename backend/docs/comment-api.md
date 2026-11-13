# 댓글(Comment) API 명세

> 공통 규칙(기본 주소 `http://localhost:4000/api`, `{ "data": ... }` / `{ "error": ... }` 응답 형식, 쿠키 인증, 공통 에러 코드)은 `docs/api-spec.md`를 따른다. 🔒 = 로그인 필요.
>
> 근거: 프론트 `frontend/src/data/community.ts`의 `FeedPost`·`DiscussionPost`(`author`, `badges`, `commentCount`).
> 프론트에는 아직 댓글 UI·`Comment` 타입이 없어서, 게시글 모델의 작성자/배지 구조를 그대로 따르도록 설계했다.
> 피드 글(P-017)과 품목 토론 글(P-018)은 같은 `posts` 리소스이므로 댓글 API도 하나로 쓴다.

## 규칙

- 댓글은 **2단계까지**: 댓글(`parentId: null`) → 답글(`parentId: 댓글 id`). 답글에 다시 답글은 달 수 없다.
- 정렬: 댓글은 **오래된 순**(작성 순), 답글도 오래된 순.
- 삭제는 **소프트 삭제**. 답글이 남아 있는 댓글은 목록에 `isDeleted: true`, `body: null`로 남겨 "삭제된 댓글입니다"를 표시하고, 답글이 없으면 목록에서 빠진다.
- 게시글의 `commentCount`는 삭제되지 않은 댓글 + 답글 수의 합이다. 작성 시 +1, 삭제 시 -1.
- 시간은 ISO 문자열. "10분 전" 같은 상대 시간은 프론트에서 만든다.
- 아바타 이니셜·색상(`CommunityAuthor.initials`, `tone`), 배지 문구·색상(`CommunityBadge.label`, `tone`)은 **프론트가** `nickname`·배지 코드로 만든다. API는 데이터만 준다.

## CommentAuthor 객체

```json
{
  "id": 1,
  "nickname": "포켓몬덕후",
  "badges": ["ITEM_OWNER", "TRADE_VERIFIED"]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | number | 작성자 User id |
| `nickname` | string | 화면 표시 이름. 탈퇴한 회원이면 `"탈퇴한 회원"` |
| `badges` | string[] | `ITEM_OWNER`(보유자), `TRADE_VERIFIED`(거래 인증). 해당 없으면 `[]` |

> `ITEM_OWNER`는 게시글이 품목 토론방 글일 때, 그 품목 보유가 인증된 작성자에게만 붙는다.

## Comment 객체

```json
{
  "id": 101,
  "postId": 1,
  "parentId": null,
  "author": CommentAuthor,
  "body": "PSA10 기준이면 저도 지지선은 30만 원대로 봅니다.",
  "isDeleted": false,
  "isMine": false,
  "createdAt": "2026-11-12T03:20:00.000Z",
  "updatedAt": "2026-11-12T03:20:00.000Z",
  "replyCount": 2,
  "replies": [Comment]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | number | 댓글 id |
| `postId` | number | 달린 게시글 id |
| `parentId` | number \| null | 답글이면 부모 댓글 id, 댓글이면 `null` |
| `author` | CommentAuthor \| null | 삭제된 댓글이면 `null` |
| `body` | string \| null | 1~500자. 삭제된 댓글이면 `null` |
| `isDeleted` | boolean | 삭제 여부 |
| `isMine` | boolean | 로그인한 사용자가 작성자인지(수정·삭제 버튼 표시용). 비로그인이면 `false` |
| `createdAt` | string | 작성 시각 |
| `updatedAt` | string | 마지막 수정 시각. `createdAt`과 다르면 "(수정됨)" 표시 |
| `replyCount` | number | 답글 수. **댓글에만** 있음 |
| `replies` | Comment[] | 답글 목록(최대 3개 미리보기, 나머지는 답글 목록 API). **댓글에만** 있음 |

| 댓글 에러 코드 | 상태 | 의미 |
|---|---|---|
| `POST_NOT_FOUND` | 404 | 게시글이 없거나 삭제됨 |
| `COMMENT_NOT_FOUND` | 404 | 댓글이 없거나 이미 삭제됨 |
| `INVALID_PARENT_COMMENT` | 400 | 부모 댓글이 다른 게시글 소속이거나, 답글에 답글을 달려고 함 |
| `FORBIDDEN` | 403 | 본인 댓글이 아님 |

---

## GET /community/posts/:postId/comments — 댓글 목록

로그인 선택(쿠키가 있으면 `isMine` 계산).

쿼리

| 필드 | 필수 | 규칙 |
|---|---|---|
| `cursor` | X | 이전 응답의 `nextCursor`. 없으면 처음부터 |
| `size` | X | 1~50, 기본 20 (댓글 기준 개수, 답글 미포함) |

응답 `200`

```json
{
  "data": {
    "items": [Comment],
    "nextCursor": "101",
    "hasNext": true,
    "totalCount": 15
  }
}
```

`totalCount`는 게시글의 `commentCount`와 같다(댓글 + 답글).

에러: `400 VALIDATION_ERROR`, `404 POST_NOT_FOUND`

## GET /community/comments/:commentId/replies — 답글 더보기

로그인 선택. 쿼리 `cursor`, `size`(1~50, 기본 20)는 댓글 목록과 같다.

응답 `200` → `{ "data": { "items": [Comment], "nextCursor": null, "hasNext": false } }` (답글에는 `replyCount`·`replies` 없음)

에러: `400 VALIDATION_ERROR`, `404 COMMENT_NOT_FOUND`

## POST /community/posts/:postId/comments — 댓글·답글 작성 🔒

요청

```json
{ "body": "저도 같은 생각입니다.", "parentId": null }
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `body` | O | 앞뒤 공백 제거 후 1~500자 |
| `parentId` | X | 답글이면 부모 댓글 id. 생략·`null`이면 일반 댓글 |

응답 `201` → `{ "data": { "comment": Comment, "commentCount": 16 } }`

`commentCount`는 작성 후 게시글의 댓글 수 — 프론트는 이 값으로 카드의 "댓글 N"을 갱신한다.

에러: `400 VALIDATION_ERROR` / `INVALID_PARENT_COMMENT`, `401 UNAUTHORIZED`, `404 POST_NOT_FOUND` / `COMMENT_NOT_FOUND`(부모 댓글 없음)

## PATCH /community/comments/:commentId — 댓글 수정 🔒

요청

```json
{ "body": "수정한 내용입니다." }
```

`body` 규칙은 작성과 같다. 작성자 본인만 수정할 수 있다.

응답 `200` → `{ "data": { "comment": Comment } }`

에러: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COMMENT_NOT_FOUND`

## DELETE /community/comments/:commentId — 댓글 삭제 🔒

요청 본문 없음. 작성자 본인만 삭제할 수 있다. 응답 `204 No Content`.

삭제 후 댓글 수는 게시글 조회·댓글 목록 재조회로 반영한다.

에러: `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COMMENT_NOT_FOUND`

## 미정 항목 (팀 결정 필요)

1. 댓글 리액션(🔥😮😂🧊)·신고를 댓글에도 둘지 — 현재 명세에는 없음.
2. 게시글 id 형식 — 목업은 `'post-1'` 문자열, 명세는 `users`와 같은 숫자 BIGINT로 가정.
3. 댓글 작성 시 게시글 작성자 알림 — 알림 API가 생기면 추가.

# API 정의서

- 기본 주소: `http://localhost:4000/api`
- 요청·응답 본문은 JSON, 필드명은 camelCase.
- 성공 응답: `{ "data": ... }`
- 실패 응답: `{ "error": { "code": "ERROR_CODE", "message": "사용자에게 보여줄 메시지" } }`

## 인증 방식

- 로그인에 성공하면 서버가 **JWT를 `accessToken` httpOnly 쿠키**로 내려준다. (기본 만료 1시간, `JWT_EXPIRES_IN`)
- 프론트는 토큰을 직접 다루지 않는다. 모든 요청에 `credentials: 'include'`(fetch) / `withCredentials: true`(axios)만 붙이면 된다.
- 로그인이 필요한 API에 쿠키가 없거나 만료되면 `401`.

| 공통 에러 코드 | 상태 | 의미 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 입력값 형식 오류 |
| `INVALID_JSON` | 400 | 본문이 JSON이 아님 |
| `UNAUTHORIZED` | 401 | 로그인 필요 |
| `INVALID_TOKEN` | 401 | 토큰 만료·위조 |
| `NOT_FOUND` | 404 | 없는 API |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

## User 객체

```json
{
  "id": 1,
  "loginId": "tester1",
  "nickname": "테스터",
  "email": "t@ex.com",
  "createdAt": "2026-11-12T03:09:50.000Z"
}
```

`email`은 `null`일 수 있다. 비밀번호(해시)는 어떤 응답에도 포함되지 않는다.

---

## POST /auth/signup — 회원가입

요청

```json
{ "loginId": "tester1", "password": "password123", "nickname": "테스터", "email": "t@ex.com" }
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `loginId` | O | 영문 소문자·숫자·`_`, 4~30자 |
| `password` | O | 8자 이상, 72바이트 이하 |
| `nickname` | O | 1~30자 |
| `email` | X | 이메일 형식 |

응답 `201` → `{ "data": { "user": User } }` (회원가입만 하고 로그인 상태로 만들지는 않음)

에러: `400 VALIDATION_ERROR`, `409 DUPLICATE_LOGIN_ID` / `DUPLICATE_NICKNAME` / `DUPLICATE_EMAIL`

## POST /auth/login — 로그인

요청

```json
{ "loginId": "tester1", "password": "password123" }
```

응답 `200` → `{ "data": { "user": User } }` + `Set-Cookie: accessToken=...; HttpOnly`

에러: `400 VALIDATION_ERROR`(빈 값), `401 INVALID_CREDENTIALS`(아이디 없음·비밀번호 틀림을 구분하지 않음)

## POST /auth/logout — 로그아웃

요청 본문 없음. 로그인 여부와 관계없이 `204 No Content`, `accessToken` 쿠키 삭제.

## GET /auth/me — 내 정보 🔒

응답 `200` → `{ "data": { "user": User } }`

에러: `401 UNAUTHORIZED` / `INVALID_TOKEN`

새로고침 후 로그인 상태 복원, 헤더의 로그인/로그아웃 버튼 전환에 쓴다.

---

# 토론글 (커뮤니티)

> 커뮤니티 피드(P-017)와 품목별 토론방(P-018)이 같은 `posts`를 쓴다. 피드는 `board`로, 토론방은 `itemId`로 걸러서 조회한다.
> 이미지 업로드·댓글은 별도 API에서 다룬다. 이모지 리액션은 아래 `PUT·DELETE /posts/:id/reaction`(#59)으로 남기며 `reactionCount`도 같은 트랜잭션에서 갱신된다.

| 토론글 에러 코드 | 상태 | 의미 |
|---|---|---|
| `POST_NOT_FOUND` | 404 | 없거나 삭제된 토론글 |
| `FORBIDDEN` | 403 | 본인 글이 아님 (수정·삭제) |

## 값 목록

| 필드 | 값 |
|---|---|
| `board` | `pokemon` 포켓몬 카드 · `sneakers` 한정판 스니커즈 · `onepiece` 원피스/TCG · `watch` 명품/시계 · `free` 자유 토론 |
| `tag` | `analysis` 시세·전망 분석 · `verify` 실물·정품 검증 · `unboxing` 개봉·수령 후기 · `poll` 투표·설문 · `qna` 질문·Q&A · `info` 발매·경매 정보 |

## Post 객체

```json
{
  "id": 12,
  "board": "pokemon",
  "tag": "analysis",
  "itemId": "charizard-ex-sar",
  "title": "리자몽 ex SAR PSA 10, 지지선 유지될까요?",
  "body": "국내 PSA10 물량이 눈에 띄게 줄었습니다...",
  "author": { "id": 1, "nickname": "테스트유저1", "badges": ["owner", "trade"] },
  "reactionCount": 3,
  "reactions": { "fire": 2, "surprised": 0, "laugh": 0, "ice": 1 },
  "myReaction": "fire",
  "images": [{ "id": 5, "url": "/uploads/posts/2f1c...e9.jpg" }],
  "item": {
    "id": 1, "slug": "charizard-ex-sar", "name": "리자몽 ex SAR", "imageUrl": null,
    "latestPrice": 320000, "changeRate": 18.1
  },
  "poll": {
    "options": [{ "id": 1, "label": "오른다", "votes": 3 }, { "id": 2, "label": "내린다", "votes": 1 }],
    "totalVotes": 4,
    "myOptionId": 1,
    "deadlineAt": "2026-11-19T01:18:57.000Z",
    "closed": false
  },
  "priceTag": 300000,
  "commentCount": 0,
  "isMine": true,
  "editedAt": null,
  "createdAt": "2026-11-12T03:09:50.000Z",
  "updatedAt": "2026-11-12T03:09:50.000Z"
}
```

- `tag`, `itemId`, `title`은 `null`일 수 있다. (품목 토론방 글은 제목 없이 본문만 쓰는 경우가 많다)
- `itemId`는 품목 식별자(현재는 프론트의 품목 slug). 품목 API가 생기면 그 ID로 맞춘다.
- `editedAt`: 마지막으로 수정한 시각. 수정한 적이 없으면 `null`. 화면의 "(수정됨)" 표시에 쓴다 (REQ-BEDIT-004).
- `isMine`: 로그인한 사용자가 작성자면 `true`. 비로그인이면 항상 `false`. 수정·삭제 버튼 노출에 쓴다.
- `author.badges`: 글의 품목(`itemId`) 기준 작성자 배지 (REQ-BOARD-012). 품목 없는 글은 `[]`. 순서는 `owner`, `trade`.
  - `owner` 보유자 — 이 품목의 판매중·예약중 판매글이 있거나, 거래완료 판매글의 구매자
  - `trade` 거래 인증 — 이 품목 거래완료(`status = sold`) 판매글의 판매자 또는 구매자로 **1건 이상**
  - 삭제된 판매글은 세지 않는다. 배지는 저장하지 않고 조회할 때 판매글에서 계산하므로, 거래완료 처리 즉시 반영된다.
  - 기준은 `backend/src/badge/badge.rules.js` 한 곳에서 관리한다 (`ownerOnly` 필터도 같은 기준).
- `reactions`: 이모지 4종(`fire` 🔥 · `surprised` 😮 · `laugh` 😂 · `ice` 🧊)별 개수. `reactionCount`는 그 합(인기순 정렬용).
- `myReaction`: 로그인 사용자가 이 글에 남긴 이모지. 없거나 비로그인이면 `null`.
- `images`: 첨부 사진(`post_images`, 정렬 순서대로). 없으면 `[]`. `url`이 `/uploads/...`로 시작하면 API 서버 주소(예: `http://127.0.0.1:4000`)를 붙여 쓴다.
- `item`: **시세 태그** — `itemId` 품목의 이름·이미지와 최근 체결가(`latestPrice`, 거래 이력 없으면 `null`)·전일 대비 변동률(%). `itemId`가 없거나 숨김 품목이면 `null`.
- `priceTag`: 희망 체결가(원). 없으면 `null`. 시세 대비 차이는 `item.latestPrice`로 화면에서 계산한다.
- `poll`: 투표. 없으면 `null`. `myOptionId`는 로그인 사용자가 고른 선택지(안 했거나 비로그인이면 `null`). `closed`는 마감 여부.

## GET /posts — 토론글 목록

로그인 없이 조회 가능. (로그인 쿠키가 있으면 `isMine`이 채워진다)

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `board` | (전체) | 값 목록의 `board` 중 하나 |
| `itemId` | (전체) | 품목 토론방 글만 |
| `tag` | (전체) | 값 목록의 `tag` 중 하나 |
| `ownerOnly` | `false` | `true`면 `author.badges`에 `owner`가 붙는 글만 (토론방 "인증 보유자 글만 보기"). `totalCount`·`hasNext`도 필터 기준 |
| `sort` | `latest` | `latest` 최신순 · `popular` 인기순(리액션 수 + 댓글 수, 같으면 최신순) |
| `page` | `1` | 1부터 시작 |
| `size` | `20` | 1~50 |

응답 `200`

```json
{
  "data": {
    "posts": [Post],
    "page": 1,
    "size": 20,
    "totalCount": 1420,
    "hasNext": true
  }
}
```

`totalCount`는 필터를 적용한 전체 글 수("총 1,420개의 토론"), 무한 스크롤은 `hasNext`가 `false`가 될 때까지 `page`를 1씩 올려 요청한다.

에러: `400 VALIDATION_ERROR`(허용되지 않은 `board`·`tag`·`sort`·`ownerOnly`, 범위를 벗어난 `page`·`size`)

## GET /posts/:id — 토론글 단건 조회

응답 `200` → `{ "data": { "post": Post } }`

에러: `404 POST_NOT_FOUND`

## POST /posts — 토론글 등록 🔒

요청

```json
{
  "board": "pokemon",
  "tag": "analysis",
  "itemId": "charizard-ex-sar",
  "title": "제목",
  "body": "본문",
  "imageIds": [12, 13],
  "poll": { "options": ["오른다", "내린다", "보합"], "durationDays": 3 },
  "priceTag": 300000
}
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `board` | O | 값 목록 중 하나 |
| `tag` | X | 값 목록 중 하나 |
| `itemId` | X | **시세 태그.** 존재하는(숨김 아닌) 품목 slug. 없으면 `404 ITEM_NOT_FOUND` |
| `title` | X | 1~100자 (빈 문자열은 `null`로 저장) |
| `body` | O | 1~500자 (앞뒤 공백 제거 후) |
| `imageIds` | X | `POST /uploads/post-images`로 올린 사진 id 배열. 최대 4장, 중복 불가, 배열 순서 = 표시 순서. **내가 올렸고 아직 어떤 글에도 연결되지 않은 사진**만 가능 |
| `poll` | X | `options` 2~4개(각 1~40자, 중복 불가), `durationDays` `1`·`3`·`7` (기본 3). 마감 = 등록 시각 + 기간 |
| `priceTag` | X | **희망 체결가**(원). 1 ~ 1,000,000,000 정수. `itemId`가 있는 글에만 가능 (품목 토론방 글쓰기) |

글·사진 연결·투표는 한 트랜잭션으로 저장된다(하나라도 실패하면 글도 저장되지 않음).

응답 `201` → `{ "data": { "post": Post } }`

에러: `400 VALIDATION_ERROR`, `400 IMAGE_NOT_AVAILABLE`(남의 사진·이미 쓴 사진·없는 사진), `401 UNAUTHORIZED` / `INVALID_TOKEN`, `404 ITEM_NOT_FOUND`

## PATCH /posts/:id — 토론글 수정 🔒

바꿀 필드만 보낸다(`board`, `tag`, `title`, `body`, `priceTag`, `imageIds`). 필드 규칙은 등록과 같고, `tag`·`title`·`priceTag`는 `null`을 보내면 비운다. 아무 필드도 없으면 `400`.
`priceTag`는 품목 글(`itemId` 있음)에만 붙일 수 있다. 희망 체결가나 사진만 바꿔도 `editedAt`이 갱신된다.

```json
{ "body": "본문 수정", "imageIds": [12, 15], "priceTag": 290000 }
```

- `imageIds`: 수정 후 **사진 전체 목록**(최대 4장, 순서 = 표시 순서, REQ-BEDIT-002). `[]`이면 사진을 모두 뺀다.
  - 이 글에 이미 있던 사진 id, 또는 내가 새로 올렸고 아직 어떤 글에도 연결되지 않은 사진 id만 쓸 수 있다. 아니면 `400 IMAGE_NOT_AVAILABLE`.
  - 목록에서 빠진 사진은 글과의 연결만 끊긴다(파일 정리는 별도 작업).
- `itemId`는 수정할 수 없다(REQ-BEDIT-001). 보내면 `400 VALIDATION_ERROR`.
- 수정에 성공하면 `editedAt`이 현재 시각으로 바뀐다.

응답 `200` → `{ "data": { "post": Post } }`

에러: `400 VALIDATION_ERROR`, `400 IMAGE_NOT_AVAILABLE`, `401`, `403 FORBIDDEN`, `404 POST_NOT_FOUND`

## DELETE /posts/:id — 토론글 삭제 🔒

소프트 삭제(`deleted_at`). 삭제된 글은 목록·단건 조회에서 제외된다.

응답 `204 No Content`

에러: `401`, `403 FORBIDDEN`, `404 POST_NOT_FOUND`

## PUT /posts/:id/reaction — 이모지 남기기·바꾸기 🔒

글당 1인 1개(REQ-BOARD-008). 이미 다른 이모지를 남겼으면 바꾸고, 같은 이모지면 그대로 둔다.

요청 → `{ "type": "fire" }` (`fire` | `surprised` | `laugh` | `ice`)

응답 `200`

```json
{ "data": { "reactions": { "fire": 3, "surprised": 0, "laugh": 0, "ice": 1 }, "myReaction": "fire" } }
```

에러: `400 VALIDATION_ERROR`, `401`, `404 POST_NOT_FOUND`

## DELETE /posts/:id/reaction — 이모지 취소 🔒

남긴 이모지를 지운다. 남긴 적이 없어도 `200`. 응답은 PUT과 같다(`myReaction: null`).

에러: `401`, `404 POST_NOT_FOUND`

---

## POST /posts/:id/poll/votes — 투표 참여 🔒

글당 **1인 1표, 변경·취소 불가**. 선택지 `vote_count`를 같은 트랜잭션에서 +1 한다.

요청 → `{ "optionId": 1 }`

응답 `201` → `{ "data": { "poll": Post.poll } }` (반영된 현황, `myOptionId` 포함)

에러: `400 VALIDATION_ERROR`(이 글의 선택지가 아님), `400 POLL_CLOSED`(마감), `401`, `404 POST_NOT_FOUND` / `POLL_NOT_FOUND`, `409 ALREADY_VOTED`

---

# 업로드

## POST /uploads/post-images — 토론글 사진 업로드 🔒

`multipart/form-data`, 파일 필드 이름 `image`, 1장씩. 글 등록 전에 올리고, 응답의 `id`를 `POST /posts`의 `imageIds`에 넣는다.

- JPG·PNG·WebP, 5MB 이하 (spec-gaps 20). Content-Type과 파일 시그니처를 모두 검사한다.
- 파일은 서버의 `backend/uploads/posts/`에 UUID 이름으로 저장되고 `GET /uploads/posts/<파일명>`으로 제공된다(`/api` 아님).
- 업로드 직후에는 `post_images.post_id = NULL`. 글에 연결되지 않은 사진은 나중에 정리 작업 대상(erd 2.10, 아직 미구현).
- 리사이즈·압축(REQ-COMMON-007)은 아직 하지 않는다.

응답 `201`

```json
{ "data": { "image": { "id": 12, "url": "/uploads/posts/2f1c...e9.jpg" } } }
```

에러: `400 INVALID_FILE_TYPE`, `400 FILE_TOO_LARGE`, `400 VALIDATION_ERROR`(파일 없음), `401`

---

# 품목 검색 (시세 태그)

## GET /items?q=&size= — 품목 검색

로그인 없이 조회 가능. 품목명·세트명 부분 일치(LIKE), 숨김 품목 제외, 이름순. 토론글 글쓰기의 "시세 태그" 선택에 쓴다.

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `q` | (필수) | 1~50자 |
| `size` | `10` | 1~20 |

응답 `200`

```json
{
  "data": {
    "items": [
      {
        "id": 1, "slug": "charizard-ex-sar", "name": "리자몽 ex SAR", "setName": "151", "rarity": "SAR",
        "imageUrl": "https://...", "category": { "id": 4, "code": "pokemon", "name": "포켓몬 카드" },
        "latestPrice": 320000, "changeRate": 18.1
      }
    ]
  }
}
```

- api-spec-all.md 2장 ITEM-02의 일부(검색어·개수)만 구현했다. 카테고리 필터·페이지는 ITEM-02 구현(#46) 때 확장한다.

에러: `400 VALIDATION_ERROR`

---

# 연관 품목 (품목 토론방 사이드바)

## GET /items/trending — 토론이 활발한 품목 순위

로그인 없이 조회 가능. 최근 `days`일 동안 삭제되지 않은 토론글 수가 많은 품목 순(같으면 최근 글 순). 숨김 품목 제외.

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `days` | `7` | 1~30 |
| `limit` | `5` | 1~20 |

응답 `200`

```json
{
  "data": {
    "items": [
      {
        "id": 4,
        "slug": "charizard-ex-sar-sv2a-201",
        "name": "리자몽 ex SAR (일본판)",
        "rarity": "SAR",
        "category": { "id": 4, "code": "pokemon", "name": "포켓몬 카드" },
        "postCount": 3,
        "marketSummary": { "latestPrice": 285000, "changeAmount": -15000, "changeRate": -5, "tradeCount30d": 3 }
      }
    ]
  }
}
```

- `marketSummary`는 ITEM-03과 같은 형식(필터 없는 전체 시세). 거래 이력이 없으면 `null`.

에러: `400 VALIDATION_ERROR`(범위를 벗어난 `days`·`limit`)

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
  "role": "user",
  "createdAt": "2026-11-12T03:09:50.000Z"
}
```

`email`은 `null`일 수 있다. 비밀번호(해시)는 어떤 응답에도 포함되지 않는다.
`role`은 `user` / `admin` (#34, 아래 "관리자 권한" 참고).

---

## POST /auth/signup — 회원가입

요청

```json
{ "loginId": "tester1", "password": "password123", "nickname": "테스터", "email": "t@ex.com" }
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `loginId` | O | 영문 소문자·숫자·`_`, 4~30자 (대문자는 소문자로 바꿔 저장) |
| `password` | O | 8자 이상, 72바이트 이하 |
| `nickname` | O | 1~30자 |
| `email` | O | 이메일 형식, 255자 이하 (소문자로 바꿔 저장). 아이디·비밀번호 찾기에 쓰므로 필수 (#45) |

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

## 아이디·비밀번호 찾기 (#45) — 이메일 인증코드 3단계

| 단계 | 아이디 찾기 | 비밀번호 찾기 |
|---|---|---|
| 1. 인증코드 받기 | `POST /auth/find-id/request` | `POST /auth/password-reset/request` |
| 2. 인증코드 확인 | `POST /auth/find-id/verify` → 아이디 | `POST /auth/password-reset/verify` → 재설정 토큰 |
| 3. | 화면에 아이디 표시 | `POST /auth/password-reset/confirm` → 새 비밀번호 저장 |

공통 규칙

- 인증코드는 숫자 6자리, **10분** 유효, **5회** 틀리면 그 코드는 무효(다시 받아야 함).
- 새로 받으면 같은 용도의 이전 코드는 무효. 아이디 찾기 코드와 비밀번호 찾기 코드는 서로 쓸 수 없다.
- 같은 회원·같은 용도로 **60초 안에 다시 요청하면 메일을 보내지 않는다**(응답은 같음).
- **계정 존재 여부를 드러내지 않는다**: 1단계는 가입 여부와 관계없이 같은 `200`, 2단계는 "코드 틀림·만료·없는 계정"을 모두 같은 에러(`INVALID_VERIFICATION_CODE`)로 준다. 메일은 응답을 기다리지 않고 보낸다(응답 시간으로도 구분되지 않게).
- `users`에 이름 컬럼이 없어(개인정보 최소 수집, spec-gaps 3장) REQ-LOGIN-004의 "이름 + 이메일" 대신 이메일만으로 찾는다.

| 에러 코드 | 상태 | 의미 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 빈 값·형식 오류 (코드는 숫자 6자리) |
| `INVALID_VERIFICATION_CODE` | 400 | 코드가 틀림·만료·이미 사용·5회 초과·없는 계정 (구분하지 않음) |
| `INVALID_RESET_TOKEN` | 400 | 재설정 토큰이 없거나 만료(10분)·이미 사용 → 처음부터 다시 |

### 1단계 응답 (두 요청 공통) `200`

```json
{ "data": { "sent": true, "resendAfterSeconds": 60, "expiresInSeconds": 600 } }
```

프론트는 `resendAfterSeconds` 동안 "다시 받기"를 막고, `expiresInSeconds`로 남은 시간을 보여준다.

### POST /auth/find-id/request

```json
{ "email": "t@ex.com" }
```

### POST /auth/find-id/verify

```json
{ "email": "t@ex.com", "code": "123456" }
```

응답 `200` → `{ "data": { "loginId": "tester1", "createdAt": "2026-11-12T03:09:50.000Z" } }`

### POST /auth/password-reset/request

```json
{ "loginId": "tester1", "email": "t@ex.com" }
```

### POST /auth/password-reset/verify

```json
{ "loginId": "tester1", "email": "t@ex.com", "code": "123456" }
```

응답 `200` → `{ "data": { "resetToken": "<일회용 토큰>", "expiresInSeconds": 600 } }`

### POST /auth/password-reset/confirm

```json
{ "resetToken": "<verify에서 받은 토큰>", "newPassword": "newpassword123" }
```

`newPassword`는 회원가입 `password`와 같은 규칙. 응답 `204 No Content` (로그인 상태로 만들지 않음 → 프론트는 로그인 화면으로 이동). 토큰은 한 번만 쓸 수 있다.

### 메일 발송

`backend/.env`의 `SMTP_HOST`가 비어 있으면 실제로 보내지 않고 **백엔드 서버 콘솔에 메일 내용(인증코드)을 출력**한다. 서버를 켤 때 SMTP 연결 성공/실패도 콘솔에 표시한다. 로컬 개발·테스트는 콘솔을 보면 된다. 실제 발송은 `.env.example`의 SMTP 항목을 채운다.

---

# 마이페이지 🔒

> 화면 `/my`. 모두 로그인 필요(`401 UNAUTHORIZED` / `INVALID_TOKEN`). 회원은 토큰으로만 식별한다.
> 목록 API는 `page`(기본 1)·`size`(기본 10, 최대 50)를 받고 `{ items, page, size, totalCount }`로 응답한다. 잘못된 값은 `400 VALIDATION_ERROR`.
> 찜 목록은 기존 `GET /users/me/wishes`를 그대로 쓴다.

## GET /users/me/summary — 프로필 + 활동 숫자

```json
{
  "data": {
    "profile": {
      "id": 1, "loginId": "test1", "nickname": "테스트유저1", "email": "test1@repick.dev",
      "profileImageUrl": null, "role": "user", "createdAt": "2025-10-12T03:21:15.000Z",
      "nicknameChangedAt": null, "nicknameChangeAvailableAt": null
    },
    "counts": {
      "selling": 10, "reserved": 0, "sold": 24, "purchased": 19,
      "wishes": 24, "posts": 7, "comments": 43, "soldAmount": 60435000
    }
  }
}
```

- `nicknameChangeAvailableAt`: 닉네임을 다시 바꿀 수 있는 시각. `null`이면 지금 바로 가능.
- `role`: `user` / `admin`. `admin`이면 마이페이지에 "품목 요청 관리" 탭이 보인다 (#34).
- `soldAmount`: 내 거래완료 판매글의 `sold_price` 합계(원).
- `wishes`·`comments`는 삭제된 판매글·글에 달린 것을 세지 않는다(목록 API와 같은 기준).

## GET /users/me/listings — 내 판매글

쿼리: `status`(선택, `selling` | `reserved` | `sold`), `page`, `size`. 판매중 → 예약중 → 거래완료 순, 같은 상태 안에서는 최신순. 삭제한 글은 빠진다.

```json
{ "listingId": 240, "registrationNo": "RPC-2026-000240", "title": "...", "itemName": "리자몽 초판 섀도리스",
  "price": 3929000, "status": "sold", "thumbnailUrl": "...", "viewCount": 297, "wishCount": 0,
  "soldPrice": 3929000, "soldAt": "2026-11-14T22:33:15.000Z", "createdAt": "..." }
```

## GET /users/me/purchases — 구매 내역

내가 `buyer_id`인 거래완료 판매글. 최근 거래순. 거래 기록이라 판매자가 지운 글도 포함한다(`isDeleted: true` → 상세로 이동 불가).

```json
{ "listingId": 241, "registrationNo": "...", "title": "...", "itemName": "...", "thumbnailUrl": "...",
  "soldPrice": 4150000, "soldAt": "...", "isDeleted": false, "seller": { "id": 6, "nickname": "리셀러J" } }
```

`seller.nickname`이 `null`이면 탈퇴한 회원.

## GET /users/me/posts — 내 토론글

```json
{ "postId": 56, "board": "free", "tag": "analysis", "itemId": null, "itemName": null,
  "title": "이번 주 리셀 시장 정리", "body": "...", "reactionCount": 6, "commentCount": 0, "createdAt": "..." }
```

## GET /users/me/comments — 내 댓글·답글

글이 삭제된 댓글은 뺀다. 글 제목이 없으면 `post.title`에 본문 앞 40자를 넣는다.

```json
{ "commentId": 63, "body": "맞아요 ㅎㅎ", "isReply": true, "likeCount": 1, "createdAt": "...",
  "post": { "id": 14, "board": "pokemon", "itemId": "charizard-ex-sar", "title": "PSA 10 2장 수령했습니다..." } }
```

## PATCH /users/me/nickname — 닉네임 변경

요청 `{ "nickname": "새닉네임" }` — 앞뒤 공백 제거 후 1~30자, 연속 공백·줄바꿈 불가.

응답 `200` → `{ "data": { "profile": Profile } }` (summary의 `profile`과 같은 모양)

| 에러 코드 | 상태 | 의미 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 형식 오류 |
| `SAME_NICKNAME` | 400 | 지금 닉네임과 같음 |
| `DUPLICATE_NICKNAME` | 409 | 이미 사용 중 (탈퇴 회원 포함) |
| `NICKNAME_CHANGE_TOO_SOON` | 409 | 30일 안에 이미 바꿈. `details.availableAt`에 다음 가능 시각 |

## PATCH /users/me/password — 비밀번호 변경

요청 `{ "currentPassword": "...", "newPassword": "..." }` — `newPassword`는 회원가입과 같은 규칙.

응답 `204 No Content`. 로그인 상태는 유지된다.

| 에러 코드 | 상태 | 의미 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 형식 오류 |
| `INVALID_CURRENT_PASSWORD` | 400 | 현재 비밀번호가 틀림 (401은 "로그아웃됨"으로 처리되므로 400) |
| `SAME_PASSWORD` | 400 | 새 비밀번호가 현재와 같음 |

---

# 토론글 (커뮤니티)

> 커뮤니티 피드(P-017)와 품목별 토론방(P-018)이 같은 `posts`를 쓴다. 피드는 `board`로, 토론방은 `itemId`로 걸러서 조회한다.
> 이미지 업로드·댓글은 별도 API에서 다룬다. 이모지 리액션은 아래 `PUT·DELETE /posts/:id/reaction`(#59)으로 남기며 `reactionCount`도 같은 트랜잭션에서 갱신된다.

**욕설 필터** (REQ-COMMON-006, #64): 등록·수정 때 `title`·`body`·`poll.options`의 욕설을 **같은 글자 수의 `*`로 바꿔서 저장**한다(요청은 거절하지 않음). 응답에도 바뀐 값이 온다. 댓글도 같다.

- 예: `"존나 비싸네 ㅅㅂ"` → `"** 비싸네 **"`, `"씨1발"` → `"***"`
- 글자 사이에 숫자·기호를 끼운 것도 잡고(`씨1발`, `ㅅ-ㅂ`), 띄어쓰기를 끼운 것은 잡지 않는다(`역시 발매` 같은 정상 문장 보호).
- 정상 단어는 가리지 않는다: `시발점`, `시발역`, `등신대`, `시바견` 등
- 단어 목록과 규칙: `backend/src/utils/profanity.js`

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

> **#46에서 api-spec-all.md 2장 ITEM-02로 통합됨** (판매글 등록 "공식 품목 검색"과 같은 API). 아래 요청·응답은 그대로 동작하고, 응답에 `cardNo`·`language`·`page`·`size`·`totalCount`가 더해졌다. 자세한 규칙은 ITEM-02를 본다.

로그인 없이 조회 가능. 품목명·세트명·카드번호 부분 일치(단어별 AND), 숨김 품목 제외. 토론글 글쓰기의 "시세 태그" 선택에 쓴다.

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `q` | - | ≤ 100자. 생략하면 전체 |
| `category` | - | 카테고리 `code` (대분류면 하위 포함) |
| `page` | `1` | 1부터 |
| `size` | `10` | 1~50 |

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

- #46에서 카테고리 필터·페이지를 더해 ITEM-02로 통합했다.

에러: `400 VALIDATION_ERROR`

---

# 실시간 많이 언급된 품목 (품목 토론방 사이드바)

## GET /items/trending — 많이 언급된 품목 순위

REQ-BOARD-010 (#39). 로그인 없이 조회 가능. 품목 토론방 사이드바는 `days=1`(최근 24시간), `limit=5`로 부른다.

- **언급 수(`mentionCount`) = 기간 안에 쓴 토론글 수 + 기간 안에 그 품목 토론글에 달린 댓글·답글 수**
- 언급 수가 많은 순, 같으면 마지막 언급(글·댓글)이 최근인 순
- 삭제된 글·댓글, 삭제된 글에 달린 댓글, 숨김 품목은 세지 않는다
- 댓글은 댓글을 쓴 시각으로 센다 (오래된 글이어도 최근 댓글이 달리면 언급으로 센다)
- 기간은 요청 시각 기준 `days × 24`시간 (`days=1` → 최근 24시간)

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `days` | `7` | 1~30 (사이드바는 `1`) |
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
        "commentCount": 9,
        "mentionCount": 12,
        "marketSummary": { "latestPrice": 285000, "changeAmount": -15000, "changeRate": -5, "averagePrice30d": 291000, "tradeCount30d": 3 }
      }
    ]
  }
}
```

| 필드 | 설명 |
|---|---|
| `postCount` | 기간 안에 쓴 토론글 수 |
| `commentCount` | 기간 안에 이 품목 토론글에 달린 댓글·답글 수 |
| `mentionCount` | `postCount + commentCount` — 순위 기준 |

- `marketSummary`는 ITEM-03과 같은 형식(필터 없는 전체 시세). 거래 이력이 없으면 `null`.

에러: `400 VALIDATION_ERROR`(범위를 벗어난 `days`·`limit`)

---

# 품목 등록 요청 (#47)

REQ-POST-005. 판매글 등록 화면(P-014) 4번 "공식 품목 DB 검색"에서 원하는 품목이 없으면 '품목이 없나요? 등록 요청'으로 **관리자에게 요청 글을 쓴다.**
글쓰기 형식(카테고리 + 제목 + 본문)이고 사진은 받지 않는다. 요청은 `item_requests`에 `pending`으로 쌓인다.

> 회원은 마이페이지 **"품목 요청"** 탭(ITEM-07)에서 처리 상태를 보고, 관리자(`users.role = 'admin'`)는 마이페이지 **"품목 요청 관리"** 탭(ITEM-08·09, #34)에서 승인·반려한다. 승인하면 `items`에 품목이 생겨 바로 품목 검색(ITEM-02)에 나온다.

| ID | 기능 | Method | URI | 인증 |
|---|---|---|---|---|
| ITEM-06 | 품목 등록 요청 | POST | `/item-requests` | 🔒 |
| ITEM-07 | 내 품목 등록 요청 목록 | GET | `/users/me/item-requests` | 🔒 |
| ITEM-08 | 품목 등록 요청 목록 (관리자) | GET | `/admin/item-requests` | 🔒 관리자 |
| ITEM-09 | 품목 등록 요청 승인·반려 (관리자) | PATCH | `/admin/item-requests/:id` | 🔒 관리자 |

> `/items/requests`가 아닌 `/item-requests`를 쓴다. `GET /items/:itemId`가 slug를 받으므로 `requests`가 slug로 해석되는 것을 피한다.

## ItemRequest 객체

```json
{
  "id": 7,
  "status": "pending",
  "category": { "id": 2, "code": "pokemon", "name": "포켓몬 카드" },
  "title": "피카츄 ex SAR",
  "body": "초전브레이커(SV8) 132/106 한글판입니다. 정발 카드인데 검색이 안 돼요.",
  "referenceUrl": "https://www.pokemoncard.co.kr/...",
  "rejectReason": null,
  "item": null,
  "createdAt": "2026-11-17T05:00:00.000Z",
  "processedAt": null
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `status` | string | `pending` 검토 중 · `approved` 등록됨 · `rejected` 반려 |
| `category` | `{ id, code, name }` | 요청한 소분류 카테고리 |
| `title` | string | 원하는 품목명 |
| `body` | string | 품목 설명 (세트명·카드번호·언어·발매 정보 등 자유 형식) |
| `referenceUrl` | string \| null | 공식 이미지·정보 링크 |
| `rejectReason` | string \| null | `rejected`일 때 관리자가 남긴 사유 |
| `item` | `{ id, slug, name }` \| null | `approved`일 때 등록(또는 연결)된 품목. 그 외 `null` |
| `processedAt` | string \| null | 승인·반려 시각. `pending`이면 `null` |

## POST /item-requests — 품목 등록 요청 🔒

요청

```json
{
  "categoryId": 2,
  "title": "피카츄 ex SAR",
  "body": "초전브레이커(SV8) 132/106 한글판입니다. 정발 카드인데 검색이 안 돼요.",
  "referenceUrl": "https://www.pokemoncard.co.kr/..."
}
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `categoryId` | O | **소분류** 카테고리 id (상위 카테고리가 있는 것). 대분류 id면 `400 VALIDATION_ERROR`, 없거나 숨김이면 `404 CATEGORY_NOT_FOUND` |
| `title` | O | 앞뒤 공백 제거 후 1~100자 (`items.name`과 같은 길이) |
| `body` | O | 앞뒤 공백 제거 후 1~1000자 |
| `referenceUrl` | X | `http://` 또는 `https://`로 시작, ≤ 500자. 빈 문자열·`null`은 없음으로 저장 |

- `title`·`body`의 욕설은 토론글처럼(REQ-COMMON-006) 같은 글자 수의 `*`로 가려 저장한다(거절하지 않음).
- 사진은 받지 않는다.

응답 `201`

```json
{ "data": { "itemRequest": { "id": 7, "status": "pending", "...": "ItemRequest 객체" } } }
```

**중복 검사** (순서대로, 비교는 앞뒤 공백 제거 + 대소문자 무시)

1. **이미 있는 품목** — 같은 소분류에 `title`과 이름이 같은 품목(`is_active = 1`)이 있으면 `409 ITEM_ALREADY_EXISTS`. `details.item`에 그 품목을 실어 준다. 화면은 요청 창을 닫고 그 이름으로 다시 검색해 바로 선택할 수 있게 한다.
2. **같은 요청 대기 중** — 내 `pending` 요청 중 같은 소분류 + 같은 `title`이 있으면 `409 ITEM_REQUEST_DUPLICATE`. 다른 사람이 같은 품목을 요청한 것은 막지 않는다(관리자가 묶어서 처리).

```json
{
  "error": {
    "code": "ITEM_ALREADY_EXISTS",
    "message": "이미 등록된 품목이에요. 검색 결과에서 선택해 주세요.",
    "details": { "item": { "id": 101, "slug": "pikachu-ex-sar-sv8-132", "name": "피카츄 ex SAR" } }
  }
}
```

에러: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` / `INVALID_TOKEN`, `404 CATEGORY_NOT_FOUND`, `409 ITEM_ALREADY_EXISTS` / `ITEM_REQUEST_DUPLICATE`

## GET /users/me/item-requests — 내 품목 등록 요청 목록 🔒

내가 보낸 요청을 최신순(`createdAt` 내림차순, 같으면 `id` 내림차순)으로 돌려준다. 마이페이지 목록 API와 같은 페이지 규칙. (이번 이슈는 API만 만들고 화면 연결은 하지 않는다)

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `status` | (전체) | `pending` / `approved` / `rejected` |
| `page` | `1` | 1부터 |
| `size` | `10` | 1~50 |

응답 `200`

```json
{
  "data": {
    "items": [ { "id": 7, "status": "pending", "...": "ItemRequest 객체" } ],
    "page": 1,
    "size": 10,
    "totalCount": 1
  }
}
```

에러: `400 VALIDATION_ERROR`(잘못된 `status`·`page`·`size`), `401 UNAUTHORIZED` / `INVALID_TOKEN`

## DB — `item_requests` 테이블

`erd.md` 2.22. 컬럼은 `id`, `user_id`, `category_id`, `title` VARCHAR(100), `body` VARCHAR(1000), `reference_url` VARCHAR(500), `status`(`pending`·`approved`·`rejected`), `reject_reason`, `item_id`, `processed_by`, `processed_at`, `created_at`, `updated_at`.

## 관리자 권한 (#34, spec-gaps A3)

- `users.role`(`user` · `admin`, 기본 `user`). 관리자 지정은 DB에서: `UPDATE users SET role = 'admin' WHERE login_id = '...'` (시드에서는 `test2`).
- 로그인할 때 **accessToken payload에 `role`을 넣고**, `requireAdmin` 미들웨어는 `req.user.role`만 본다(DB 조회 없음). 권한을 바꾸면 **다시 로그인해야** 반영된다.
- 관리자가 아니면 `403 FORBIDDEN`.
- `User` 객체(로그인·`GET /auth/me`)와 `GET /users/me/summary`의 `profile`에 `role`이 붙는다 → 프론트는 `admin`일 때만 "품목 요청 관리" 탭을 보여준다.

## GET /admin/item-requests — 요청 목록 (관리자) 🔒 · ITEM-08

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `status` | (전체) | `pending` / `approved` / `rejected` |
| `page`, `size` | `1`, `10` | ITEM-07과 같음 (size 1~50) |

정렬: `status=pending`이면 **오래된 요청부터**(먼저 온 것부터 처리), 그 외는 최신순.

응답 `200` — 항목은 `ItemRequest` 객체 + `requester`

```json
{
  "data": {
    "items": [
      { "id": 7, "status": "pending", "...": "ItemRequest 객체", "requester": { "id": 1, "nickname": "테스트유저1" } }
    ],
    "page": 1, "size": 10, "totalCount": 1
  }
}
```

- `requester.nickname`: 탈퇴한 회원이면 `null`.

에러: `400 VALIDATION_ERROR`, `401`, `403 FORBIDDEN`

## PATCH /admin/item-requests/:id — 승인·반려 (관리자) 🔒 · ITEM-09

요청 글은 자유 형식이라, **승인할 때 관리자가 실제 품목 정보를 입력**해 `items`에 만든다. 이미 있는 품목이면 그 품목에 연결만 할 수도 있다.

**① 새 품목을 만들어 승인**

```json
{
  "action": "approve",
  "item": { "name": "피카츄 ex SAR", "setName": "초전브레이커 (SV8)", "cardNo": "132/106", "language": "ko", "rarity": "SAR", "imageUrl": null }
}
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `item.name` | O | 앞뒤 공백 제거 후 1~100자 |
| `item.setName` | X | ≤ 100자. 카드 카테고리만 |
| `item.cardNo` | X | ≤ 30자, 앞의 `#`은 지움. 카드 카테고리만 |
| `item.language` | X | `ko` / `ja` / `en` / `zh`. 카드 카테고리만 |
| `item.rarity` | X | `SAR` / `UR` / `SR` / `AR` / `etc`. 카드 카테고리만 |
| `item.imageUrl` | X | http(s) URL, ≤ 500자 |

- 카테고리는 **요청의 소분류 그대로**. "카드 카테고리" = 대분류 `code`가 `cards`인 소분류. 그 밖의 카테고리에 카드 필드를 보내면 `400`.
- `slug`는 `item-request-{요청 id}`로 만든다.
- 같은 소분류에 이름이 같은 품목, 또는 세트명·카드번호·언어가 모두 같은 카드(`uk_items_card`)가 이미 있으면 `409 ITEM_ALREADY_EXISTS` + `error.details.item` → ②로 연결하면 된다.

**② 이미 있는 품목에 연결해 승인**

```json
{ "action": "approve", "itemId": 101 }
```

- 숨기지 않은 품목이어야 한다. 없으면 `404 ITEM_NOT_FOUND`.

**③ 반려**

```json
{ "action": "reject", "rejectReason": "공식 발매되지 않은 카드입니다." }
```

- `rejectReason`: 필수, 앞뒤 공백 제거 후 1~500자. 요청자의 "품목 요청" 탭에 보인다.

**함께 승인**: 승인하면 같은 소분류 + 같은 제목(대소문자 무시)으로 **대기 중인 다른 사람의 요청도 같은 품목으로 함께 승인**된다. (ITEM-06이 다른 사람의 같은 요청은 막지 않으므로)

응답 `200`

```json
{
  "data": {
    "itemRequest": { "id": 7, "status": "approved", "...": "ITEM-08 항목과 같은 형식" },
    "itemCreated": true,
    "approvedCount": 2
  }
}
```

| 필드 | 설명 |
|---|---|
| `itemCreated` | 승인만. ①이면 `true`, ②면 `false` |
| `approvedCount` | 승인만. 함께 승인된 요청 수 (이 요청 포함) |

에러

| 상태 | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `action`·필드 형식 오류, 비카드 카테고리에 카드 필드, `item`과 `itemId`를 둘 다 보내거나 둘 다 없음 |
| 401 | `UNAUTHORIZED` / `INVALID_TOKEN` | |
| 403 | `FORBIDDEN` | 관리자 아님 |
| 404 | `ITEM_REQUEST_NOT_FOUND` / `ITEM_NOT_FOUND` | 없는 요청 / ②의 품목이 없음 |
| 409 | `ITEM_REQUEST_ALREADY_PROCESSED` | 이미 승인·반려된 요청 (요청 행을 잠그고 확인 → 두 관리자가 동시에 눌러도 한 번만 처리) |
| 409 | `ITEM_ALREADY_EXISTS` | ①인데 같은 품목이 이미 있음. `error.details.item`에 `{ id, slug, name }` |

## 확인이 필요한 사항 (#47)

1. ~~관리자 처리 API·화면~~ → #34에서 ITEM-08·09와 마이페이지 "품목 요청 관리" 탭으로 구현.
2. **처리 결과 알림** — 승인·반려 시 요청자에게 알릴지. 알린다면 `notifications.type`에 `item_request`를 추가해야 한다. (지금은 마이페이지 "품목 요청" 탭에서만 확인)
3. **요청 횟수 제한** — 도배 방지로 1인 하루 N건 제한(`429`)이 필요한지.
4. ~~내 요청 목록 화면~~ → #34에서 마이페이지 "품목 요청" 탭으로 구현.

---

# 시세 대시보드 (#48, MARKET-01~05)

로그인 없이 조회 가능. **시세 = 거래완료(LISTING-07) 판매글의 최종 거래가(`sold_price`)** 로만 산출한다 (REQ-COMMON-004, 화면에 '참고용' 표기).

## 산출 방식

- 거래완료 처리 시 같은 트랜잭션에서 **일별 시세 집계표 `item_price_daily`** 의 해당 칸(품목·등급·체결일)을 다시 계산한다 → 저장 즉시 반영. `npm run db:market`으로 전체 재생성 가능(`db:init`·`db:seed`도 자동 실행).
- 시세는 **품목 × 등급(`gradeKey`)** 단위로 나눈다. `gradeKey` = graded면 `{그레이딩사 소문자}-{등급}`(`psa-10`, `bgs-9.5`), 아니면 `condition`(`unopened`, `opened_raw`).
- 날짜는 **KST** 기준 `YYYY-MM-DD`. 기간은 오늘 포함 최근 30일.
- 품목 시세(`price`) = 마지막 거래일의 체결가 **중앙값**(짝수 개면 가운데 두 값 평균, 원 단위 반올림).
- `change1d` = 직전 거래일 시세 대비(토론방 시세 요약 "전일 대비"와 같은 규칙). `change7d`·`change30d` = (오늘 − N일) 이전 마지막 거래일 시세 대비, 그 뒤 거래가 없으면 0. 변동률은 % 소수 1자리, 기준 거래가 없으면 `null`.
- 카테고리 차트는 일별 **평균** 체결가(체결가 합 ÷ 건수). 품목 가격대가 섞이므로 추이 참고용.
- 최근 30일 거래가 없는 품목·등급은 목록에서 빠진다.

## 공통 쿼리

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `category` | 최근 30일 거래가 있는 첫 소분류 | 소분류 카테고리 코드(`pokemon`, `dunk` …). 없거나 대분류면 `404 CATEGORY_NOT_FOUND` |
| `grade` | `all` | `all` 또는 `gradeKey` (`unopened`, `opened_raw`, `{psa\|bgs\|cgc\|brg}-{10\|9.5\|9\|8.5\|8\|7}`) |

## GET /market/filters — 카테고리 탭·등급 필터 (MARKET-01)

`category`만 받는다. 최근 30일 거래가 하나도 없으면 `category: null`, `grades: []`.

```json
{
  "data": {
    "categories": [{ "code": "pokemon", "name": "포켓몬 카드", "tradeCount": 102 }],
    "category": { "code": "pokemon", "name": "포켓몬 카드" },
    "grades": [{ "key": "psa-10", "condition": "graded", "gradingService": "PSA", "grade": "10", "tradeCount": 52 }],
    "totalTradeCount": 102,
    "period": { "days": 30, "from": "2026-10-19", "to": "2026-11-17" }
  }
}
```

`categories`는 최근 30일 거래가 있는 소분류만(카테고리 정렬순), `grades`는 거래 건수 많은 순.

## GET /market/insights — 시장 인사이트 (MARKET-02)

```json
{
  "data": {
    "itemCount": 15,
    "rising": { "count": 12, "averageChangeRate": 4.2 },
    "falling": { "count": 3, "averageChangeRate": -4.4 },
    "volume": { "tradeCount7d": 60, "previousTradeCount7d": 32, "changeRate": 87.5 }
  }
}
```

- `rising`·`falling`: `change1d`가 0보다 큰·작은 품목 수와 그 평균 변동률(없으면 `null`).
- `volume`: 최근 7일 거래 건수, 그 앞 7일 건수, 증감률(앞 7일이 0이면 `null`).

## GET /market/chart — 30일 시세·거래량 (MARKET-03)

```json
{
  "data": {
    "period": { "days": 30, "from": "2026-10-19", "to": "2026-11-17" },
    "summary": { "averagePrice": 542167, "change1d": 3.9, "change7d": -1.7, "change30d": 130.1, "tradeCount": 102 },
    "points": [{ "date": "2026-10-20", "averagePrice": 279000, "tradeCount": 1 }]
  }
}
```

`points`는 거래가 있는 날만(날짜 오름차순). `summary.averagePrice` = 30일 체결가 합 ÷ 건수, 변동률은 일별 평균 체결가 기준.

## GET /market/top-gainers — 전일 상승 Top N (MARKET-04)

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `limit` | `5` | 1~20 |

`change1d > 0`인 품목·등급을 상승률 높은 순(같으면 30일 거래 많은 순)으로. 항목은 아래 MarketItemPrice + `rank`.

## GET /market/prices — 품목별 시세 목록 (MARKET-05)

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `q` | | 품목명·세트명·카드번호 부분 일치(단어별 AND), 50자 이하 |
| `sort` | `volume` | `volume`(30일 거래순) · `priceDesc` · `priceAsc` · `rising`(`change1d` 높은순) · `falling`. 변동률 정렬에서 `null`은 맨 뒤. 같으면 최근 거래 → 이름순 |
| `page` | `1` | 1~1000 |
| `size` | `9` | 1~30 |

```json
{
  "data": {
    "items": [
      {
        "itemId": 1, "slug": "charizard-ex-sar", "name": "리자몽 ex SAR", "setName": "포켓몬 151 (SV2a)",
        "language": "ko", "imageUrl": "https://...",
        "gradeKey": "psa-10", "condition": "graded", "gradingService": "PSA", "grade": "10",
        "price": 320000, "change1d": 3.9, "change7d": 3.2, "change30d": 18.1,
        "tradeCount30d": 11, "lastTradeDate": "2026-11-16",
        "sparkline": [271000, 285000, 320000]
      }
    ],
    "totalCount": 16, "page": 1, "size": 9
  }
}
```

`sparkline`은 최근 30일 거래일별 시세(날짜 오름차순).

에러(공통): `400 VALIDATION_ERROR`(`category`·`grade`·`sort`·`page`·`size`·`limit`·`q` 형식), `404 CATEGORY_NOT_FOUND`

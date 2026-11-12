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
> 이미지 첨부·이모지 리액션·댓글은 별도 API에서 다룬다. `reactionCount`·`commentCount`는 해당 API가 생기면 함께 갱신된다(지금은 0).

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
  "author": { "id": 1, "nickname": "테스트유저1" },
  "reactionCount": 0,
  "commentCount": 0,
  "isMine": true,
  "createdAt": "2026-11-12T03:09:50.000Z",
  "updatedAt": "2026-11-12T03:09:50.000Z"
}
```

- `tag`, `itemId`, `title`은 `null`일 수 있다. (품목 토론방 글은 제목 없이 본문만 쓰는 경우가 많다)
- `itemId`는 품목 식별자(현재는 프론트의 품목 slug). 품목 API가 생기면 그 ID로 맞춘다.
- `isMine`: 로그인한 사용자가 작성자면 `true`. 비로그인이면 항상 `false`. 수정·삭제 버튼 노출에 쓴다.

## GET /posts — 토론글 목록

로그인 없이 조회 가능. (로그인 쿠키가 있으면 `isMine`이 채워진다)

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `board` | (전체) | 값 목록의 `board` 중 하나 |
| `itemId` | (전체) | 품목 토론방 글만 |
| `tag` | (전체) | 값 목록의 `tag` 중 하나 |
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

에러: `400 VALIDATION_ERROR`(허용되지 않은 `board`·`tag`·`sort`, 범위를 벗어난 `page`·`size`)

## GET /posts/:id — 토론글 단건 조회

응답 `200` → `{ "data": { "post": Post } }`

에러: `404 POST_NOT_FOUND`

## POST /posts — 토론글 등록 🔒

요청

```json
{ "board": "pokemon", "tag": "analysis", "itemId": "charizard-ex-sar", "title": "제목", "body": "본문" }
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `board` | O | 값 목록 중 하나 |
| `tag` | X | 값 목록 중 하나 |
| `itemId` | X | 1~100자 |
| `title` | X | 1~100자 (빈 문자열은 `null`로 저장) |
| `body` | O | 1~500자 (앞뒤 공백 제거 후) |

응답 `201` → `{ "data": { "post": Post } }`

에러: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` / `INVALID_TOKEN`

## PATCH /posts/:id — 토론글 수정 🔒

바꿀 필드만 보낸다. 필드 규칙은 등록과 같고, `tag`·`itemId`·`title`은 `null`을 보내면 비운다. 아무 필드도 없으면 `400`.

응답 `200` → `{ "data": { "post": Post } }`

에러: `400 VALIDATION_ERROR`, `401`, `403 FORBIDDEN`, `404 POST_NOT_FOUND`

## DELETE /posts/:id — 토론글 삭제 🔒

소프트 삭제(`deleted_at`). 삭제된 글은 목록·단건 조회에서 제외된다.

응답 `204 No Content`

에러: `401`, `403 FORBIDDEN`, `404 POST_NOT_FOUND`

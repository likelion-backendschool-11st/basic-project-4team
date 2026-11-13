# RE:PICK API 명세서 (통합본)

> 회원·품목·판매글·찜·토론글·댓글 명세 6개를 하나로 합친 문서다. 각 장의 내용은 원래 문서를 그대로 옮겼다.
> **문서마다 공통 규칙(Base URL, 인증 방식 등)이 서로 다른 부분이 있다.** 맨 아래 **[7. 통일이 필요한 항목](#7-통일이-필요한-항목)**을 먼저 확인할 것.

## 목차

| 장 | 도메인 | 주요 API |
|---|---|---|
| [1](#1-회원-auth) | 회원 (Auth) | 회원가입, 로그인, 토큰 재발급, 로그아웃, 내 정보 |
| [2](#2-카테고리품목-item) | 카테고리·품목 (Item) | 카테고리 트리, 품목 검색·상세, 시세 기준가, 같은 품목 판매글 |
| [3](#3-판매글-listing) | 판매글 (Listing) | 판매글 목록·상세·등록·수정·삭제, 상태 변경, 거래완료, 판매자의 다른 판매글 |
| [4](#4-찜-wish) | 찜 (Wish) | 찜하기, 찜 해제, 내 찜 목록 |
| [5](#5-토론글-board) | 토론글 (Board) | 토론글 목록·단건·등록·수정·삭제 |
| [6](#6-댓글-comment) | 댓글 (Comment) | 댓글 목록, 답글 더보기, 작성·수정·삭제 |
| [7](#7-통일이-필요한-항목) | — | 문서 간 충돌 정리 |

## 공통 응답 형식 (모든 문서 공통)

```json
// 성공
{ "data": { } }

// 실패
{ "error": { "code": "ERROR_CODE", "message": "사용자에게 보여줄 메시지" } }
```

- 요청·응답 본문은 JSON, 필드명은 camelCase
- 금액은 원 단위 정수, 시간은 ISO 8601 문자열
- 상대 시간("3일 전"), 금액 포맷("300,000원")은 프론트에서 만든다

---

# 1. 회원 (Auth)

> 기준: `backend/docs/api-definition.md`의 **AUTH-01, 04, 05, 06, 07**
> 현재 구현(JWT를 httpOnly 쿠키에 담는 방식)을 **Access Token은 `Authorization: Bearer` 헤더, Refresh Token은 httpOnly 쿠키**로 나누는 방식으로 바꾸는 명세다.

### 1. 개요

| ID | 기능 | Method | URI | 인증 | 상태 |
|---|---|---|---|---|---|
| AUTH-07 | 회원가입 | POST | `/api/auth/signup` | - | 변경 없음 |
| AUTH-01 | 로그인 | POST | `/api/auth/login` | - | **변경** (응답에 accessToken) |
| AUTH-04 | 토큰 재발급 | POST | `/api/auth/refresh` | Refresh 쿠키 | **신규** |
| AUTH-05 | 로그아웃 | POST | `/api/auth/logout` | Refresh 쿠키 | **변경** (Refresh Token 폐기) |
| AUTH-06 | 내 정보 | GET | `/api/auth/me` | Bearer 필수 | **변경** (헤더로 인증) |

#### 무엇이 바뀌나

| 항목 | 현재 | 변경 후 |
|---|---|---|
| 로그인 응답 | `user`만 반환, 토큰은 쿠키로 | `accessToken` + `user` 반환, Refresh Token은 쿠키로 |
| 인증 방법 | 쿠키 자동 전송 | `Authorization: Bearer {accessToken}` 헤더 |
| 토큰 만료 시 | 다시 로그인 | `/auth/refresh`로 자동 재발급 |
| 로그아웃 | 쿠키만 삭제 | 서버에서 Refresh Token 폐기 + 쿠키 삭제 |
| 토큰 수명 | 1시간 | Access 30분 / Refresh 14일 |

#### 왜 토큰을 두 개로 나누나

- **Access Token**(30분): 모든 API 요청에 붙이는 출입증. 짧게 살아서, 탈취되어도 피해가 30분으로 끝난다.
- **Refresh Token**(14일): Access Token을 새로 받을 때만 쓰는 재발급 티켓. JavaScript로 읽을 수 없는 httpOnly 쿠키에 넣어 XSS로 탈취되지 않게 한다.
- 결과적으로 사용자는 14일 동안 다시 로그인하지 않아도 된다.

### 2. 공통 규칙

| 항목 | 값 |
|---|---|
| Base URL | `http://127.0.0.1:4000/api` |
| Content-Type | `application/json` |
| 인증 헤더 | `Authorization: Bearer {accessToken}` |
| Refresh 쿠키 | `refreshToken` (httpOnly, `SameSite=Lax`, `Path=/api/auth`, 배포 시 `Secure`) |
| 프론트 fetch 설정 | `credentials: 'include'` 유지 (Refresh 쿠키를 주고받기 위해) |
| 성공 응답 | `{ "data": ... }` |
| 실패 응답 | `{ "error": { "code": "...", "message": "..." } }` |

#### JWT 구조

**Access Token**

```json
// header
{ "alg": "HS256", "typ": "JWT" }
// payload
{ "sub": "1", "type": "access", "iat": 1794453000, "exp": 1794454800 }
```

| 클레임 | 설명 |
|---|---|
| `sub` | 회원 ID (`users.id`) |
| `type` | `access` — Refresh Token으로 API를 호출하지 못하게 구분 |
| `iat`, `exp` | 발급·만료 시각 (초) |

- 닉네임, 이메일 같은 개인정보는 payload에 넣지 않는다. JWT payload는 암호화가 아니라 인코딩이라 누구나 읽을 수 있다.

**Refresh Token**

- payload: `{ "sub": "1", "type": "refresh", "jti": "<랜덤 ID>", "iat", "exp" }`
- 서버는 발급한 Refresh Token의 **해시**를 `refresh_tokens` 테이블에 저장한다. 그래야 로그아웃할 때 폐기할 수 있다.

#### 환경변수 (`backend/.env`)

| 키 | 예시 | 설명 |
|---|---|---|
| `JWT_ACCESS_SECRET` | (긴 랜덤 문자열) | Access Token 서명 키 |
| `JWT_REFRESH_SECRET` | (다른 긴 랜덤 문자열) | Refresh Token 서명 키 — Access와 **다르게** |
| `JWT_ACCESS_EXPIRES_IN` | `30m` | Access 수명 |
| `JWT_REFRESH_EXPIRES_IN` | `14d` | Refresh 수명 |

> 기존 `JWT_SECRET`, `JWT_EXPIRES_IN`은 위 4개로 대체한다. `.env.example`도 같이 수정할 것.

### 3. 에러 코드

| Code | 상태 | 의미 | 클라이언트 처리 |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | 입력값 형식 오류 | 필드 아래 메시지 표시 |
| `DUPLICATE_LOGIN_ID` | 409 | 아이디 중복 | 아이디 칸에 메시지 |
| `DUPLICATE_NICKNAME` | 409 | 닉네임 중복 | 닉네임 칸에 메시지 |
| `DUPLICATE_EMAIL` | 409 | 이메일 중복 | 이메일 칸에 메시지 |
| `INVALID_CREDENTIALS` | 401 | 아이디 또는 비밀번호 틀림 | 로그인 폼에 메시지 |
| `UNAUTHORIZED` | 401 | `Authorization` 헤더 없음 | 로그인 화면으로 이동 |
| `TOKEN_EXPIRED` | 401 | Access Token 만료 | **`/auth/refresh` 호출 후 원래 요청 재시도** |
| `INVALID_TOKEN` | 401 | Access Token 위조·형식 오류 | 로그인 화면으로 이동 |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh Token 없음·만료·폐기됨 | 로그인 화면으로 이동 |
| `INTERNAL_ERROR` | 500 | 서버 오류 | "잠시 후 다시 시도해 주세요" |

> `TOKEN_EXPIRED`와 `INVALID_TOKEN`을 꼭 구분한다. 만료일 때만 재발급을 시도해야 무한 재시도를 막을 수 있다.

### 4. User 객체

```json
{
  "id": 1,
  "loginId": "test1",
  "nickname": "테스트유저1",
  "email": "test1@repick.dev",
  "createdAt": "2026-11-12T03:09:50.000Z"
}
```

- `email`은 `null`일 수 있다.
- 비밀번호 해시는 어떤 응답에도 포함하지 않는다.

---

### 5. 회원 API

#### 5.1 회원가입 (AUTH-07)

**엔드포인트**

```
POST /api/auth/signup
```

**요청 헤더**

없음 (로그인 전)

**요청 예시**

```json
{
  "loginId": "test1",
  "password": "test1234",
  "nickname": "테스트유저1",
  "email": "test1@repick.dev"
}
```

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| `loginId` | string | O | 영문 소문자·숫자·`_`, 4~30자 |
| `password` | string | O | 8자 이상, 72바이트 이하 |
| `nickname` | string | O | 1~30자 |
| `email` | string | X | 이메일 형식 |

**응답 예시** — `201 Created`

```json
{
  "data": {
    "user": {
      "id": 1,
      "loginId": "test1",
      "nickname": "테스트유저1",
      "email": "test1@repick.dev",
      "createdAt": "2026-11-12T03:09:50.000Z"
    }
  }
}
```

> 가입만 처리하고 토큰은 주지 않는다. 가입 후 로그인 화면으로 보낸다.

**실패 예시** — `409 Conflict`

```json
{
  "error": {
    "code": "DUPLICATE_LOGIN_ID",
    "message": "이미 사용 중인 아이디입니다."
  }
}
```

**클라이언트 처리 흐름**

```
회원가입 폼 입력
  ↓
프론트 1차 검사 (빈 칸, 길이, 형식)
  ↓
POST /api/auth/signup
  ↓
성공 → "가입이 완료되었습니다" → /login 이동
실패 → 에러 코드에 맞는 칸에 메시지 표시
```

**서버 검증 항목**

- 각 필드의 형식·길이가 규칙에 맞는가
- 아이디·닉네임·이메일이 중복되지 않는가 (탈퇴 회원 포함)
- 비밀번호를 bcrypt로 해시해서 저장하는가 (원문 저장 금지)

---

#### 5.2 로그인 (AUTH-01)

**엔드포인트**

```
POST /api/auth/login
```

**요청 헤더**

없음

**요청 예시**

```json
{
  "loginId": "test1",
  "password": "test1234"
}
```

**응답 예시** — `200 OK`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwZSI6ImFjY2VzcyJ9.xxxx",
    "tokenType": "Bearer",
    "expiresIn": 1800,
    "user": {
      "id": 1,
      "loginId": "test1",
      "nickname": "테스트유저1",
      "email": "test1@repick.dev",
      "createdAt": "2026-11-12T03:09:50.000Z"
    }
  }
}
```

응답 헤더

```
Set-Cookie: refreshToken=eyJ...; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=1209600
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | string | API 호출에 쓰는 JWT |
| `tokenType` | string | 항상 `Bearer` |
| `expiresIn` | number | Access Token 남은 수명 (초) |
| `user` | User | 로그인한 회원 정보 |

**실패 예시** — `401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다."
  }
}
```

**클라이언트 처리 흐름**

```
아이디·비밀번호 입력 → 로그인 버튼
  ↓
POST /api/auth/login
  ↓
accessToken을 메모리(변수/상태)에 저장
(refreshToken 쿠키는 브라우저가 알아서 저장)
  ↓
user로 헤더의 로그인 상태 표시 → 홈으로 이동
```

**서버 검증 항목**

- 아이디·비밀번호가 비어 있지 않은가
- 탈퇴하지 않은 회원인가
- bcrypt로 비밀번호가 일치하는가
- 아이디가 없는 경우와 비밀번호가 틀린 경우를 **같은 에러로** 응답하는가 (아이디 존재 여부 노출 방지)
- Refresh Token 해시를 `refresh_tokens`에 저장했는가

---

#### 5.3 토큰 재발급 (AUTH-04) — 신규

**엔드포인트**

```
POST /api/auth/refresh
```

**요청 헤더**

```
Cookie: refreshToken={JWT}
```

브라우저가 쿠키를 자동으로 보낸다. `Authorization` 헤더는 필요 없다.

**요청 예시**

본문 없음.

**응답 예시** — `200 OK`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.(새 토큰)",
    "tokenType": "Bearer",
    "expiresIn": 1800,
    "user": {
      "id": 1,
      "loginId": "test1",
      "nickname": "테스트유저1",
      "email": "test1@repick.dev",
      "createdAt": "2026-11-12T03:09:50.000Z"
    }
  }
}
```

응답 헤더 (Refresh Token도 새로 바꿔준다 — **회전**)

```
Set-Cookie: refreshToken=eyJ...(새 토큰); HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=1209600
```

**실패 예시** — `401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "다시 로그인해 주세요."
  }
}
```

**클라이언트 처리 흐름**

```
[경우 1] API 응답이 401 TOKEN_EXPIRED
  ↓
POST /api/auth/refresh
  ↓
성공 → 새 accessToken 저장 → 원래 요청을 한 번만 재시도
실패 → accessToken 지우고 /login 이동

[경우 2] 새로고침·앱 시작 (메모리의 accessToken이 사라짐)
  ↓
POST /api/auth/refresh
  ↓
성공 → 로그인 상태 복원
실패 → 비로그인 상태로 표시 (에러 아님)
```

**서버 검증 항목**

- 쿠키에 Refresh Token이 있는가
- 서명과 만료가 유효하고 `type`이 `refresh`인가
- `refresh_tokens`에 있고 폐기(`revoked_at`)되지 않았는가
- 회원이 탈퇴하지 않았는가
- 사용한 Refresh Token은 폐기하고 새로 발급하는가 (회전)
- **이미 폐기된 토큰이 다시 들어오면** 탈취로 보고, 그 회원의 Refresh Token을 모두 폐기하는가

---

#### 5.4 로그아웃 (AUTH-05)

**엔드포인트**

```
POST /api/auth/logout
```

**요청 헤더**

```
Cookie: refreshToken={JWT}
```

**요청 예시**

본문 없음.

**응답 예시** — `204 No Content`

```
Set-Cookie: refreshToken=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0
```

- 로그인 상태가 아니어도(쿠키가 없거나 만료돼도) `204`로 응답한다. 로그아웃 버튼이 실패하는 일이 없게 하기 위해서다.

**실패 예시**

없음 (서버 오류 `500` 제외)

**클라이언트 처리 흐름**

```
로그아웃 버튼
  ↓
POST /api/auth/logout
  ↓
(성공·실패와 관계없이) 메모리의 accessToken 삭제
  ↓
헤더를 비로그인 상태로 → /login 또는 홈 이동
```

**서버 검증 항목**

- 쿠키의 Refresh Token을 `refresh_tokens`에서 폐기했는가
- 쿠키를 삭제했는가

> 이미 발급된 Access Token은 만료(최대 30분)까지 유효하다. JWT는 서버가 기억하지 않는 토큰이라 즉시 무효화할 수 없다. 그래서 Access Token 수명을 짧게 둔다.

---

#### 5.5 내 정보 (AUTH-06)

**엔드포인트**

```
GET /api/auth/me
```

**요청 헤더**

```
Authorization: Bearer {accessToken}
```

**요청 예시**

```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답 예시** — `200 OK`

```json
{
  "data": {
    "user": {
      "id": 1,
      "loginId": "test1",
      "nickname": "테스트유저1",
      "email": "test1@repick.dev",
      "createdAt": "2026-11-12T03:09:50.000Z"
    }
  }
}
```

**실패 예시** — `401 Unauthorized`

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "로그인이 만료되었습니다."
  }
}
```

**클라이언트 처리 흐름**

```
헤더·마이페이지 진입
  ↓
GET /api/auth/me (Bearer 헤더 자동 첨부)
  ↓
성공 → 닉네임 표시
401 TOKEN_EXPIRED → 5.3 재발급 흐름
```

**서버 검증 항목**

- `Authorization` 헤더가 `Bearer `로 시작하는가
- 서명과 만료가 유효하고 `type`이 `access`인가
- 토큰의 회원이 탈퇴하지 않았는가

---

### 6. 인증 미들웨어 (`middlewares/auth.js`)

로그인이 필요한 모든 API(찜, 매물 등록 등)는 이 미들웨어를 거친다.

```
요청
  ↓
Authorization 헤더 없음        → 401 UNAUTHORIZED
"Bearer " 형식 아님            → 401 INVALID_TOKEN
jwt.verify 실패: 만료          → 401 TOKEN_EXPIRED
jwt.verify 실패: 그 외         → 401 INVALID_TOKEN
type이 access가 아님           → 401 INVALID_TOKEN
  ↓
req.user = { id: Number(payload.sub) } → 다음 단계
```

### 7. DB

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  user_id     BIGINT      NOT NULL,
  token_hash  CHAR(64)    NOT NULL COMMENT 'Refresh Token의 SHA-256 해시',
  expires_at  DATETIME    NOT NULL,
  revoked_at  DATETIME    NULL COMMENT '로그아웃·회전으로 폐기된 시각',
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user (user_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '발급한 Refresh Token';
```

- 토큰 원문이 아니라 **해시**를 저장한다. DB가 유출되어도 토큰을 쓸 수 없다.
- 기기마다 한 줄씩 생긴다. PC와 휴대폰에서 각각 로그인하면 두 줄이 된다.

### 8. Client ↔ Server 매핑

| 프론트 (위치) | 변경 내용 | 서버 API |
|---|---|---|
| `src/api/client.ts` | 저장된 accessToken을 `Authorization` 헤더에 자동 첨부, `TOKEN_EXPIRED`면 refresh 후 1회 재시도 | 전체 |
| `src/api/auth.ts` → `login()` | 응답의 `accessToken`을 저장 | `POST /auth/login` |
| `src/api/auth.ts` → `refresh()` | 신규 | `POST /auth/refresh` |
| `src/api/auth.ts` → `logout()` | 저장된 accessToken 삭제 | `POST /auth/logout` |
| `src/hooks/auth/useAuthState.ts` | 앱 시작 시 `getMe()` 대신 `refresh()`로 로그인 복원 | `POST /auth/refresh` |

### 9. 보안 주의사항

- **Access Token은 `localStorage`에 저장하지 않는다.** 메모리(변수, React 상태)에만 둔다. `localStorage`는 XSS 공격 스크립트가 읽을 수 있다.
- Refresh Token은 httpOnly 쿠키라 JavaScript가 읽을 수 없다. 프론트 코드에서 다루지 않는다.
- Access와 Refresh는 **서명 키를 다르게** 쓰고, payload의 `type`으로도 한 번 더 구분한다.
- JWT payload에 개인정보(이메일, 닉네임 등)를 넣지 않는다.
- 토큰, 비밀번호를 `console.log`나 서버 로그에 남기지 않는다.
- 요청 본문의 `userId`는 신뢰하지 않는다. 회원은 항상 토큰의 `sub`로 식별한다.

### 10. 테스트 체크리스트

```
회원가입
□ 정상 가입 → 201, user 반환, password 필드 없음
□ 아이디 3자 → 400 VALIDATION_ERROR
□ 같은 아이디로 다시 가입 → 409 DUPLICATE_LOGIN_ID

로그인
□ 정상 로그인 → 200, accessToken·user 반환, refreshToken 쿠키 생성
□ 비밀번호 틀림 → 401 INVALID_CREDENTIALS
□ 없는 아이디 → 401 INVALID_CREDENTIALS (같은 메시지)

내 정보
□ Bearer 헤더로 요청 → 200
□ 헤더 없이 요청 → 401 UNAUTHORIZED
□ 토큰 끝 글자 변조 → 401 INVALID_TOKEN
□ 만료된 토큰 (JWT_ACCESS_EXPIRES_IN=10s로 테스트) → 401 TOKEN_EXPIRED
□ refreshToken을 Bearer 헤더에 넣음 → 401 INVALID_TOKEN

토큰 재발급
□ 쿠키 있음 → 200, 새 accessToken, 새 refreshToken 쿠키
□ 쿠키 없음 → 401 INVALID_REFRESH_TOKEN
□ 한 번 쓴 refreshToken으로 다시 요청 → 401, 그 회원의 모든 refreshToken 폐기
□ 새로고침 후에도 로그인 상태 유지

로그아웃
□ 로그아웃 → 204, 쿠키 삭제, DB의 revoked_at 기록
□ 로그아웃 후 refresh 요청 → 401 INVALID_REFRESH_TOKEN
□ 로그인 안 한 상태로 로그아웃 → 204
```

### 11. 팀 결정 필요

1. **경로 통일**: `api-definition.md`는 회원가입을 `POST /users`, 내 정보를 `GET /users/me`로 적었지만, 현재 구현은 `/auth/signup`, `/auth/me`다. 이 문서는 **현재 구현 경로를 유지**했다. 어느 쪽으로 맞출지 정해야 한다.
2. **토큰 수명**: Access 30분 / Refresh 14일로 할지
3. **Base URL 버전**: `api-definition.md`의 `/api/v1`과 현재 구현의 `/api` 중 어느 쪽으로 맞출지

---

# 2. 카테고리·품목 (Item)

> 대상 테이블: `categories`, `items` (+ 시세 계산용 `listings` 조회)
> 공통 규칙(Base URL `/api/v1`, 응답 래퍼, 에러 형식)은 `api-definition.md` 0장을 따릅니다.

### 목록

| ID | 기능 | Method | URI | 인증 | 사용 화면 |
|---|---|---|---|---|---|
| ITEM-01 | 카테고리 트리 조회 | GET | `/categories` | - | 홈 카테고리 패널, 검색 필터, 판매글 등록 |
| ITEM-02 | 품목 검색 | GET | `/items` | - | 판매글 등록 "공식 품목 DB 검색", 헤더 검색 |
| ITEM-03 | 품목 상세 조회 | GET | `/items/{itemId}` | - | 품목 토론방 헤더, 판매글 상세 |
| ITEM-04 | 품목 시세 기준가 조회 | GET | `/items/{itemId}/market-price` | - | 판매글 등록·수정 가격 피드백, 판매글 상세 평균가 |
| ITEM-05 | 같은 품목의 판매글 목록 | GET | `/items/{itemId}/listings` | 선택 | 판매글 상세 "같은 품목의 다른 매물" |

---

### 공통 데이터 형식

#### Category

| 필드 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `id` | number | 카테고리 PK | `2` |
| `parentId` | number \| null | 상위 카테고리. `null`이면 대분류 | `1` |
| `code` | string | URL·필터용 코드 (unique) | `"pokemon"` |
| `name` | string | 표시 이름 | `"포켓몬 카드"` |

#### ItemSummary

| 필드 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `id` | number | 품목 PK | `101` |
| `slug` | string | URL용 식별자 (unique) | `"charizard-ex-sar-sv2a-201"` |
| `name` | string | 품목명 | `"리자몽 ex SAR"` |
| `setName` | string \| null | 세트명 | `"포켓몬 151 (SV2a)"` |
| `cardNo` | string \| null | 카드 번호 | `"201/165"` |
| `language` | string \| null | `ko` / `ja` / `en` / `zh` | `"ko"` |
| `rarity` | string \| null | `SAR` / `UR` / `SR` / `AR` / `etc` | `"SAR"` |
| `imageUrl` | string \| null | 대표 이미지 | `"https://..."` |
| `category` | `{ id, code, name }` | 소속(소분류) 카테고리 | `{ "id": 2, "code": "pokemon", "name": "포켓몬 카드" }` |

> 운동화·명품 품목은 `setName`, `cardNo`, `language`, `rarity`가 `null`일 수 있습니다.

#### 시세 필터 파라미터 (ITEM-03, 04, 05 공통)

시세는 **같은 품목이라도 상태·등급별로 다르므로** 아래 조합으로 구분합니다. `listings` 컬럼과 같은 값을 씁니다.

| 파라미터 | 타입 | 값 | 설명 |
|---|---|---|---|
| `condition` | string | `unopened` / `opened_raw` / `graded` | 생략 시 전체 |
| `gradingService` | string | `PSA` / `BGS` / `CGC` / `BRG` | `condition=graded`일 때만 사용 |
| `grade` | string | `10` / `9.5` / `9` / `8.5` / `8` / `7` | `condition=graded`일 때만 사용 |

---

### ITEM-01. 카테고리 트리 조회

대분류 아래에 소분류를 `children`으로 묶어 반환합니다.

```
GET /api/v1/categories
```

#### Request

없음

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "code": "card",
      "name": "트레이딩 카드 (TCG)",
      "children": [
        { "id": 2, "parentId": 1, "code": "pokemon", "name": "포켓몬 카드" },
        { "id": 3, "parentId": 1, "code": "onepiece", "name": "원피스 카드 게임" },
        { "id": 4, "parentId": 1, "code": "yugioh", "name": "유희왕" }
      ]
    },
    {
      "id": 10,
      "code": "sneaker",
      "name": "한정판 스니커즈",
      "children": [
        { "id": 11, "parentId": 10, "code": "nike", "name": "나이키 / 조던" }
      ]
    }
  ]
}
```

#### 비고
- 정렬: `id` 오름차순 (표시 순서 조정이 필요하면 `sort_order` 컬럼 추가)
- 변경이 드문 데이터라 프론트에서 캐싱 권장

---

### ITEM-02. 품목 검색

판매글 등록 시 공식 품목을 찾아 연결하는 데 씁니다. 선택한 품목의 `setName`, `cardNo`, `language`, `rarity`가 폼에 자동으로 채워집니다.

```
GET /api/v1/items?q=리자몽&category=pokemon&page=1&size=10
```

#### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `q` | string | N | - | 검색어. `name`, `set_name`, `card_no`에서 부분 일치 |
| `category` | string | N | - | 카테고리 `code`. 대분류 코드면 하위 카테고리까지 포함 |
| `page` | number | N | `1` | 1부터 시작 |
| `size` | number | N | `10` | 최대 50 |

#### Response `200 OK`

```json
{
  "data": {
    "items": [
      {
        "id": 101,
        "slug": "charizard-ex-sar-sv2a-201",
        "name": "리자몽 ex SAR",
        "setName": "포켓몬 151 (SV2a)",
        "cardNo": "201/165",
        "language": "ko",
        "rarity": "SAR",
        "imageUrl": "https://cdn.repick.kr/items/101.png",
        "category": { "id": 2, "code": "pokemon", "name": "포켓몬 카드" }
      }
    ],
    "page": 1,
    "size": 10,
    "totalCount": 1
  }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `INVALID_PARAMETER` | `size`가 50 초과 등 |
| 404 | `CATEGORY_NOT_FOUND` | 존재하지 않는 `category` 코드 |

#### 비고
- 검색 결과가 0건이면 `items: []`로 200 응답 (404 아님)

---

### ITEM-03. 품목 상세 조회

품목 정보와 함께 시세 요약, 판매 중인 매물 수를 반환합니다. 품목 토론방 헤더(가격, 전일 대비 변동, 판매 매물 수)에 씁니다.

```
GET /api/v1/items/{itemId}?condition=graded&gradingService=PSA&grade=10
```

#### Path Parameters

| 이름 | 타입 | 설명 |
|---|---|---|
| `itemId` | number \| string | 품목 `id` 또는 `slug` |

#### Query Parameters

[시세 필터 파라미터](#시세-필터-파라미터-item-03-04-05-공통) 참고 (모두 선택). `marketSummary`, `sellingCount` 계산에만 영향을 줍니다.

#### Response `200 OK`

```json
{
  "data": {
    "id": 101,
    "slug": "charizard-ex-sar-sv2a-201",
    "name": "리자몽 ex SAR",
    "setName": "포켓몬 151 (SV2a)",
    "cardNo": "201/165",
    "language": "ko",
    "rarity": "SAR",
    "imageUrl": "https://cdn.repick.kr/items/101.png",
    "category": { "id": 2, "code": "pokemon", "name": "포켓몬 카드" },
    "breadcrumbs": [
      { "id": 1, "code": "card", "name": "트레이딩 카드 (TCG)" },
      { "id": 2, "code": "pokemon", "name": "포켓몬 카드" }
    ],
    "marketSummary": {
      "latestPrice": 320000,
      "changeAmount": 49000,
      "changeRate": 18.2,
      "tradeCount30d": 42
    },
    "sellingCount": 42
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `breadcrumbs` | Category[] | 대분류 → 소분류 순서 |
| `marketSummary` | object \| null | 거래 이력이 없으면 `null` |
| `marketSummary.latestPrice` | number | 최근 체결가 (원) |
| `marketSummary.changeAmount` | number | 전일 대비 변동액 (원, 음수 가능) |
| `marketSummary.changeRate` | number | 전일 대비 변동률 (%, 소수 1자리) |
| `marketSummary.tradeCount30d` | number | 최근 30일 거래완료 건수 |
| `sellingCount` | number | 현재 `status = selling`인 판매글 수 |

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 404 | `ITEM_NOT_FOUND` | 없는 품목 |

#### 비고
- 감성 투표(오른다/내린다), 토론 글 수는 **board API**에서 제공
- 시세 계산 기준: `listings.status = 'sold'` 이고 `deleted_at IS NULL`인 행의 `sold_price`

---

### ITEM-04. 품목 시세 기준가 조회

판매글 등록·수정 화면에서 입력한 가격이 시세와 얼마나 차이 나는지 보여주는 데 씁니다. 판매글 상세의 "최근 30일 평균 체결가"에도 씁니다.

```
GET /api/v1/items/{itemId}/market-price?condition=graded&gradingService=PSA&grade=10&days=30
```

#### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `condition`, `gradingService`, `grade` | | N | - | [시세 필터 파라미터](#시세-필터-파라미터-item-03-04-05-공통) |
| `days` | number | N | `30` | 집계 기간 (7 / 30 / 90) |

#### Response `200 OK`

```json
{
  "data": {
    "itemId": 101,
    "condition": "graded",
    "gradingService": "PSA",
    "grade": "10",
    "days": 30,
    "tradeCount": 42,
    "averagePrice": 320000,
    "medianPrice": 315000,
    "minPrice": 255000,
    "maxPrice": 365000,
    "lastSoldPrice": 310000,
    "lastSoldAt": "2025-11-09T14:20:00+09:00"
  }
}
```

거래 이력이 없는 경우:

```json
{
  "data": {
    "itemId": 101,
    "condition": "graded",
    "gradingService": "PSA",
    "grade": "10",
    "days": 30,
    "tradeCount": 0,
    "averagePrice": null,
    "medianPrice": null,
    "minPrice": null,
    "maxPrice": null,
    "lastSoldPrice": null,
    "lastSoldAt": null
  }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `INVALID_PARAMETER` | `days`가 허용값이 아님, `condition`이 `graded`가 아닌데 `grade` 지정 |
| 404 | `ITEM_NOT_FOUND` | 없는 품목 |

#### 비고
- 사기 의심 경고(시세 대비 ±30% 이상)는 프론트에서 `averagePrice`로 계산
- 기간 필터를 위해 `listings`에 **`sold_at` 컬럼이 필요**합니다 (현재 ERD에 없음)

---

### ITEM-05. 같은 품목의 판매글 목록

판매글 상세 하단 "같은 품목의 다른 매물" 캐러셀에 씁니다.

```
GET /api/v1/items/{itemId}/listings?excludeListingId=882194&sort=priceAsc&size=10
```

#### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `excludeListingId` | number | N | - | 지금 보고 있는 판매글 제외 |
| `status` | string | N | `selling` | `selling` / `reserved` / `sold` |
| `condition`, `gradingService`, `grade` | | N | - | [시세 필터 파라미터](#시세-필터-파라미터-item-03-04-05-공통) |
| `sort` | string | N | `priceAsc` | `priceAsc` / `priceDesc` / `latest` |
| `page` | number | N | `1` | |
| `size` | number | N | `10` | 최대 50 |

#### Response `200 OK`

```json
{
  "data": {
    "items": [
      {
        "id": 880101,
        "registrationNo": "P-010-880101",
        "title": "[PSA 9] 리자몽 ex SAR",
        "price": 255000,
        "status": "selling",
        "condition": "graded",
        "gradingService": "PSA",
        "grade": "9",
        "thumbnailUrl": "https://cdn.repick.kr/listings/880101/0.jpg",
        "directLocation": "경기 성남시 분당구",
        "createdAt": "2025-11-07T10:00:00+09:00",
        "isWished": false
      }
    ],
    "page": 1,
    "size": 10,
    "totalCount": 6
  }
}
```

| 필드 | 설명 |
|---|---|
| `thumbnailUrl` | `listing_images`에서 `sort_order = 0`인 이미지 |
| `directLocation` | 직거래 불가면 `null` |
| `isWished` | 로그인 시 내 찜 여부, 비로그인이면 항상 `false` |

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 404 | `ITEM_NOT_FOUND` | 없는 품목 |

#### 비고
- `deleted_at`이 있는 판매글은 제외
- 응답 항목은 **listing API의 목록 응답(ListingSummary)과 같은 형식**으로 맞추면 프론트 카드 컴포넌트를 재사용할 수 있습니다

---

### 확인이 필요한 사항

1. **`listings.sold_at` 추가** — 30일 시세, 전일 대비 변동 계산에 필요합니다.
2. **`{itemId}`에 slug 허용 여부** — 토론방 URL(`/community/items/charizard-ex-sar`)을 slug로 쓰려면 허용, 아니면 숫자 id만 받습니다.
3. **언어·레어도·그레이딩사·등급 옵션 목록** — 지금은 프론트 상수(`data/listingForm.ts`)에 있습니다. 운영 중 바뀔 일이 없다면 API 없이 유지하고, 바뀔 수 있다면 `GET /items/options` 추가를 검토합니다.
4. **시세 대시보드(`/market`) API** — 카테고리 단위 집계(차트, 상승 Top 5, 품목별 시세 목록)는 범위가 커서 별도 market API로 분리하는 것을 권장합니다.

---

# 3. 판매글 (Listing)

> 대상 테이블: `listings`, `listing_images`, `listing_wishes` (+ 시세 계산용 `items`, 판매자 정보용 `users` 조회)
> 공통 규칙(Base URL `/api/v1`, 응답 래퍼, 에러 형식)은 `api-definition.md` 0장을 따릅니다.
> 품목·시세 관련 API는 [2장 카테고리·품목](#2-카테고리품목-item)를 참고합니다.

### 목록

| ID | 기능 | Method | URI | 인증 | 사용 화면 |
|---|---|---|---|---|---|
| LISTING-01 | 판매글 검색·목록 | GET | `/listings` | 선택 | 검색 결과 |
| LISTING-02 | 판매글 상세 조회 | GET | `/listings/{listingId}` | 선택 | 판매글 상세(구매자·판매자), 판매글 수정 폼 |
| LISTING-03 | 판매글 등록 | POST | `/listings` | 필수 | 판매글 등록 |
| LISTING-04 | 판매글 수정 | PATCH | `/listings/{listingId}` | 필수(작성자) | 판매글 수정 |
| LISTING-05 | 판매글 삭제 | DELETE | `/listings/{listingId}` | 필수(작성자) | 내 판매글 상세, 판매글 수정 |
| LISTING-06 | 판매 상태 변경 | PATCH | `/listings/{listingId}/status` | 필수(작성자) | 내 판매글 상세 상태 드롭다운 |
| LISTING-07 | 거래완료 처리 | POST | `/listings/{listingId}/complete` | 필수(작성자) | 내 판매글 상세 거래완료 모달 |
| LISTING-08 | 찜하기 | PUT | `/listings/{listingId}/wish` | 필수 | 검색 결과, 판매글 상세 |
| LISTING-09 | 찜 해제 | DELETE | `/listings/{listingId}/wish` | 필수 | 검색 결과, 판매글 상세 |
| LISTING-10 | 판매자의 다른 판매글 | GET | `/users/{userId}/listings` | 선택 | 판매글 상세 판매자 카드 |

> "같은 품목의 다른 매물"은 **ITEM-05**(`GET /items/{itemId}/listings`)를 사용합니다.
> 이미지 파일 업로드는 **UPLOAD-01**(`POST /uploads/images`)로 먼저 올리고, 받은 `imageId`를 판매글 등록·수정에 넘깁니다.

---

### 공통 데이터 형식

#### Enum

| 이름 | 값 | 설명 |
|---|---|---|
| `ListingStatus` | `selling` / `reserved` / `sold` | 판매중 / 예약중 / 거래완료 |
| `ItemCondition` | `unopened` / `opened_raw` / `graded` | 미개봉 / 개봉 노슬랩 / 그레이딩 슬랩 |
| `GradingService` | `PSA` / `BGS` / `CGC` / `BRG` | `condition = graded`일 때만 값이 있음 |
| `Grade` | `10` / `9.5` / `9` / `8.5` / `8` / `7` | 문자열. `7`은 "7 이하" |
| `ListingSort` | `latest` / `priceAsc` / `priceDesc` / `popular` | `popular` = 찜 수 많은 순 |

> 값은 [2장 카테고리·품목](#2-카테고리품목-item)의 시세 필터 파라미터, 프론트 `data/listingForm.ts`와 같은 소문자 값을 씁니다.

#### ListingSummary (목록 카드)

LISTING-01, LISTING-10, ITEM-05가 **같은 형식**으로 응답합니다. 프론트 카드 컴포넌트를 함께 씁니다.

| 필드 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `id` | number | 판매글 PK | `882194` |
| `registrationNo` | string | 화면 표시용 등록번호 | `"RPC-2026-882194"` |
| `title` | string | 제목 | `"[PSA 10] 리자몽 ex SAR"` |
| `price` | number | 판매 희망가 (원) | `300000` |
| `status` | ListingStatus | | `"selling"` |
| `condition` | ItemCondition | | `"graded"` |
| `gradingService` | string \| null | | `"PSA"` |
| `grade` | string \| null | | `"10"` |
| `thumbnailUrl` | string \| null | `listing_images`에서 `sort_order = 0`인 이미지 | `"https://..."` |
| `directLocation` | string \| null | 직거래 불가면 `null` | `"서울 관악구 남현동"` |
| `wishCount` | number | 찜 수 | `38` |
| `isWished` | boolean | 로그인 시 내 찜 여부, 비로그인이면 항상 `false` | `false` |
| `priceDiffRate` | number \| null | 시세(30일 평균 체결가) 대비 차이율 (%, 소수 1자리). 음수 = 시세보다 저렴. 시세 없으면 `null` | `-6.3` |
| `item` | `{ id, slug, name, setName }` | 연결된 공식 품목 | |
| `createdAt` | string | ISO-8601 | `"2026-11-03T10:00:00+09:00"` |

#### ListingDetail (상세)

ListingSummary의 모든 필드에 아래 필드가 더해집니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `description` | string | 상세 설명 (≤ 1000자, 줄바꿈 `\n` 포함) |
| `images` | `{ id, url, sortOrder }[]` | 상품 사진. `sortOrder` 오름차순, 0번이 대표 사진 |
| `authImage` | `{ id, url }` | 실물 인증 사진 (닉네임 + 날짜 쪽지) |
| `delivery` | boolean | 택배 거래 가능 |
| `direct` | boolean | 직거래 가능 |
| `item` | ItemSummary | [2장 카테고리·품목](#2-카테고리품목-item)의 ItemSummary 전체 (세트명, 카드번호, 언어, 희귀도, 카테고리 포함) |
| `breadcrumbs` | Category[] | 대분류 → 소분류 순서 |
| `marketPrice` | object \| null | 같은 품목·상태·등급의 최근 30일 시세. 거래 이력이 없으면 `null` |
| `marketPrice.averagePrice` | number | 30일 평균 체결가 |
| `marketPrice.tradeCount` | number | 30일 거래 건수 |
| `viewCount` | number | 조회수 |
| `seller` | `{ id, nickname, soldCount }` | 판매자 요약. `soldCount` = 거래완료 판매글 수 |
| `isOwner` | boolean | 로그인한 사용자가 작성자인지 |
| `updatedAt` | string | 최종 수정 시각 |
| `soldPrice` | number \| null | 거래완료 시 체결가. `isOwner = true`일 때만 값, 아니면 `null` |

---

### LISTING-01. 판매글 검색·목록

```
GET /api/v1/listings?q=리자몽&category=pokemon&condition=graded&grades=PSA-10,BGS-9.5&minPrice=100000&maxPrice=500000&tradeMethod=direct&excludeSold=true&sort=latest&page=1&size=10
```

#### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `q` | string | N | - | 제목, 품목명, 세트명, 카드번호에서 부분 일치 |
| `category` | string | N | - | 카테고리 `code`. 대분류 코드면 하위 카테고리까지 포함 |
| `itemId` | number | N | - | 특정 품목의 판매글만 |
| `condition` | string | N | - | `ItemCondition`. 여러 개면 쉼표로 구분 (`unopened,graded`) |
| `grades` | string | N | - | `{그레이딩사}-{등급}`을 쉼표로 구분 (`PSA-10,PSA-9`). 지정하면 `condition = graded`인 글만 |
| `minPrice` | number | N | - | 최소 가격 (이상) |
| `maxPrice` | number | N | - | 최대 가격 (이하) |
| `tradeMethod` | string | N | - | `delivery` / `direct`. 둘 다면 쉼표로 구분 (하나라도 만족하면 포함) |
| `excludeSold` | boolean | N | `true` | `true`면 `sold` 제외 |
| `sort` | string | N | `latest` | `ListingSort` |
| `page` | number | N | `1` | 1부터 시작 |
| `size` | number | N | `10` | 최대 50 |

> 검색 화면의 등급 필터 "미개봉"은 `condition=unopened`, "그레이딩 없음"은 `condition=opened_raw`로 보냅니다.

#### Response `200 OK`

```json
{
  "data": {
    "items": [
      {
        "id": 882194,
        "registrationNo": "RPC-2026-882194",
        "title": "[PSA 10] 리자몽 ex SAR (SV2a 201/165)",
        "price": 300000,
        "status": "selling",
        "condition": "graded",
        "gradingService": "PSA",
        "grade": "10",
        "thumbnailUrl": "https://cdn.repick.kr/listings/882194/0.jpg",
        "directLocation": "서울 관악구 남현동",
        "wishCount": 38,
        "isWished": false,
        "priceDiffRate": -6.3,
        "item": {
          "id": 101,
          "slug": "charizard-ex-sar-sv2a-201",
          "name": "리자몽 ex SAR",
          "setName": "포켓몬 151 (SV2a)"
        },
        "createdAt": "2026-11-03T10:00:00+09:00"
      }
    ],
    "page": 1,
    "size": 10,
    "totalCount": 128
  }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `size` 50 초과, `minPrice > maxPrice`, 잘못된 enum 값, `grades` 형식 오류 |
| 404 | `CATEGORY_NOT_FOUND` | 존재하지 않는 `category` 코드 |

#### 비고
- `deleted_at`이 있는 판매글은 제외
- 결과가 0건이면 `items: []`로 200 응답 (404 아님)
- `priceDiffRate`는 판매글과 **같은 품목·상태·그레이딩사·등급**의 30일 평균 체결가 기준 (ITEM-04와 같은 계산)

---

### LISTING-02. 판매글 상세 조회

구매자 화면(P-010), 판매자 화면(P-013), 수정 폼(P-015)이 모두 이 API를 씁니다. 화면 분기는 `isOwner`로 합니다.

```
GET /api/v1/listings/{listingId}
```

#### Path Parameters

| 이름 | 타입 | 설명 |
|---|---|---|
| `listingId` | number | 판매글 PK |

#### Response `200 OK`

```json
{
  "data": {
    "id": 882194,
    "registrationNo": "RPC-2026-882194",
    "title": "[PSA 10] 리자몽 ex SAR (SV2a 201/165)",
    "price": 300000,
    "status": "selling",
    "condition": "graded",
    "gradingService": "PSA",
    "grade": "10",
    "thumbnailUrl": "https://cdn.repick.kr/listings/882194/0.jpg",
    "directLocation": "서울 관악구 남현동 (사당역 인근)",
    "wishCount": 38,
    "isWished": true,
    "priceDiffRate": -6.3,
    "createdAt": "2026-11-03T10:00:00+09:00",
    "updatedAt": "2026-11-05T18:30:00+09:00",
    "description": "직접 개봉 후 바로 PSA 접수한 원오너 소장품입니다.\n\n제습함 보관, 슬랩 스크래치 없습니다.",
    "images": [
      { "id": 5001, "url": "https://cdn.repick.kr/listings/882194/0.jpg", "sortOrder": 0 },
      { "id": 5002, "url": "https://cdn.repick.kr/listings/882194/1.jpg", "sortOrder": 1 }
    ],
    "authImage": { "id": 5003, "url": "https://cdn.repick.kr/listings/882194/auth.jpg" },
    "delivery": true,
    "direct": true,
    "item": {
      "id": 101,
      "slug": "charizard-ex-sar-sv2a-201",
      "name": "리자몽 ex SAR",
      "setName": "포켓몬 151 (SV2a)",
      "cardNo": "201/165",
      "language": "ko",
      "rarity": "SAR",
      "imageUrl": "https://cdn.repick.kr/items/101.png",
      "category": { "id": 2, "code": "pokemon", "name": "포켓몬 카드" }
    },
    "breadcrumbs": [
      { "id": 1, "code": "card", "name": "트레이딩 카드 (TCG)" },
      { "id": 2, "code": "pokemon", "name": "포켓몬 카드" }
    ],
    "marketPrice": { "averagePrice": 320000, "tradeCount": 42 },
    "viewCount": 1420,
    "seller": { "id": 7, "nickname": "포케마스터99", "soldCount": 42 },
    "isOwner": false,
    "soldPrice": null
  }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 또는 삭제된 판매글 |

#### 비고
- 조회 시 `view_count + 1`. 작성자 본인이 조회할 때는 올리지 않음
- 품목 토론 글 수는 **board API**에서 제공
- 판매자 평점·리뷰는 리뷰 기능이 생기면 `seller`에 추가

---

### LISTING-03. 판매글 등록

```
POST /api/v1/listings
Content-Type: application/json
```

#### Request Body

```json
{
  "itemId": 101,
  "imageIds": [5001, 5002, 5004],
  "authImageId": 5003,
  "condition": "graded",
  "gradingService": "PSA",
  "grade": "10",
  "title": "[PSA 10] 포켓몬 151 리자몽 ex SAR 민트급",
  "price": 300000,
  "description": "직접 개봉 후 바로 PSA 접수한 원오너 소장품입니다.",
  "delivery": true,
  "direct": true,
  "directLocation": "서울 관악구 남현동 (사당역 인근)",
  "agreed": true
}
```

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| `itemId` | number | Y | 존재하는 품목. 카테고리는 품목에서 정해짐 |
| `imageIds` | number[] | Y | 1 ~ 10개. 배열 순서 = 노출 순서, 첫 장이 대표 사진 |
| `authImageId` | number | Y | 실물 인증 사진 |
| `condition` | ItemCondition | Y | |
| `gradingService` | string | 조건부 | `condition = graded`면 필수, 아니면 보내지 않음 |
| `grade` | string | 조건부 | `condition = graded`면 필수, 아니면 보내지 않음 |
| `title` | string | Y | 1 ~ 100자 (앞뒤 공백 제거 후) |
| `price` | number | Y | 정수, 1원 이상 1,000,000,000원 이하 |
| `description` | string | N | 최대 1000자. 생략 시 빈 문자열 |
| `delivery` | boolean | Y | `delivery`, `direct` 중 하나 이상 `true` |
| `direct` | boolean | Y | |
| `directLocation` | string | 조건부 | `direct = true`면 필수 (1 ~ 100자), `false`면 무시하고 `null`로 저장 |
| `agreed` | boolean | Y | 반드시 `true` (판매자 책임 동의) |

#### Response `201 Created`

```json
{
  "data": {
    "id": 882194,
    "registrationNo": "RPC-2026-882194"
  }
}
```

> 프론트는 받은 `id`로 상세 페이지(`/my/listings/{id}`)로 이동합니다.

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 위 규칙 위반 (필드별 사유는 `error.details`에 담음) |
| 401 | `UNAUTHORIZED` | 비로그인 |
| 404 | `ITEM_NOT_FOUND` | 없는 `itemId` |
| 404 | `IMAGE_NOT_FOUND` | 없는 이미지이거나 내가 올린 이미지가 아님 |
| 409 | `IMAGE_ALREADY_USED` | 다른 판매글에 이미 연결된 이미지 |

#### 비고
- 새 판매글의 `status`는 `selling`
- 판매글 저장과 `listing_images` 연결은 **한 트랜잭션**으로 처리
- 시세 대비 ±30% 경고는 등록을 막지 않음 (프론트에서 ITEM-04로 계산해 안내만)

---

### LISTING-04. 판매글 수정

바꿀 필드만 보냅니다. 보내지 않은 필드는 그대로 둡니다.

```
PATCH /api/v1/listings/{listingId}
Content-Type: application/json
```

#### Request Body

```json
{
  "imageIds": [5002, 5001, 5004],
  "title": "[PSA 10] 포켓몬 151 리자몽 ex SAR 가격 내립니다",
  "price": 285000,
  "direct": false
}
```

| 필드 | 수정 가능 | 규칙 |
|---|---|---|
| `imageIds` | O | 등록과 같음. 보내면 **전체 교체** (순서 변경도 이걸로) |
| `authImageId` | O | 교체 시 재검수 대상 |
| `condition` | 일부 | `unopened → graded`만 허용 (그레이딩 슬랩은 미개봉으로 되돌릴 수 없음) |
| `gradingService`, `grade` | O | `condition = graded`일 때만 |
| `title`, `price`, `description` | O | 등록과 같음 |
| `delivery`, `direct`, `directLocation` | O | 등록과 같음 (수정 후 상태 기준으로 검사) |
| `itemId` | **X** | 시세 데이터 보호를 위해 수정 불가 |

#### Response `200 OK`

수정된 **ListingDetail** (LISTING-02와 같은 형식)

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 규칙 위반, `itemId` 포함, 허용되지 않는 `condition` 변경 |
| 401 | `UNAUTHORIZED` | 비로그인 |
| 403 | `FORBIDDEN` | 작성자가 아님 |
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 |
| 409 | `LISTING_ALREADY_SOLD` | 거래완료된 판매글은 수정 불가 |

#### 비고
- 가격을 내리면 찜한 사용자에게 알림 (알림 기능이 생기면 연결, 지금은 범위 밖)
- 빠진 이미지는 연결만 끊고 파일 삭제는 별도 정리 작업으로

---

### LISTING-05. 판매글 삭제

```
DELETE /api/v1/listings/{listingId}
```

#### Response `204 No Content`

본문 없음

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 401 | `UNAUTHORIZED` | 비로그인 |
| 403 | `FORBIDDEN` | 작성자가 아님 |
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 또는 이미 삭제됨 |
| 409 | `LISTING_ALREADY_SOLD` | 거래완료된 판매글 (시세 데이터 보존) |

#### 비고
- 소프트 삭제: `deleted_at = NOW()`
- 거래완료된 판매글은 시세 계산에 쓰이므로 삭제할 수 없음

---

### LISTING-06. 판매 상태 변경

판매중 ↔ 예약중만 바꿉니다. 거래완료는 LISTING-07을 씁니다.

```
PATCH /api/v1/listings/{listingId}/status
Content-Type: application/json
```

#### Request Body

```json
{ "status": "reserved" }
```

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| `status` | string | Y | `selling` / `reserved` |

#### Response `200 OK`

```json
{
  "data": { "id": 882194, "status": "reserved" }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `status`가 `sold`이거나 잘못된 값 |
| 401 | `UNAUTHORIZED` | 비로그인 |
| 403 | `FORBIDDEN` | 작성자가 아님 |
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 |
| 409 | `LISTING_ALREADY_SOLD` | 이미 거래완료 |

#### 비고
- 현재와 같은 상태로 요청하면 그대로 200 (멱등)

---

### LISTING-07. 거래완료 처리

최종 체결가를 기록하고 상태를 `sold`로 바꿉니다. 이 값이 시세(ITEM-03, 04) 계산에 들어갑니다.

```
POST /api/v1/listings/{listingId}/complete
Content-Type: application/json
```

#### Request Body

```json
{
  "soldPrice": 295000,
  "buyerId": 12,
  "requestReview": true
}
```

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| `soldPrice` | number | Y | 실제 거래 금액. 정수, 1원 이상 |
| `buyerId` | number \| null | N | 구매 회원. 외부 거래·미등록 구매자면 `null` |
| `requestReview` | boolean | N | 구매자에게 후기 요청 알림 (기본 `false`, 알림 기능 생기면 사용) |

#### Response `200 OK`

```json
{
  "data": {
    "id": 882194,
    "status": "sold",
    "soldPrice": 295000,
    "soldAt": "2026-11-12T15:20:00+09:00"
  }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `soldPrice` 누락·형식 오류, `buyerId`가 본인 |
| 401 | `UNAUTHORIZED` | 비로그인 |
| 403 | `FORBIDDEN` | 작성자가 아님 |
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 |
| 404 | `USER_NOT_FOUND` | 없는 `buyerId` |
| 409 | `LISTING_ALREADY_SOLD` | 이미 거래완료 |

#### 비고
- `status = 'sold'`, `sold_price`, `sold_at = NOW()`, `buyer_id`를 함께 저장
- 구매자 후보 목록(채팅한 사용자)은 **chat API**에서 제공

---

### LISTING-08. 찜하기

```
PUT /api/v1/listings/{listingId}/wish
```

#### Response `200 OK`

```json
{
  "data": { "listingId": 882194, "isWished": true, "wishCount": 39 }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 400 | `CANNOT_WISH_OWN_LISTING` | 내 판매글 |
| 401 | `UNAUTHORIZED` | 비로그인 |
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 |

#### 비고
- 이미 찜한 상태면 그대로 200 (멱등). `(user_id, listing_id)` UNIQUE로 중복 방지

---

### LISTING-09. 찜 해제

```
DELETE /api/v1/listings/{listingId}/wish
```

#### Response `200 OK`

```json
{
  "data": { "listingId": 882194, "isWished": false, "wishCount": 38 }
}
```

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 401 | `UNAUTHORIZED` | 비로그인 |
| 404 | `LISTING_NOT_FOUND` | 없는 판매글 |

#### 비고
- 찜하지 않은 상태여도 그대로 200 (멱등)
- 찜 버튼 숫자를 바로 갱신할 수 있게 204 대신 `wishCount`를 돌려줌

---

### LISTING-10. 판매자의 다른 판매글

판매글 상세의 "판매자의 다른 상품 (3)" 카드에 씁니다.

```
GET /api/v1/users/{userId}/listings?status=selling&excludeListingId=882194&size=3
```

#### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `status` | string | N | `selling` | `ListingStatus` |
| `excludeListingId` | number | N | - | 지금 보고 있는 판매글 제외 |
| `page` | number | N | `1` | |
| `size` | number | N | `10` | 최대 50 |

#### Response `200 OK`

LISTING-01과 같은 형식 (`items`는 ListingSummary[], `totalCount`가 "판매자의 다른 상품 (N)"의 N)

#### Errors

| 상태 | code | 상황 |
|---|---|---|
| 404 | `USER_NOT_FOUND` | 없는 회원 |

---

### 이 명세가 가정하는 테이블 컬럼

ERD 확정 시 맞춰서 수정합니다.

**`listings`**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | BIGINT PK | |
| `registration_no` | VARCHAR(30) UNIQUE | `RPC-{등록연도}-{id}` |
| `seller_id` | BIGINT FK → users | |
| `item_id` | BIGINT FK → items | |
| `title` | VARCHAR(100) | |
| `price` | INT | |
| `description` | TEXT | |
| `condition` | VARCHAR(20) | `unopened` / `opened_raw` / `graded` (`condition`은 MySQL 예약어라 쿼리에서 백틱 필요) |
| `grading_service` | VARCHAR(10) NULL | |
| `grade` | VARCHAR(5) NULL | |
| `delivery` | TINYINT(1) | |
| `direct` | TINYINT(1) | |
| `direct_location` | VARCHAR(100) NULL | |
| `status` | VARCHAR(20) | `selling` / `reserved` / `sold` |
| `view_count` | INT DEFAULT 0 | |
| `sold_price` | INT NULL | |
| `sold_at` | DATETIME NULL | |
| `buyer_id` | BIGINT NULL FK → users | |
| `created_at`, `updated_at`, `deleted_at` | DATETIME | |

인덱스: `(item_id, status, deleted_at)`, `(seller_id, status)`, `(status, sold_at)` — 시세 계산용

**`listing_images`**: `id`, `listing_id`, `url`, `type`(`photo` / `auth`), `sort_order`, `created_at`

**`listing_wishes`**: `id`, `user_id`, `listing_id`, `created_at`, UNIQUE `(user_id, listing_id)`

> `wishCount`는 매번 `COUNT(*)`로 계산합니다. 느려지면 `listings.wish_count` 컬럼을 추가합니다.

---

### 확인이 필요한 사항

1. **공식 품목 없이 등록 허용 여부** — 지금 명세는 `itemId` 필수(시세 연동 때문). 품목 DB에 없는 물건도 받으려면 `itemId`를 선택으로 바꾸고, 세트명·카드번호 등을 판매글에 직접 저장해야 합니다.
2. **등록번호 형식** — 목업에 `P-010-882194`, `RPC-2025-08914` 두 가지가 섞여 있습니다. 이 명세는 `RPC-{연도}-{id}`로 가정했습니다.
3. **ListingSummary 필드 맞추기** — ITEM-05 응답 예시에 `wishCount`, `priceDiffRate`, `item`이 없습니다. 카드 컴포넌트를 함께 쓰려면 ITEM-05에도 추가해야 합니다.
4. **에러 코드 이름** — 이미 구현된 auth API는 `VALIDATION_ERROR`를 쓰고, item 명세는 `INVALID_PARAMETER`를 씁니다. 이 명세는 구현된 쪽(`VALIDATION_ERROR`)을 따랐습니다. 하나로 통일이 필요합니다.
5. **운동화·명품 속성** — 검색 화면에 사이즈 필터가 있지만, 사이즈·스타일코드 같은 운동화/명품 속성을 판매글에 저장할 곳이 아직 없습니다. 카드 카테고리부터 구현하고 나중에 `attributes`(JSON) 컬럼 추가를 검토합니다.
6. **이미지 업로드 방식** — UPLOAD-01 명세가 확정되어야 `imageIds` 방식이 맞는지 확정됩니다. 업로드 없이 URL만 넘기는 방식으로 시작한다면 `imageIds` 대신 `imageUrls`를 받도록 바꿉니다.

---

# 4. 찜 (Wish)

> 기준: `backend/docs/api-definition.md`의 **LIST-02 ~ LIST-04**
> 공통 규칙(응답 형식, 인증 쿠키, 공통 에러 코드)은 `backend/docs/api-spec.md`를 따른다.

### 1. 개요

사용자가 관심 있는 매물을 찜하고, 찜을 해제하고, 내가 찜한 매물 목록을 보는 기능이다.

| ID | 기능 | Method | URI | 인증 | 사용 화면 |
|---|---|---|---|---|---|
| LIST-02 | 찜하기 | POST | `/api/listings/{listingId}/wishes` | 필수 | 검색 결과, 매물 상세 |
| LIST-03 | 찜 해제 | DELETE | `/api/listings/{listingId}/wishes` | 필수 | 검색 결과, 매물 상세 |
| LIST-04 | 내 찜 목록 | GET | `/api/users/me/wishes` | 필수 | 찜 목록 (화면 미구현) |

#### 설계 원칙

- **클라이언트**: 하트 버튼 클릭, 요청, 응답의 `isWished`·`wishCount`로 화면 갱신
- **서버**: 로그인 확인, 매물 존재·상태 확인, 중복 찜 방지, 찜 수 집계
- 찜하기와 찜 해제는 **멱등**이다. 같은 요청을 여러 번 보내도 결과가 같고 에러가 나지 않는다. (버튼 연타, 네트워크 재시도 대비)
- 찜한 사용자는 요청 본문이 아니라 **로그인 쿠키(토큰)로 식별**한다.

### 2. 공통 규칙

| 항목 | 값 |
|---|---|
| Base URL | `http://127.0.0.1:4000/api` |
| Content-Type | `application/json` |
| 인증 | 로그인 시 발급된 `accessToken` httpOnly 쿠키 (프론트는 `credentials: 'include'`만 설정) |
| 성공 응답 | `{ "data": ... }` |
| 실패 응답 | `{ "error": { "code": "...", "message": "..." } }` |

### 3. 에러 코드

| Code | 상태 | 의미 | 발생 API |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | `listingId`, `page`, `size` 형식 오류 | 전체 |
| `UNAUTHORIZED` | 401 | 로그인 안 함 (쿠키 없음) | 전체 |
| `INVALID_TOKEN` | 401 | 로그인 만료·위조 | 전체 |
| `CANNOT_WISH_OWN_LISTING` | 403 | 내 매물을 찜하려고 함 | LIST-02 |
| `LISTING_NOT_FOUND` | 404 | 없는 매물 (찜하기는 삭제된 매물도 포함) | LIST-02, LIST-03 |
| `LISTING_SOLD` | 409 | 거래완료된 매물을 찜하려고 함 | LIST-02 |
| `INTERNAL_ERROR` | 500 | 서버 오류 | 전체 |

**클라이언트 후속 처리**

| 에러 | 처리 |
|---|---|
| 401 | "로그인이 필요합니다" 안내 후 `/login`으로 이동 |
| 403, 409 | 하트를 원래 상태로 되돌리고 `message`를 토스트로 표시 |
| 404 | "삭제된 매물입니다" 토스트, 목록이면 해당 카드 제거 |

---

### 4. 찜 API

#### 4.1 찜하기 (LIST-02)

**엔드포인트**

```
POST /api/listings/{listingId}/wishes
```

| 경로 변수 | 타입 | 설명 |
|---|---|---|
| `listingId` | number | 매물 ID (1 이상의 정수) |

**요청 헤더**

```
Cookie: accessToken={JWT}
```

**요청 예시**

본문 없음.

```
POST /api/listings/1/wishes
```

**응답 예시**

새로 찜했으면 `201 Created`, 이미 찜한 상태였으면 `200 OK`. 본문은 같다.

```json
{
  "data": {
    "listingId": 1,
    "isWished": true,
    "wishCount": 39
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `listingId` | number | 매물 ID |
| `isWished` | boolean | 내가 찜했는지 (항상 `true`) |
| `wishCount` | number | 이 매물의 전체 찜 수 (요청 반영 후) |

**실패 예시**

```json
{
  "error": {
    "code": "CANNOT_WISH_OWN_LISTING",
    "message": "내 매물은 찜할 수 없습니다."
  }
}
```

```json
{
  "error": {
    "code": "LISTING_SOLD",
    "message": "거래가 완료된 매물은 찜할 수 없습니다."
  }
}
```

**클라이언트 처리 흐름**

```
하트 버튼 클릭 (빈 하트)
  ↓
하트를 먼저 채워서 표시 (낙관적 업데이트)
  ↓
POST /api/listings/{listingId}/wishes
  ↓
성공 → 응답의 wishCount로 찜 수 갱신, "찜 목록에 추가되었습니다." 토스트
실패 → 하트를 빈 상태로 되돌리고 에러 처리
```

**서버 검증 항목**

- 로그인했는가 (쿠키의 토큰이 유효한가)
- `listingId`가 1 이상의 정수인가
- 매물이 존재하고, 삭제되지 않았는가
- 내 매물이 아닌가
- 거래완료(`SOLD`) 매물이 아닌가 (`SELLING`, `RESERVED`는 찜 가능)
- 이미 찜했다면 중복 저장하지 않는가 (DB PK `user_id + listing_id`로 보장)

---

#### 4.2 찜 해제 (LIST-03)

**엔드포인트**

```
DELETE /api/listings/{listingId}/wishes
```

**요청 헤더**

```
Cookie: accessToken={JWT}
```

**요청 예시**

본문 없음.

```
DELETE /api/listings/1/wishes
```

**응답 예시**

`200 OK`. 찜하지 않은 상태에서 요청해도 같은 결과로 성공한다.

```json
{
  "data": {
    "listingId": 1,
    "isWished": false,
    "wishCount": 38
  }
}
```

> 삭제 API지만 `204 No Content` 대신 `200`과 본문을 돌려준다. 화면이 바뀐 찜 수를 바로 반영해야 하기 때문이다.

**실패 예시**

```json
{
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "매물을 찾을 수 없습니다."
  }
}
```

**클라이언트 처리 흐름**

```
하트 버튼 클릭 (채워진 하트)
  ↓
하트를 먼저 비워서 표시 (낙관적 업데이트)
  ↓
DELETE /api/listings/{listingId}/wishes
  ↓
성공 → 응답의 wishCount로 찜 수 갱신, "찜이 해제되었습니다." 토스트
실패 → 하트를 채운 상태로 되돌리고 에러 처리
```

**서버 검증 항목**

- 로그인했는가
- `listingId`가 1 이상의 정수인가
- 매물이 존재하는가 (**삭제된 매물은 허용**: 사용자가 남은 찜을 정리할 수 있도록)
- 다른 사람의 찜은 지울 수 없는가 (토큰의 사용자 ID로만 삭제)

---

#### 4.3 내 찜 목록 (LIST-04)

**엔드포인트**

```
GET /api/users/me/wishes?page={page}&size={size}
```

| 쿼리 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `page` | number | X | 1 | 페이지 번호 (1부터) |
| `size` | number | X | 20 | 한 페이지 개수 (최대 50) |

**요청 헤더**

```
Cookie: accessToken={JWT}
```

**요청 예시**

```
GET /api/users/me/wishes?page=1&size=20
```

**응답 예시**

`200 OK`. 최근에 찜한 순으로 정렬한다.

```json
{
  "data": {
    "items": [
      {
        "listingId": 4,
        "registrationNo": "RPC-2026-00004",
        "title": "에어조던 1 레트로 하이 시카고 270",
        "price": 480000,
        "status": "SELLING",
        "thumbnailUrl": null,
        "wishCount": 12,
        "wishedAt": "2026-11-12T08:30:00.000Z"
      },
      {
        "listingId": 2,
        "registrationNo": "RPC-2026-00002",
        "title": "뮤 ex SAR 205",
        "price": 145000,
        "status": "RESERVED",
        "thumbnailUrl": null,
        "wishCount": 5,
        "wishedAt": "2026-11-11T02:10:00.000Z"
      }
    ],
    "page": 1,
    "size": 20,
    "totalCount": 2
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `items[].listingId` | number | 매물 ID |
| `items[].registrationNo` | string | 화면 표시용 등록번호 |
| `items[].title` | string | 매물 제목 |
| `items[].price` | number | 가격 (원) |
| `items[].status` | string | `SELLING` / `RESERVED` / `SOLD` |
| `items[].thumbnailUrl` | string \| null | 대표 사진 URL |
| `items[].wishCount` | number | 이 매물의 전체 찜 수 |
| `items[].wishedAt` | string | 내가 찜한 시각 (ISO 8601, UTC) |
| `page`, `size` | number | 요청한 페이지 정보 |
| `totalCount` | number | 내 찜 전체 개수 |

- 삭제된 매물은 목록에서 빠진다.
- 거래완료(`SOLD`)된 매물은 목록에 남는다. 화면에서 "거래완료"로 표시한다.

**실패 예시**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "size는 1~50 사이의 정수여야 합니다."
  }
}
```

**클라이언트 처리 흐름**

```
찜 목록 화면 진입
  ↓
GET /api/users/me/wishes?page=1&size=20
  ↓
items로 카드 목록 표시, totalCount로 페이지네이션 표시
  ↓
카드의 하트 클릭 → LIST-03 호출 → 성공 시 카드 제거
```

**서버 검증 항목**

- 로그인했는가
- `page`가 1 이상의 정수인가
- `size`가 1~50 사이의 정수인가
- 토큰의 사용자 찜만 조회하는가 (다른 사람의 찜 목록은 볼 수 없음)

---

### 5. 다른 API에 추가되는 필드

찜 상태를 목록·상세 화면에 보여주기 위해, 아래 API 응답에 찜 정보를 포함한다.

| API | 추가 필드 | 비로그인 시 |
|---|---|---|
| LIST-01 매물 검색·목록 | `isWished`, `wishCount` | `isWished: false` |
| DETAIL-01 매물 상세 | `isWished`, `wishCount` | `isWished: false` |

### 6. Client ↔ Server 매핑

| 프론트 (위치) | 서버 API |
|---|---|
| `src/api/wishes.ts` → `addWish(listingId)` | `POST /listings/{listingId}/wishes` |
| `src/api/wishes.ts` → `removeWish(listingId)` | `DELETE /listings/{listingId}/wishes` |
| `src/api/wishes.ts` → `getMyWishes(page, size)` | `GET /users/me/wishes` |
| `hooks/search/useWishlist.ts`, `hooks/listing/useWishlist.ts` | 위 함수 호출 (현재는 로컬 상태만 토글) |

### 7. DB

```sql
CREATE TABLE wishes (
  user_id    BIGINT   NOT NULL,
  listing_id BIGINT   NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '찜한 시각',
  PRIMARY KEY (user_id, listing_id),          -- 중복 찜 방지
  KEY idx_wishes_listing_id (listing_id),     -- 매물별 찜 수 집계
  CONSTRAINT fk_wishes_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT fk_wishes_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
);
```

> `listings` 테이블이 먼저 있어야 한다. 매물 API 담당자와 테이블 생성 순서를 맞출 것.

### 8. 보안 주의사항

- 요청 본문이나 쿼리로 받은 `userId`를 쓰지 않는다. 사용자는 **토큰으로만** 식별한다.
- `wishCount`는 클라이언트가 보낸 값이 아니라 **서버가 DB에서 센 값**을 돌려준다.
- 버튼 연타로 같은 요청이 여러 번 와도 DB PK 덕분에 찜이 중복 저장되지 않는다.

### 9. 테스트 체크리스트

```
찜하기
□ 로그인 안 하고 요청 → 401
□ 다른 사람 매물 찜 → 201, isWished true, wishCount +1
□ 같은 매물 다시 찜 → 200, wishCount 그대로
□ 내 매물 찜 → 403 CANNOT_WISH_OWN_LISTING
□ 거래완료 매물 찜 → 409 LISTING_SOLD
□ 없는 매물 찜 → 404 LISTING_NOT_FOUND
□ listingId에 문자 입력 (/listings/abc/wishes) → 400

찜 해제
□ 찜한 매물 해제 → 200, isWished false, wishCount -1
□ 찜 안 한 매물 해제 → 200, wishCount 그대로
□ 없는 매물 해제 → 404

내 찜 목록
□ 찜 2개 → items 2개, totalCount 2, 최근 찜이 맨 위
□ size=100 → 400
□ 삭제된 매물은 목록에서 빠짐
□ 다른 계정으로 로그인하면 그 계정의 찜만 보임
```

### 10. 팀 결정 필요

1. 내 매물 찜 금지(403)와 거래완료 매물 찜 금지(409) 규칙을 유지할지
2. 매물별 찜 수를 매번 `COUNT`로 셀지, `listings.wish_count` 컬럼에 저장해 둘지 (목록이 느려지면 컬럼 방식으로 전환)

---

# 5. 토론글 (Board)

> 관련 이슈: #57 토론글 등록·수정·삭제, #58 토론글 목록 (정렬·페이징)
> 요청·응답 형식의 기준은 `docs/api-spec.md`의 **토론글 (커뮤니티)** 섹션이다. 이 문서는 구현 구조와 사용법을 정리한 것이다.

커뮤니티 피드(P-017)와 품목별 토론방(P-018)이 같은 `posts` 테이블을 쓴다.

- 피드 → `board`로 필터 (`GET /api/posts?board=pokemon`)
- 품목 토론방 → `itemId`로 필터 (`GET /api/posts?itemId=charizard-ex-sar`)

---

### 1. API 요약

기본 주소: `http://localhost:4000/api`

| 메서드 | 경로 | 인증 | 설명 | 성공 |
|---|---|---|---|---|
| GET | `/posts` | 선택 | 목록 (필터·정렬·페이징) | `200` |
| GET | `/posts/:id` | 선택 | 단건 조회 | `200` |
| POST | `/posts` | 🔒 필수 | 등록 | `201` |
| PATCH | `/posts/:id` | 🔒 필수 (작성자만) | 부분 수정 | `200` |
| DELETE | `/posts/:id` | 🔒 필수 (작성자만) | 소프트 삭제 | `204` |

- **선택 인증**: 로그인하지 않아도 조회할 수 있다. 로그인 쿠키가 있으면 각 글의 `isMine`이 채워진다.
- 만료되거나 잘못된 토큰으로 조회하면 401을 내지 않고 비로그인으로 처리한다.

#### 목록 쿼리 파라미터

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `board` | 전체 | `pokemon` · `sneakers` · `onepiece` · `watch` · `free` |
| `itemId` | 전체 | 품목 식별자 |
| `tag` | 전체 | `analysis` · `verify` · `unboxing` · `poll` · `qna` · `info` |
| `sort` | `latest` | `latest` 최신순 · `popular` 인기순 (리액션 수 + 댓글 수 → 최신순) |
| `page` | `1` | 1부터 시작 |
| `size` | `20` | 1~50 |

#### 목록 응답

```json
{
  "data": {
    "posts": [
      {
        "id": 12,
        "board": "pokemon",
        "tag": "analysis",
        "itemId": "charizard-ex-sar",
        "title": null,
        "body": "PSA10 물량이 국내 유통 채널에서 눈에 띄게 줄어서...",
        "author": { "id": 1, "nickname": "테스트유저1" },
        "reactionCount": 0,
        "commentCount": 0,
        "isMine": true,
        "editedAt": null,
        "createdAt": "2026-11-12T03:09:50.000Z",
        "updatedAt": "2026-11-12T03:09:50.000Z"
      }
    ],
    "page": 1,
    "size": 20,
    "totalCount": 4,
    "hasNext": false
  }
}
```

- `totalCount`: 필터를 적용한 전체 글 수 (화면의 "총 N개의 토론")
- `hasNext`: 무한 스크롤에서 `false`가 될 때까지 `page`를 1씩 올려서 요청한다.

#### 등록 / 수정 요청 필드

| 필드 | 등록 시 필수 | 규칙 |
|---|---|---|
| `board` | O | 값 목록 중 하나 (수정 시 `null` 불가) |
| `tag` | X | 값 목록 중 하나, `null`로 비우기 가능 |
| `itemId` | X | 1~100자. **등록할 때만** 받는다. 수정 요청에 넣으면 `400` (REQ-BEDIT-001) |
| `title` | X | 1~100자, 빈 문자열·`null`은 `null`로 저장 |
| `body` | O | 앞뒤 공백 제거 후 1~500자 |

PATCH는 보낸 필드만 수정한다(`board`, `tag`, `title`, `body`). 아무 필드도 보내지 않으면 `400`. 수정하면 `editedAt`이 현재 시각으로 바뀐다 ("(수정됨)" 표시, REQ-BEDIT-004).

#### 에러 코드

| 코드 | 상태 | 언제 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 허용되지 않은 값, 글자 수 초과, 수정할 필드 없음 |
| `UNAUTHORIZED` / `INVALID_TOKEN` | 401 | 등록·수정·삭제 시 로그인 안 됨 / 토큰 만료 |
| `FORBIDDEN` | 403 | 남의 글을 수정·삭제하려 함 |
| `POST_NOT_FOUND` | 404 | 없거나 삭제된 글, 숫자가 아닌 id |

---

### 2. 파일 구조

```
backend/
  db/schema.sql                         posts 테이블 정의
  scripts/db-seed.js                    샘플 토론글 4개 (테이블이 비었을 때만)
  src/
    app.js                              app.use('/api/posts', communityRoutes)
    community/community.routes.js       URL ↔ 컨트롤러, 인증 미들웨어 연결
    community/community.controller.js   쿼리·본문 검증 (board/tag 값 목록, 글자 수, 페이징 범위)
    community/community.service.js      작성자 권한 확인(403), isMine 계산, hasNext 계산
    community/community.repository.js   SQL, snake_case → camelCase 변환, edited_at 기록
    middlewares/auth.js                 optionalAuth 추가 (조회용 선택 인증)
```

흐름: `routes → controllers → services → repositories` (`docs/convention.md` 규칙과 같음)

---

### 3. DB — `posts` 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | BIGINT PK | |
| `user_id` | BIGINT FK → `users.id` | 작성자 |
| `board` | VARCHAR(20) | 게시판 |
| `tag` | VARCHAR(20) NULL | 태그 |
| `item_id` | VARCHAR(100) NULL | 품목 식별자 |
| `title` | VARCHAR(100) NULL | 제목 |
| `body` | TEXT | 본문 |
| `reaction_count` | INT, 기본값 0 | 인기순 정렬용 집계 |
| `comment_count` | INT, 기본값 0 | 인기순 정렬용 집계 |
| `created_at` / `updated_at` | DATETIME | |
| `deleted_at` | DATETIME NULL | 소프트 삭제 시각 |

인덱스: `(board, created_at)`, `(item_id, created_at)`

---

### 4. 로컬 실행·테스트

```bash
cd backend
npm run db:init    # posts 테이블 생성 (이미 있으면 건너뜀)
npm run db:seed    # 테스트 계정 test1~3 + 샘플 토론글
npm run dev
```

```bash
# 목록
curl "http://localhost:4000/api/posts?board=pokemon&sort=latest&page=1&size=20"

# 로그인 → 쿠키 저장
curl -c cookie.txt -H "Content-Type: application/json" \
  -d '{"loginId":"test1","password":"test1234"}' http://localhost:4000/api/auth/login

# 등록
curl -b cookie.txt -H "Content-Type: application/json" \
  -d '{"board":"free","tag":"qna","body":"hello"}' http://localhost:4000/api/posts

# 수정
curl -b cookie.txt -X PATCH -H "Content-Type: application/json" \
  -d '{"title":"new title"}' http://localhost:4000/api/posts/1

# 삭제
curl -b cookie.txt -X DELETE http://localhost:4000/api/posts/1
```

> Windows Git Bash에서는 curl 인자에 한글을 넣으면 인코딩이 깨져서 저장될 수 있다. 한글 테스트는 Postman이나 프론트에서 한다.

---

### 5. 구현 메모

- `LIMIT ? OFFSET ?`는 `pool.execute`(prepared statement)에서 타입 오류가 나서 목록 조회만 `pool.query`를 쓴다. `query`도 `?`를 이스케이프하므로 SQL 인젝션에는 안전하다.
- 정렬은 `sort` 값을 그대로 SQL에 넣지 않고 미리 정해 둔 `ORDER BY` 맵에서 고른다.
- 수정 시 바꿀 수 있는 컬럼은 `UPDATABLE_COLUMNS` 목록에 있는 것만 허용한다.

### 6. 남은 작업 (TODO)

- [ ] **품목 연동** (#46): `item_id`가 지금은 프론트 slug 문자열이다. 품목 테이블이 생기면 FK로 바꾼다.
- [ ] **리액션** (#59) / **댓글** (#62): 리액션이나 댓글을 추가·삭제할 때 `posts.reaction_count` / `comment_count`도 함께 올리고 내려야 인기순 정렬이 의미가 생긴다. (지금은 둘 다 0이라 인기순 = 최신순)
- [ ] **이미지 첨부**: 파일 서버(#16)가 생기면 `post_images` 테이블을 추가한다.
- [ ] **프론트 연동** (#38, #40~#42): ~~피드(`useCommunityFeed`)~~ → `src/api/community.ts`로 연결 완료(#57). 품목 토론방 `useItemDiscussion`은 아직 목 데이터.

---

# 6. 댓글 (Comment)

> 공통 규칙(기본 주소 `http://localhost:4000/api`, `{ "data": ... }` / `{ "error": ... }` 응답 형식, 쿠키 인증, 공통 에러 코드)은 `docs/api-spec.md`를 따른다. 🔒 = 로그인 필요.
>
> 근거: 프론트 `frontend/src/data/community.ts`의 `FeedPost`·`DiscussionPost`(`author`, `badges`, `commentCount`).
> 프론트에는 아직 댓글 UI·`Comment` 타입이 없어서, 게시글 모델의 작성자/배지 구조를 그대로 따르도록 설계했다.
> 피드 글(P-017)과 품목 토론 글(P-018)은 같은 `posts` 리소스이므로 댓글 API도 하나로 쓴다.

### 규칙

- 댓글은 **2단계까지**: 댓글(`parentId: null`) → 답글(`parentId: 댓글 id`). 답글에 다시 답글은 달 수 없다.
- 정렬: 댓글은 **오래된 순**(작성 순), 답글도 오래된 순.
- 삭제는 **소프트 삭제**. 답글이 남아 있는 댓글은 목록에 `isDeleted: true`, `body: null`로 남겨 "삭제된 댓글입니다"를 표시하고, 답글이 없으면 목록에서 빠진다.
- 게시글의 `commentCount`는 삭제되지 않은 댓글 + 답글 수의 합이다. 작성 시 +1, 삭제 시 -1.
- 시간은 ISO 문자열. "10분 전" 같은 상대 시간은 프론트에서 만든다.
- 아바타 이니셜·색상(`CommunityAuthor.initials`, `tone`), 배지 문구·색상(`CommunityBadge.label`, `tone`)은 **프론트가** `nickname`·배지 코드로 만든다. API는 데이터만 준다.

### CommentAuthor 객체

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

### Comment 객체

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

### GET /community/posts/:postId/comments — 댓글 목록

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

### GET /community/comments/:commentId/replies — 답글 더보기

로그인 선택. 쿼리 `cursor`, `size`(1~50, 기본 20)는 댓글 목록과 같다.

응답 `200` → `{ "data": { "items": [Comment], "nextCursor": null, "hasNext": false } }` (답글에는 `replyCount`·`replies` 없음)

에러: `400 VALIDATION_ERROR`, `404 COMMENT_NOT_FOUND`

### POST /community/posts/:postId/comments — 댓글·답글 작성 🔒

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

### PATCH /community/comments/:commentId — 댓글 수정 🔒

요청

```json
{ "body": "수정한 내용입니다." }
```

`body` 규칙은 작성과 같다. 작성자 본인만 수정할 수 있다.

응답 `200` → `{ "data": { "comment": Comment } }`

에러: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COMMENT_NOT_FOUND`

### DELETE /community/comments/:commentId — 댓글 삭제 🔒

요청 본문 없음. 작성자 본인만 삭제할 수 있다. 응답 `204 No Content`.

삭제 후 댓글 수는 게시글 조회·댓글 목록 재조회로 반영한다.

에러: `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COMMENT_NOT_FOUND`

### 미정 항목 (팀 결정 필요)

1. 댓글 리액션(🔥😮😂🧊)·신고를 댓글에도 둘지 — 현재 명세에는 없음.
2. 게시글 id 형식 — 목업은 `'post-1'` 문자열, 명세는 `users`와 같은 숫자 BIGINT로 가정.
3. 댓글 작성 시 게시글 작성자 알림 — 알림 API가 생기면 추가.

---

# 7. 통일이 필요한 항목

6개 문서를 합치면서 찾은 **서로 다른 부분**이다. 팀 회의에서 정한 뒤 해당 장을 고친다.

| # | 항목 | 문서별 현재 상태 | 제안 |
|---|---|---|---|
| 1 | **Base URL** | `/api` — 회원, 찜, 토론글, 댓글 (현재 구현)<br>`/api/v1` — 품목, 판매글 | 구현과 같은 `/api`로 통일 |
| 2 | **인증 방식** | `Authorization: Bearer` + Refresh 쿠키 — 회원(1장)<br>`accessToken` 쿠키 — 찜, 토론글, 댓글 | 1장의 Bearer 방식으로 바꾸기로 했다면 4~6장의 "쿠키 인증" 문구와 요청 헤더 예시를 수정 |
| 3 | **찜 API 중복** | 4장: `POST` / `DELETE /listings/{id}/wishes` + `GET /users/me/wishes`, 테이블 `wishes`<br>3장: `PUT` / `DELETE /listings/{id}/wish` (LISTING-08, 09), 테이블 `listing_wishes` | 하나만 남기기. 남긴 쪽의 경로·테이블 이름으로 다른 쪽을 지운다 |
| 4 | **내 매물 찜 에러** | 4장: `403 CANNOT_WISH_OWN_LISTING`, 거래완료 매물 `409 LISTING_SOLD`<br>3장: `400 CANNOT_WISH_OWN_LISTING`, 거래완료 규칙 없음 | 3번과 함께 결정 |
| 5 | **Enum 대소문자** | 대문자 `SELLING` — 4장, `api-definition.md`<br>소문자 `selling`, `graded` — 2장, 3장, 프론트 `data/listingForm.ts` | 프론트와 같은 소문자로 통일 |
| 6 | **커뮤니티 경로** | 5장: `/posts`, `/posts/:id`<br>6장: `/community/posts/:postId/comments`, `/community/comments/:id` | 댓글을 `/posts/:postId/comments`, `/comments/:id`로 맞추거나 둘 다 `/community/` 아래로 |
| 7 | **목록 응답 키** | `items` — 2, 3, 4, 6장<br>`posts` — 5장 | `items`로 통일 |
| 8 | **페이징 방식** | 페이지 번호(`page`, `totalCount`) — 2, 3, 4장<br>페이지 번호 + `hasNext` — 5장<br>커서(`cursor`, `nextCursor`, `hasNext`) — 6장 | 화면별로 정하되 응답 키 이름은 통일 |
| 9 | **검증 에러 코드** | `VALIDATION_ERROR` — 1, 3, 4, 5, 6장 (현재 구현)<br>`INVALID_PARAMETER` — 2장 | `VALIDATION_ERROR`로 통일 |
| 10 | **품목 ID 형식** | 숫자 `id` (+ `slug` 허용 검토) — 2장<br>slug 문자열 `"charizard-ex-sar"` — 5장 `posts.item_id` | 품목 테이블이 생기면 숫자 FK로 (5장 TODO에도 있음) |
| 11 | **API ID 체계** | `AUTH-xx` — 1장, `ITEM-xx` — 2장, `LISTING-xx` — 3장, `LIST-xx` — 4장, 없음 — 5·6장 | 도메인별 접두어로 통일 (예: `WISH-01`, `BOARD-01`, `COMMENT-01`) |
| 12 | **시간 예시 표기** | `+09:00` — 2, 3장<br>`Z` (UTC) — 1, 4, 5, 6장 (현재 구현은 UTC) | 응답은 UTC(`Z`)로 통일 |
| 13 | **`listings` 테이블 정의** | 4장은 찜 테스트용 최소 컬럼, 3장은 전체 컬럼 | 3장 기준으로 하나만 유지 |

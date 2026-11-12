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

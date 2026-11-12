# 명세 차이·미정 규칙 정리

> 비교 대상: `docs/requirements.md` ↔ `docs/api-spec-all.md`, DB 기준은 `db/schema.sql`
> `api-spec-all.md` 7장(통일이 필요한 항목)에 이미 있는 것(Base URL, 찜 API 중복, Enum 대소문자 등)은 제외했다.
> 인증/인가는 **JWT** 사용을 전제로 한다.

## 목차

- [1. 요구사항 ↔ API 명세 불일치](#1-요구사항--api-명세-불일치)
- [2. JWT 인증/인가 관련](#2-jwt-인증인가-관련)
- [3. DB 설계 미정 규칙](#3-db-설계-미정-규칙)
- [우선순위](#우선순위)

## 1. 요구사항 ↔ API 명세 불일치

| # | 영역 | requirements.md | api-spec-all.md | 결정할 것 |
|---|---|---|---|---|
| 1 | 토론글 제목 | `title` 선택 1~100자, `posts.title` 컬럼 있음 | `title` 선택 1~100자, `posts.title` 컬럼 있음 |  |
| 2 | 토론글 품목 | 품목 자동 지정·변경 불가 (REQ-BWRITE-001, BEDIT-001) | `itemId` 선택값, PATCH로 변경·`null` 가능 | 필수 + PATCH 금지로 맞추기 |
| 3 | 토론글 게시판·태그 | 요구사항에 없음 (품목 토론방만) | `board`(pokemon·sneakers·onepiece·watch·free) 필수, `tag` | 피드 게시판을 요구사항에 추가 or API에서 제거 |
| 4 | 토론글 사진 | 최대 4장 (REQ-BWRITE-002) | 필드 없음 (TODO: `post_images`) | 이미지 필드·테이블 추가 |
| 5 | 댓글 길이 | **최대 1000자** (REQ-BDETAIL-010) | **1~500자** | 하나로 통일 |
| 6 | 판매글 댓글 | 판매글 공개 댓글 (REQ-DETAIL-014) | 댓글은 `posts`에만 | 판매글 댓글 지원 여부 |
| 7 | 리액션·투표·댓글 좋아요 | 🔥😮😂🧊 1인 1개 (BOARD-008), 시세 전망 투표 하루 1회 (BOARD-004), 댓글 좋아요 (BDETAIL-009) | API 없음 (ITEM-03은 "board API에서 제공"이라고 했지만 해당 API 없음) | 명세 작성 필요 |
| 8 | 신고/차단 | BOARD-009, BDETAIL-014 | API 없음 | 명세 작성 필요 |
| 9 | 작성자 뱃지 | 토론글 카드에 뱃지 표시 (BOARD-007) | 댓글엔 `badges` 있음, 토론글 `author`엔 `{id, nickname}`만 | 토론글에도 추가, 뱃지 저장 방식 정의 |
| 10 | 판매글 인기순 | 찜 수 **+ 조회수** (REQ-LIST-007) | `popular` = 찜 수만 | 기준 통일 |
| 11 | 새상품/중고 필터 | 새상품/중고 필터 (LIST-006), 카드에 새상품 여부 (DETAIL-009, 010) | 새상품/중고 필드 없음, `condition`은 unopened/opened_raw/graded | `condition`과 매핑 규칙 정하기 |
| 12 | 카테고리별 필수 속성 | 세트명·카드번호 등 판매자가 입력 + 운동화·명품 속성 (POST-006~008) | 카드 속성은 `items`에서 가져옴, 운동화·명품 저장 위치 없음 (확인 필요 5번) | `attributes` 컬럼 or 카드만 범위로 확정 |
| 13 | 저가 경고 기준 | 관리자 운영 설정 (LIST-010, POST-013, COMMON-005) | ±30% 고정, 프론트 계산 | 운영 설정 테이블 or 고정값 확정 |
| 14 | 신규 가입자 등록 제한 | POST-018 | LISTING-03에 검증·에러 코드 없음 | 검증 규칙·에러 코드 추가 |
| 15 | 판매자 정보 | 닉네임, **프로필, 뱃지, 리뷰 수** (DETAIL-007) | `seller {id, nickname, soldCount}` | 필드 추가 or 범위 밖 명시 |
| 16 | 판매글 삭제 | 확인 모달 후 삭제 (MYPOST-006), 예외 없음 | **거래완료 판매글은 삭제 불가** (409) | 요구사항에 반영 |
| 17 | 아이디 찾기 | **이름 + 이메일**로 찾기 (LOGIN-004) | API 없음, `users`에 `name` 컬럼 없음, `email` 선택값 | 컬럼 추가·이메일 필수화 or 요구사항 변경 |
| 18 | 품목 등록 요청 | POST-005 | API 없음 | 명세 작성 필요 |
| 19 | 시세 산출 방식 | 미정 (COMMON-004) | ITEM-04에 30일 평균(+중앙값) 확정 | API 결정을 요구사항에 반영 |
| 20 | 이미지 업로드 | 형식·용량 미정 (COMMON-007) | UPLOAD-01 참조만 있고 명세 없음 | UPLOAD-01 명세 작성 |
| 21 | 욕설 필터·개인정보 노출 방지 | COMMON-006, 008 | 어느 API에도 서버 검증·에러 코드 없음 | 서버 필터링 여부 결정 |

## 2. JWT 인증/인가 관련

| # | 항목 | 현재 상태 | 정리할 것 |
|---|---|---|---|
| A1 | 토큰 전달 방식 | 1장은 `Authorization: Bearer` + Refresh 쿠키, 4~6장·`CLAUDE.md`·현재 `auth.js`는 `accessToken` 쿠키 | 1장 기준이면 4~6장 쿠키 문구·예시, `CLAUDE.md` 수정 |
| A2 | 선택 인증 (`optionalAuth`) | 5장: 만료 토큰이면 비로그인 처리 | Bearer + refresh 구조에선 만료 시 `isMine`이 틀어짐 → 선택 인증에서도 `401 TOKEN_EXPIRED`를 돌려 프론트가 재발급하게 하기 |
| A3 | 관리자 권한 | 요구사항에 관리자 기능 있음 (운영 기준 설정, 품목 등록 요청, 신고 처리) | `users`·JWT에 `role` 없음 → `role` 컬럼 or DB 조회 방식 결정 |
| A4 | 작성자 검증 | 판매글·토론글·댓글 모두 `403 FORBIDDEN` ✓ | "회원은 `sub`로만 식별" 규칙이 1장에만 있음 → 공통 규칙으로 올리기 |
| A5 | 탈퇴 회원 | 1장은 탈퇴 여부 검사 | 다른 장 미들웨어엔 없음 → `auth.js`에서 매 요청 DB 조회 여부 결정 (요청마다 쿼리 1회 비용) |
| A6 | Refresh 토큰과 소프트 삭제 | `refresh_tokens`는 `ON DELETE CASCADE` | `users`는 소프트 삭제라 CASCADE가 동작하지 않음 → 탈퇴 시 토큰 명시적 폐기 |

## 3. DB 설계 미정 규칙

범례: ✓ = 정해짐, **미정** = 결정 필요

| 테이블 | 필드/항목 | 필드 길이 | 중복 불가 | 삭제 정책 |
|---|---|---|---|---|
| 공통 | 문자셋·시간 | 이모지(리액션·본문)용 `utf8mb4` 여부, UTC 저장 여부 | — | — |
| `users` | `login_id` / `nickname` | ✓ 30 / ✓ 30 | ✓ unique. **미정**: 닉네임 대소문자·공백 규칙, 닉네임 변경 허용 여부 | ✓ 소프트 삭제, 탈퇴 후에도 재사용 불가. **미정**: 개인정보 익명화 시점, 탈퇴 회원의 판매글·글·댓글 처리(숨김 or "탈퇴한 회원" 표시) |
| `users` | `email` | 255 ✓ | unique지만 nullable. **미정**: 필수 여부 (아이디 찾기에 필요) | 위와 같음 |
| `users` | `name`, 프로필 이미지, `role`, 뱃지 | **컬럼 없음** | — | — |
| `refresh_tokens` | 전체 | ✓ | ✓ `token_hash` | **미정**: 만료·폐기된 행 정리 주기 |
| `categories` | `code`, `name`, `sort_order` | **미정** | `code` unique ✓ | **미정**: 품목이 참조 중이면 삭제 금지? |
| `items` | `slug`, `name`, `set_name`, `card_no`, `image_url` | **미정** | `slug` unique ✓. **미정**: 품목 자체의 중복 기준 (세트+카드번호+언어 등) | **미정**: 판매글·토론글이 참조하므로 하드 삭제는 위험 → 소프트 삭제 or 숨김 플래그 |
| `listings` | `title`, `direct_location`, `registration_no` | ✓ 100 / 100 / 30 | `registration_no` unique ✓. **미정**: 형식 (`RPC-` vs `P-010-`) | ✓ 소프트 삭제, 거래완료 삭제 불가. **미정**: 탈퇴 판매자의 판매글, `buyer_id` FK의 삭제 시 동작 |
| `listings` | `description` | 명세는 ≤1000자인데 TEXT | — | — |
| `listings` | `price` / `sold_price` | INT, ≤10억 ✓ / **상한 미정** | — | — |
| `listings` | Enum (`condition`, `status`, `grade`) | VARCHAR ✓ | **미정**: VARCHAR+CHECK vs ENUM | — |
| `listings` | 운동화·명품 속성, 책임 동의 기록 | **컬럼 없음** (JSON? 동의 시각?) | — | — |
| `listings` | `view_count` | — | **미정**: 중복 조회 방지 기준 (회원/IP/시간 단위) | — |
| `listing_images` | `url` | **미정** | **미정**: 판매글당 `auth` 1장, 판매글 안에서 `sort_order` 중복 불가 | 연결만 끊기 ✓. **미정**: 고아 업로드·파일 삭제 시점 |
| `listing_images` | 업로드한 사람 | 판매글보다 먼저 업로드 → `listing_id` nullable + 업로더 컬럼 필요 | `IMAGE_ALREADY_USED` → 이미지 1개는 판매글 1개에만 | — |
| `wishes` | 테이블 이름 / PK | — | 복합 PK (4장) vs `id` + UNIQUE (3장) | CASCADE ✓. 단 판매글이 소프트 삭제라 CASCADE 안 됨. **미정**: 삭제된 판매글의 찜 처리 |
| `posts` | `title` / `body` | 100 (요구사항과 충돌) / TEXT vs 500자 | — | ✓ 소프트 삭제. **미정**: 글의 댓글·리액션 숨김 or 유지 |
| `posts` | `item_id` | VARCHAR(100) → BIGINT FK로 변경. **미정**: 필수 여부 | — | — |
| `comments` | `body` | **500 vs 1000** | — | ✓ 소프트 삭제 (답글 있으면 남김). **미정**: 삭제된 글 아래 댓글 처리 |
| `comments` | 대상 | **미정**: 토론글만 or 판매글도 (다형 `target_type` vs 별도 테이블) | — | — |
| `post_images` | 없음 | `url` 길이 | 글당 ≤4장 (앱에서 검사) | **미정**: 글 삭제 시 함께 삭제 여부 |
| `post_reactions` | 없음 | 종류 enum | **UNIQUE (user_id, post_id)**, 1인 1개 | 취소 = 하드 삭제? `reaction_count` 동기화 |
| `comment_likes` | 없음 | — | UNIQUE (user_id, comment_id) | 위와 같음 |
| `item_votes` | 없음 | — | UNIQUE (user_id, item_id, 투표 날짜). **미정**: "하루" 기준이 KST인지 UTC인지 | — |
| `reports` / `blocks` | 없음 | 사유 enum, 길이 | **미정**: 같은 사용자가 같은 대상을 여러 번 신고 가능한지 | **미정**: 처리 상태, 보관 기간 |
| 운영 설정 | 없음 (저가 경고 기준, 신규 가입자 제한) | — | 키당 1행 | — |

## 우선순위

1. 댓글 길이(1-#5)와 토론글 제목·품목(1-#1, #2): 지금 브랜치(`feat/57-post-api`)에서 만드는 토론글 API에 바로 영향이 있다.
2. 토큰 전달 방식(2-A1): 모든 API에 영향이 있으므로 먼저 정한다.

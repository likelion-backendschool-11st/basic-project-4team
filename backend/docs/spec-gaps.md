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
| 2 | 토론글 품목 | 품목 자동 지정·변경 불가 (REQ-BWRITE-001, BEDIT-001) | 품목 자동 지정·변경 불가 (REQ-BWRITE-001, BEDIT-001 | |
| 3 | 토론글 게시판·태그 | `board`(pokemon·sneakers·onepiece·watch·free) 필수, `tag`  |`board`(pokemon·sneakers·onepiece·watch·free) 필수, `tag`|  |
| 4 | 토론글 사진 | 최대 4장 (REQ-BWRITE-002) | 최대 4장 (REQ-BWRITE-002) |  |
| 5 | 댓글 길이 | **1~500자** ) | **1~500자** |  |
| 6 | 판매글 댓글 | 댓글은 `posts`에만 | 댓글은 `posts`에만 |  |
| 7 | 리액션·투표·댓글 좋아요 | 🔥😮😂🧊 1인 1개 (BOARD-008), 시세 전망 투표 하루 1회 (BOARD-004), 댓글 좋아요 (BDETAIL-009) | 🔥😮😂🧊 1인 1개 (BOARD-008), 시세 전망 투표 하루 1회 (BOARD-004), 댓글 좋아요 (BDETAIL-009) |  |
| 8 | 신고/차단 | API 없음  | API 없음 |  |
| 9 | 작성자 뱃지 | | | 뱃지 없음 |
| 10 | 판매글 인기순 | 찜 수 **+ 조회수** (REQ-LIST-007) | 찜 수 **+ 조회수** (REQ-LIST-007) |  |
| 11 | 새상품/중고 필터 | 새상품/중고 필드 없음, `condition`은 unopened/opened_raw/graded  | 새상품/중고 필드 없음, `condition`은 unopened/opened_raw/graded |  |
| 12 | 카테고리별 필수 속성 | 세트명·카드번호 등 판매자가 입력 |  세트명·카드번호 등 판매자가 입력 | 카드만 |
| 13 | 저가 경고 기준 | ±30% 고정, 프론트 계산  | ±30% 고정, 프론트 계산 |  |
| 14 | 신규 가입자 등록 제한 | LISTING-03에 검증·에러 코드 없음 | LISTING-03에 검증·에러 코드 없음 |  |
| 15 | 판매자 정보 | `seller {id, nickname, soldCount}`  | `seller {id, nickname, soldCount}` |  |
| 16 | 판매글 삭제 | 확인 모달 후 삭제 (MYPOST-006), 예외 없음 | 확인 모달 후 삭제 (MYPOST-006), 예외 없음 | |
| 17 | 아이디 찾기 | API 없음, | API 없음 | 미구현예정 |
| 18 | 품목 등록 요청 | POST-005 | POST-005 | 화면 설계 필요 |
| 19 | 시세 산출 방식 | ITEM-04에 30일 평균(+중앙값) 확정 | ITEM-04에 30일 평균(+중앙값) 확정 | API 결정을 요구사항에 반영 |
| 20 | 이미지 업로드 | 형식·용량 미정 (COMMON-007) | 형식·용량 미정 (COMMON-007 | PEG·PNG·WebP 형식을 허용하고, 용량은 게시판 글이나 상품 이미지 기준 5MB~10MB|
| 21 | 욕설 필터·개인정보 노출 방지 | COMMON-006, 008 | COMMON-006, 008|  |

## 2. JWT 인증/인가 관련

| # | 항목 | 현재 상태 | 정리할 것 |
|---|---|---|---|
| A1 | 토큰 전달 방식 | 1장은 `Authorization: Bearer accessToken` | `Authorization: Bearer accessToken` |
| A2 | 선택 인증 (`optionalAuth`) | 헤더 없음 → 비로그인. 헤더 있는데 만료 → 401 TOKEN_EXPIRED, 위조·형식 오류 → 401 INVALID_TOKEN. 비로그인으로 넘기지 않음 → 프론트가 refresh 후 같은 요청 재시도 (isMine·isWished가 안 틀어짐) |
| A3 | 관리자 권한 | users.role 컬럼 추가 (USER/ADMIN, 기본 USER). accessToken payload에 role을 넣고 requireAdmin 미들웨어는 req.user.role만 검사(DB 조회 X). 권한 변경은 다음 refresh 때 DB에서 다시 읽어 반영 |
| A4 | 작성자 검증 | 0장 공통 규칙으로 올림: 회원은 토큰의 sub(userId)로만 식별하고, body·query의 userId는 믿지 않음. 남의 리소스 수정·삭제는 모든 API에서 403 FORBIDDEN |
| A5 | 탈퇴 회원 | auth.js는 토큰 검증만 하고 매 요청 DB 조회 안 함. ① 탈퇴 시 refresh 토큰 전부 폐기 ② POST /auth/refresh에서 users.deleted_at 확인 ③ 남은 access 수명(최대 30분)은 허용 |
| A6 | Refresh 토큰과 소프트 삭제 | CASCADE에 기대지 않음. 탈퇴 트랜잭션 안에서 deleted_at = NOW()와 함께 DELETE FROM refresh_tokens WHERE user_id = ?를 명시적으로 실행. CASCADE는 하드 삭제 대비용으로만 남김 |

## 3. DB 설계 규칙

범례: ✓ = 정해짐, **제안** = `db-policy.md` 제안(승인 필요), ~~취소선~~ = 1장 결정에 따라 뺌

| 테이블 | 필드/항목 | 필드 길이 | 중복 불가 | 삭제 정책 |
|---|---|---|---|---|
| 공통 | 문자셋·시간 | **제안**: 모든 테이블 `utf8mb4` / `utf8mb4_0900_ai_ci` (이모지 저장, 대소문자 구분 없는 비교). 시간은 `DATETIME`에 **UTC로 저장**(DB 연결 `timezone: 'Z'`), API는 `...Z` ISO 문자열로 응답, KST 변환은 프론트 | — | **제안**: 사용자가 만든 데이터는 소프트 삭제(`deleted_at`), 관계 테이블(찜·리액션·좋아요·차단)은 하드 삭제 |
| `users` | `login_id` / `nickname` | ✓ 30 / ✓ 30 | ✓ unique. **제안**: `login_id`는 소문자로 바꿔 저장. 닉네임은 앞뒤 공백 제거, 연속 공백·줄바꿈 불가, 2~30자. 대소문자만 다른 닉네임은 같은 것으로 취급(`_ci` 정렬 규칙으로 자동). 닉네임 변경은 허용하되 **30일에 1번** (`nickname_changed_at` 컬럼 추가) | ✓ 소프트 삭제, 탈퇴 후에도 재사용 불가. **제안**: 탈퇴 **즉시** `email`·`profile_image_url`을 NULL로, `password_hash`는 무작위 값으로 바꿔 익명화(`login_id`·`nickname`은 재사용 방지를 위해 DB에 남기되 화면에는 "탈퇴한 회원"). 같은 트랜잭션에서 refresh 토큰 삭제(A6). 탈퇴 회원의 판매중·예약중 판매글은 함께 소프트 삭제, 거래완료 판매글은 시세 데이터라 유지. 토론글·댓글은 유지하고 작성자를 "탈퇴한 회원"으로 표시. **예약중 판매글이 있으면 탈퇴 불가**(409) |
| `users` | `email` | 255 ✓ | unique지만 nullable. **제안**: 신규 가입 시 **필수**, 소문자로 바꿔 저장(아이디 찾기는 미구현이지만 비밀번호 찾기·나중 기능 대비). 탈퇴 시 NULL로 비우므로 컬럼 자체는 nullable 유지 | 위와 같음 |
| `users` | `name`, 프로필 이미지, `role`, 뱃지 | **제안**: `name`은 만들지 않음(개인정보 최소 수집, 화면에 쓰는 곳 없음). `profile_image_url` VARCHAR(500) NULL. `role` VARCHAR(20) NOT NULL DEFAULT `'user'` (`user` / `admin`). ~~뱃지 계산~~ → 뱃지 없음(1-#9) | — | — |
| `refresh_tokens` | 전체 | ✓ | ✓ `token_hash` | **제안**: 만료됐거나 폐기된 지 **7일 지난 행을 하루 1번 삭제**(탈취 재사용 감지를 위해 7일은 남김). 배치가 생기기 전까지는 로그인할 때 그 회원의 지난 행을 지움 |
| `categories` | `code`, `name`, `sort_order` | **제안**: `code` VARCHAR(30) (영문 소문자·숫자·`-`), `name` VARCHAR(50), `sort_order` INT NOT NULL DEFAULT 0 | `code` unique ✓ | **제안**: 삭제하지 않고 `is_active` TINYINT(1)로 숨김. 품목이 참조 중이면 FK `ON DELETE RESTRICT`로 DB가 삭제를 막음 |
| `items` | `slug`, `name`, `set_name`, `card_no`, `image_url` | **제안**: `slug` VARCHAR(150), `name` VARCHAR(100), `set_name` VARCHAR(100), `card_no` VARCHAR(30), `image_url` VARCHAR(500) | `slug` unique ✓. **제안**: 카드는 `(category_id, set_name, card_no, language)` UNIQUE. 운동화·명품은 이 값들이 NULL이라 UNIQUE가 걸리지 않으므로 `slug`로만 구분(운영자가 등록할 때 확인) | **제안**: 하드 삭제 금지(FK `RESTRICT`). `is_active`로 숨김 → 검색·등록 화면에서만 빠지고 기존 판매글·토론글·시세는 그대로 보임 |
| `listings` | `title`, `direct_location`, `registration_no` | ✓ 100 / 100 / 30 | `registration_no` unique ✓. **제안**: 형식 `RPC-{등록연도}-{id 6자리, 앞을 0으로 채움}` (예: `RPC-2026-000123`). `P-010` 등은 화면 ID라 등록번호로 쓰지 않음. INSERT 후 받은 id로 같은 트랜잭션에서 UPDATE | ✓ 소프트 삭제, ✓ 거래완료 삭제 불가(1-#16, C1). **제안**: 탈퇴 판매자의 판매글은 위 `users` 정책을 따름. `buyer_id` FK는 `ON DELETE SET NULL`(회원은 소프트 삭제라 실제로는 거의 일어나지 않음) |
| `listings` | `description` | **제안**: TEXT → `VARCHAR(1000) NOT NULL DEFAULT ''` (명세 ≤1000자를 DB에서도 막음) | — | — |
| `listings` | `price` / `sold_price` | INT, ≤10억 ✓ / **제안**: `sold_price`도 `INT UNSIGNED`, 1원 이상 10억 이하 (판매가와 같은 규칙) | — | — |
| `listings` | Enum (`condition`, `status`, `grade`) | VARCHAR ✓ | **제안**: **VARCHAR + CHECK** (`CHECK (status IN ('selling','reserved','sold'))`). 값을 추가할 때 ENUM보다 변경이 쉽고, MySQL 8.0.16부터 CHECK가 실제로 동작함. 값은 프론트와 같은 소문자 | — |
| `listings` | 운동화·명품 속성, 책임 동의 기록 | **제안**: `attributes JSON NULL` (예: `{"size": "270", "styleCode": "DZ5485-612"}`), 선택 입력(1-#12: 필수 속성은 카드만), 허용 키는 앱에서 검사. 동의는 `agreed_at DATETIME NOT NULL` (등록 시각과 따로 남겨 분쟁 시 근거로 씀) | — | — |
| `listings` | `view_count` | — | **제안**: 같은 판매글을 **같은 사람이 24시간 안에 다시 보면 안 셈**. 회원은 `user_id`, 비회원은 IP 기준. 작성자 본인 조회 제외. `listing_views (listing_id, viewer_key, viewed_on)` UNIQUE에 `INSERT IGNORE` → 새로 들어갔을 때만 `view_count + 1` | — |
| `listing_images` | `url` | **제안**: VARCHAR(500) | **제안**: `(listing_id, type, sort_order)` UNIQUE. 사진은 `type='photo'`, `sort_order` 0~9. 인증 사진은 `type='auth'`, `sort_order`를 항상 0으로 저장 → **판매글당 인증 사진 1장이 DB에서 보장됨** | 연결만 끊기 ✓. **제안**: `listing_id`가 NULL인 채로 **24시간 지난 이미지는 하루 1번 파일과 행을 함께 삭제**(업로드만 하고 등록 안 한 것, 수정으로 빠진 것 모두 포함) |
| `listing_images` | 업로드한 사람 | **제안**: `listing_id` nullable + `uploader_id BIGINT NOT NULL` FK → users | `IMAGE_ALREADY_USED` → 이미지 1개는 판매글 1개에만. **제안**: 연결할 때 `uploader_id = 나`이고 `listing_id IS NULL`인 행만 허용 | — |
| `listing_wishes` | 테이블 이름 / PK | — | **제안**: 이름 **`listing_wishes`**, **복합 PK `(user_id, listing_id)`** + `created_at`. 다른 테이블이 찜을 참조할 일이 없어 `id`가 필요 없음 | CASCADE ✓. **제안**: 소프트 삭제된 판매글의 찜 행은 **남겨 둠**(판매글 복구 대비). 찜 목록·찜 수 쿼리에서 `deleted_at IS NULL`로 빼고, 판매글을 하드 삭제하는 정리 작업 때 CASCADE로 함께 삭제 |
| `posts` | `title` / `body` | ✓ `title` VARCHAR(100) NULL (1-#1). **제안**: `body` VARCHAR(500) (현재 구현·명세 기준) | — | ✓ 소프트 삭제. **제안**: 글을 지워도 댓글·리액션 행은 **유지**. 글 조회가 404가 되므로 화면에서는 자동으로 안 보이고, 글을 복구하면 그대로 돌아옴 |
| `posts` | `item_id` | VARCHAR(100) → BIGINT FK로 변경. **제안**: **NULL 허용**(자유게시판 글은 품목이 없음). 품목 토론방에서 쓴 글만 앱에서 필수로 검사. FK `ON DELETE RESTRICT` | — | — |
| `comments` | `body` | ✓ **500** (1-#5) | — | ✓ 소프트 삭제 (답글 있으면 남김). **제안**: 글이 삭제되면 댓글은 **유지**(글과 함께 안 보이고, 글 복구 시 함께 복원) |
| `comments` | 대상 | ✓ **토론글(`posts`)만** (1-#6). `post_id` FK로 단순하게 둠. 나중에 판매글 댓글이 필요하면 다형(`target_type`) 대신 `listing_comments` 테이블을 따로 만듦(FK를 걸 수 있음) | — | — |
| `post_images` | 없음 | **제안**: `url` VARCHAR(500), `uploader_id`, `post_id` NULL 허용 (`listing_images`와 같은 업로드 방식) | 글당 ≤4장 (앱에서 검사). **제안**: `(post_id, sort_order)` UNIQUE | **제안**: 글 소프트 삭제 시 이미지 행은 유지. 글이 하드 삭제되면 `post_id`를 NULL로 → 위 24시간 정리 작업에서 파일과 함께 삭제 |
| `post_reactions` | 없음 | **제안**: `type` VARCHAR(20) + CHECK (`fire`, `surprised`, `laugh`, `ice`) | **UNIQUE (user_id, post_id)**, 1인 1개. **제안**: 다른 리액션을 누르면 `type`만 UPDATE (카운트 변화 없음) | **제안**: 취소 = **하드 삭제**. `INSERT`/`DELETE`와 `posts.reaction_count ± 1`을 **한 트랜잭션**에서 처리. 숫자가 어긋날 때를 대비해 운영자용 재계산 쿼리를 준비 |
| `comment_likes` | 없음 | — | UNIQUE (user_id, comment_id) | **제안**: 위와 같음 (`comments.like_count ± 1`을 같은 트랜잭션에서) |
| `item_votes` | 없음 | — | UNIQUE (user_id, item_id, 투표 날짜). **제안**: "하루" 기준은 **KST**(사용자가 느끼는 하루). 서버가 KST 날짜를 계산해 `vote_date DATE`에 저장 | — |
| `reports` / `blocks` | 없음 (API 없음, 1-#8 — 만들 때 적용) | **제안**: `reports.reason` VARCHAR(20) + CHECK (`fraud` 사기, `spam` 도배·광고, `abuse` 욕설·비방, `inappropriate` 부적절, `etc` 기타), `detail` VARCHAR(500) NULL(`etc`면 필수). 대상은 `target_type`(`listing`/`post`/`comment`/`user`) + `target_id` | **제안**: 같은 사람이 같은 대상을 **한 번만** 신고 → UNIQUE `(reporter_id, target_type, target_id)`. 차단은 UNIQUE `(blocker_id, blocked_id)`, 자기 자신 차단 불가 | **제안**: 신고 `status` VARCHAR(20) (`pending` 접수 → `resolved` 조치 / `rejected` 기각), `handled_at`, `handled_by`. 처리 완료 후 **1년 보관 뒤 삭제**. 차단 해제 = 하드 삭제 |
| 운영 설정 | 보류 | 1-#13(저가 경고는 프론트 고정값), 1-#14(신규 가입자 제한 없음)로 지금 쓸 곳이 없음. 필요해지면 `settings` 테이블(`setting_key` VARCHAR(50) PK, `setting_value` VARCHAR(255), `description` VARCHAR(255), `updated_at`)로 추가 | 키당 1행 | 삭제하지 않고 값만 수정 |

## 우선순위

1. 댓글 길이(1-#5)와 토론글 제목·품목(1-#1, #2): 지금 브랜치(`feat/57-post-api`)에서 만드는 토론글 API에 바로 영향이 있다.
2. 토큰 전달 방식(2-A1): 모든 API에 영향이 있으므로 먼저 정한다.

# RE:PICK API 정의서

> 프론트엔드(`frontend/`) 화면과 목업 데이터(`src/data/*`), 상호작용 훅(`src/hooks/*`)을 기준으로 도출한 API 목록입니다.
> 요청/응답 필드 상세는 이후 **API 명세서**에서 다룹니다.

## 0. 공통 규칙 (초안)

| 항목 | 내용 |
|---|---|
| Base URL | `/api/v1` |
| 포맷 | JSON (`Content-Type: application/json`), 이미지 업로드만 `multipart/form-data` |
| 인증 | `Authorization: Bearer {accessToken}` — 표의 **인증** 열: `필수` / `선택`(로그인 시 개인화 필드 포함, 예: 찜 여부) / `-`(불필요) |
| 페이지네이션 | 번호형: `page`(1부터), `size` → `{ items, page, size, totalCount }` / 무한스크롤형: `cursor`, `size` → `{ items, nextCursor, hasNext }` |
| 금액 | 정수(원 단위). 표시용 문자열(`'300,000원'`)은 프론트에서 포맷 |
| 시간 | ISO-8601 문자열. `9일 전` 같은 상대시간은 프론트에서 계산 |
| 응답 래퍼 | 성공: `{ "data": ... }` / 실패: `{ "error": { "code": "LISTING_NOT_FOUND", "message": "..." } }` |
| 상태 코드 | 200 조회·수정, 201 생성, 204 삭제, 400 검증 실패, 401 미인증, 403 권한 없음, 404 없음, 409 중복(예: 24시간 내 재투표) |

### 공통 Enum

| 이름 | 값 | 출처 |
|---|---|---|
| `ListingStatus` | `SELLING`(판매중), `RESERVED`(예약중), `SOLD`(거래완료) | `data/listing.ts`, `data/search.ts` |
| `ItemCondition` | `UNOPENED`(미개봉), `OPENED_RAW`(개봉/노그레이딩), `GRADED`(그레이딩) | `data/listingForm.ts` |
| `TradeMethod` | `DELIVERY`(택배), `DIRECT`(직거래) | `data/search.ts` |
| `SocialProvider` | `kakao`, `naver`, `google` | `data/auth.ts` |
| `ListingSort` | `latest`, `priceAsc`, `priceDesc`, `popular` | `data/search.ts` |
| `MarketPriceSort` | `volume`, `priceDesc`, `priceAsc`, `rising`, `falling` | `data/market.ts` |
| `DiscussionSort` | `popular`, `latest` | `data/community.ts` |
| `Sentiment` | `UP`(오른다), `DOWN`(내린다) | `data/community.ts` |

---

## 1. 인증 / 회원 (Auth)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| AUTH-01 | 아이디/비밀번호 로그인 | POST | `/auth/login` | 로그인 | - | `loginId`, `password` → access/refresh 토큰, 사용자 요약. "아이디 저장"은 프론트 localStorage |
| AUTH-02 | 소셜 로그인 시작 | GET | `/auth/oauth/{provider}` | 로그인 | - | provider 인가 페이지로 302 리다이렉트 |
| AUTH-03 | 소셜 로그인 콜백 | GET | `/auth/oauth/{provider}/callback` | 로그인 | - | 인가 코드 → 토큰 발급 후 프론트로 리다이렉트 |
| AUTH-04 | 토큰 재발급 | POST | `/auth/refresh` | 공통 | - | refresh 토큰 → 새 access 토큰 |
| AUTH-05 | 로그아웃 | POST | `/auth/logout` | 공통(마이) | 필수 | refresh 토큰 무효화 |
| AUTH-06 | 내 정보 조회 | GET | `/users/me` | 공통 헤더 | 필수 | 닉네임, 이니셜/아바타, 판매자 등급 |
| AUTH-07 | 회원가입 | POST | `/users` | (화면 미구현 `/signup`) | - | 링크만 존재 — 화면 구현 시 확정 |
| AUTH-08 | 아이디 찾기 / 비밀번호 재설정 | POST | `/auth/find-id`, `/auth/password-reset` | (화면 미구현) | - | 링크만 존재 — 화면 구현 시 확정 |

## 2. 공통 레이아웃 (Header / Nav)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| COMMON-01 | 헤더 배지 카운트 | GET | `/users/me/summary` | 헤더, 네비 | 필수 | 안 읽은 채팅 수, 알림 수, 찜 개수 (`headerData.chatCount`, `alertCount`, `navItems` 찜 badge) |
| COMMON-02 | 공지 바 | GET | `/notices/latest` | NoticeBar | - | 상단 공지 1건. 정적 운영이면 생략 가능 |
| COMMON-03 | LIVE 급상승 1위 티커 | GET | `/market/ticker` | 헤더 | - | 품목명, 상승률 (`liveTicker`) |
| COMMON-04 | 카테고리 트리 | GET | `/categories` | 홈 카테고리 패널, 검색 필터, 매물 등록 | - | 대분류 > 소분류. 카테고리별 사용 가능 필터(등급/사이즈) 여부 포함 |

## 3. 홈 (`/`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| HOME-01 | 실시간 급상승·거래량 랭킹 | GET | `/market/rankings` | 홈 MarketRankingSection | - | `category`=`all`/`pokemon`/`sneakers`/`watches`, `limit`. 품목명, 카테고리, 등락률, 최근 체결가 |
| (재사용) | 카테고리 탐색 패널 | GET | `/categories` | 홈 CategoryExplorerPanel | - | COMMON-04 |

## 4. 검색 / 매물 목록 (`/search`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| LIST-01 | 매물 검색·목록 | GET | `/listings` | 검색 결과 | 선택 | `q`, `category`, `grades[]`, `sizes[]`, `minPrice`, `maxPrice`, `conditions[]`(new/used), `tradeMethods[]`, `status`, `sort`, `page`, `size`(기본 10). 항목별 시세 대비 차이(`priceDiff`), 찜 여부, 찜 수 포함 |
| LIST-02 | 찜하기 | POST | `/listings/{listingId}/wishes` | 검색 결과, 매물 상세 | 필수 | 이미 찜했으면 멱등 처리 |
| LIST-03 | 찜 해제 | DELETE | `/listings/{listingId}/wishes` | 검색 결과, 매물 상세 | 필수 | |
| LIST-04 | 내 찜 목록 | GET | `/users/me/wishes` | (화면 미구현 `/wishlist`) | 필수 | 네비 링크만 존재 |

## 5. 매물 상세 — 구매자 (`/listings/:id`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| DETAIL-01 | 매물 상세 조회 | GET | `/listings/{listingId}` | 매물 상세, 내 매물 상세 | 선택 | 갤러리(실물인증 사진 구분), 제목, 가격, 30일 평균 체결가·차이율, 거래방식·직거래 지역, 상태, 카테고리 스펙, 설명, 조회수, 찜 수, 토론 수, 판매자 요약(거래 횟수·평점), `isOwner`, `isWished`. 조회 시 조회수 +1 |
| DETAIL-02 | 같은 품목의 다른 매물 | GET | `/listings/{listingId}/related` | 매물 상세, 내 매물 상세 | - | 동일 catalog 품목, 기본 낮은 가격순, `limit` |
| DETAIL-03 | 판매자의 다른 상품 | GET | `/users/{userId}/listings` | 매물 상세 SellerProfileCard | - | `status=SELLING`, `limit=3`, 총 개수 포함 |
| DETAIL-04 | 판매자 프로필 | GET | `/users/{userId}` | (화면 미구현 `/users/:id`) | - | 프로필 링크만 존재 |

## 6. 채팅 (매물 상세 ChatDrawer, 헤더 채팅)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| CHAT-01 | 채팅방 생성/조회 | POST | `/chat/rooms` | 매물 상세 "1:1 채팅하기" | 필수 | `listingId` → 기존 방 있으면 반환. 매물 요약, 판매자 온라인 여부·평균 응답시간 포함 |
| CHAT-02 | 내 채팅방 목록 | GET | `/chat/rooms` | 헤더 채팅 | 필수 | 안 읽은 수 포함 |
| CHAT-03 | 메시지 목록 | GET | `/chat/rooms/{roomId}/messages` | ChatDrawer | 필수 | cursor 기반(과거 방향) |
| CHAT-04 | 메시지 전송 | POST | `/chat/rooms/{roomId}/messages` | ChatDrawer | 필수 | `type`=`TEXT`/`IMAGE`, 이미지는 UPLOAD-01 URL 사용. 전화번호·외부 메신저 유도 문구 서버 필터링 |
| CHAT-05 | 실시간 수신 | WS | `/ws/chat` | ChatDrawer | 필수 | WebSocket(STOMP 등) 구독 — 방식 확정 필요 |

## 7. 내 매물 관리 — 판매자 (`/my/listings/:id`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| (재사용) | 매물 상세 조회 | GET | `/listings/{listingId}` | 내 매물 상세 | 필수 | DETAIL-01. 소유자일 때 검수 보증표(inspection) 등 판매자 전용 필드 추가 |
| MY-01 | 판매 상태 변경 | PATCH | `/listings/{listingId}/status` | StatusDropdown | 필수(소유자) | `SELLING` ↔ `RESERVED`. `SOLD`는 MY-03 사용 |
| MY-02 | 구매자 후보 목록 | GET | `/listings/{listingId}/buyer-candidates` | DealCompleteModal | 필수(소유자) | 이 매물로 채팅한 사용자 목록 |
| MY-03 | 거래완료 처리 | POST | `/listings/{listingId}/complete` | DealCompleteModal | 필수(소유자) | `finalPrice`, `buyerId`, `requestReview` → 상태 `SOLD`, 시세 데이터에 체결가 반영 |
| MY-04 | 매물 삭제 | DELETE | `/listings/{listingId}` | DeleteConfirmModal | 필수(소유자) | 소프트 삭제 권장 |

## 8. 매물 등록 / 수정 (`/sell`, `/my/listings/:id/edit`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| FORM-01 | 등록 폼 옵션 조회 | GET | `/listing-options` | 매물 등록·수정 | - | `category` 기준 언어·레어도·그레이딩사·등급·상태 옵션 (`languageOptions`, `rarityOptions`, `gradingServiceOptions`, `gradeOptions`, `conditionOptions`) |
| FORM-02 | 카탈로그 품목 검색 | GET | `/catalog/items` | 매물 등록 (catalogQuery) | - | `q`, `category` → 일치 품목(세트명·카드번호 자동 채움) |
| FORM-03 | 품목 시세 기준가 조회 | GET | `/catalog/items/{itemId}/market-price` | 매물 등록 가격 피드백 | - | `grade`, `condition` → 30일 평균 체결가. 프론트가 ±30%(`FRAUD_THRESHOLD_RATIO`) 경고 표시 |
| UPLOAD-01 | 이미지 업로드 | POST | `/uploads/images` | 매물 사진, 실물인증 사진, 채팅, 커뮤니티 | 필수 | multipart. → `{ imageId, url }`. 매물 사진 최대 10장 |
| FORM-04 | 매물 등록 | POST | `/listings` | 매물 등록 | 필수 | 사진 ID 목록(첫 장=대표), 실물인증 사진 ID, 카테고리, catalog 품목 ID, 속성, 제목, 가격, 설명(≤1000자), 택배/직거래 여부, 직거래 지역, 약관 동의 → 생성된 `listingId` |
| FORM-05 | 수정용 매물 조회 | GET | `/listings/{listingId}/edit` | 매물 수정 | 필수(소유자) | 등록번호, 원래 가격, 찜 수, 폼 값. DETAIL-01 응답으로 대체 가능하면 생략 |
| FORM-06 | 매물 수정 | PATCH | `/listings/{listingId}` | 매물 수정 | 필수(소유자) | 카테고리는 수정 불가(`lockedCategoryCopy`). 가격 인하 시 찜한 사용자 알림 고려 |

## 9. 시세 대시보드 (`/market`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| MARKET-01 | 시세 필터 메타 | GET | `/market/filters` | 시세 대시보드 헤더 | - | `category`(pokemon/onepiece) → 카테고리 탭, 등급 필터별 건수, 세부 옵션별 건수, 기준일 |
| MARKET-02 | 어제 시장 인사이트 | GET | `/market/insights` | InsightSection | - | `category`, `grade` → 가격 상승/상승 전환/거래량 대비 저렴 품목 수와 변동률 |
| MARKET-03 | 30일 시세·거래량 차트 | GET | `/market/chart` | ChartSection | - | `category`, `grade`, `period=30d` → 요약(중앙값, 1/7/30일 변동, 총 거래량) + 일별 `{date, price, volume}` |
| MARKET-04 | 전일 상승 Top N | GET | `/market/top-gainers` | TopGainers | - | `category`, `grade`, `limit=5` → 순위, 가격, 변동률, 거래량, 스파크라인용 최근 가격 배열 |
| MARKET-05 | 품목별 시세 목록 | GET | `/market/prices` | PriceGrid | - | `category`, `grade`, `subOption`, `q`, `sort`(MarketPriceSort), `page`, `size`(기본 9) → 품목별 중앙값, 1/7/30일 변동, 30일 거래량, 스파크라인 데이터 |

> 스파크라인은 현재 SVG path 문자열로 하드코딩되어 있음 → API는 **숫자 배열**을 주고 프론트에서 path 생성 권장.

## 10. 커뮤니티 피드 (`/community`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| COMM-01 | 피드 목록 | GET | `/community/posts` | 커뮤니티 피드 | 선택 | `category`(all/pokemon/onepiece/sneakers/watch), `cursor`, `size` — 무한스크롤. 작성자·배지, 게시판, 투표, 이미지, 리액션 수·내 리액션, 댓글 수, 북마크 여부 |
| COMM-02 | 피드 글 작성 | POST | `/community/posts` | FeedComposer | 필수 | `board`, `tag`, `body`, `imageIds[]`, `itemId?`(시세 태그), `poll?`(`options[]`, `deadline`) |
| COMM-03 | 투표 참여 | POST | `/community/posts/{postId}/poll/votes` | FeedPoll | 필수 | `optionKey` → 갱신된 득표 수. 1인 1표 |
| COMM-04 | 리액션 추가 | PUT | `/community/posts/{postId}/reactions/{reactionKey}` | ReactionBar | 필수 | `fire`, `surprised`, `laugh`, `ice` 등 |
| COMM-05 | 리액션 취소 | DELETE | `/community/posts/{postId}/reactions/{reactionKey}` | ReactionBar | 필수 | |
| COMM-06 | 북마크 | PUT | `/community/posts/{postId}/bookmark` | BookmarkButton | 필수 | |
| COMM-07 | 북마크 해제 | DELETE | `/community/posts/{postId}/bookmark` | BookmarkButton | 필수 | |
| COMM-08 | 게시글 신고 | POST | `/community/posts/{postId}/reports` | PostMoreMenu | 필수 | `reason` |
| COMM-09 | 인기 토론 품목 | GET | `/community/trending-items` | TrendingItemsSidebar | - | `period=24h`, `limit=5` → 순위, 품목명, 등급·가격·변동률, 토론 수 |

> 댓글: 화면에는 댓글 **수**만 표시되고 댓글 UI는 아직 없음 → 댓글 API(`GET/POST /community/posts/{postId}/comments`)는 화면 구현 시 추가.

## 11. 품목 토론방 (`/community/items/:id`)

| ID | 기능 | Method | URI | 화면 | 인증 | 비고 |
|---|---|---|---|---|---|---|
| DISC-01 | 토론 품목 정보 | GET | `/community/items/{itemId}` | ItemDiscussionHeader | 선택 | 품목명, 등급, 인증번호, 이미지, 현재 시세·변동, 판매중 매물 수, 감성 투표 집계(up/down), 내 투표 여부, 총 토론 수 |
| DISC-02 | 오른다/내린다 투표 | POST | `/community/items/{itemId}/sentiments` | SentimentPoll | 필수 | `direction`=`UP`/`DOWN`. 품목당 24시간 1회 → 위반 시 409 |
| DISC-03 | 품목 토론 글 목록 | GET | `/community/items/{itemId}/posts` | 토론 목록 | 선택 | `sort`=`popular`/`latest`, `verifiedOnly`(보유자 글만), `cursor`, `size`. 작성자 배지(보유자/거래 인증) 포함 |
| DISC-04 | 품목 토론 글 작성 | POST | `/community/items/{itemId}/posts` | DiscussionComposer | 필수 | `body`(≤500자), `imageIds[]`(≤4), `priceTag?`(희망 체결가) |
| (재사용) | 리액션·북마크·신고 | | COMM-04 ~ COMM-08 | 토론 글 카드 | 필수 | 토론 글도 같은 `posts` 리소스로 관리 |

---

## 부록 A. 화면 ↔ API 매핑

| 화면 (라우트) | 사용 API |
|---|---|
| 로그인 `/login` | AUTH-01 ~ 04 |
| 공통 헤더/레이아웃 | AUTH-06, COMMON-01 ~ 04, CHAT-02 |
| 홈 `/` | COMMON-04, HOME-01 |
| 검색 `/search` | COMMON-04, LIST-01 ~ 03 |
| 매물 상세 `/listings/:id` | DETAIL-01 ~ 03, LIST-02 ~ 03, CHAT-01, 03 ~ 05 |
| 내 매물 상세 `/my/listings/:id` | DETAIL-01 ~ 02, MY-01 ~ 04 |
| 매물 등록 `/sell` | COMMON-04, FORM-01 ~ 04, UPLOAD-01 |
| 매물 수정 `/my/listings/:id/edit` | FORM-01, FORM-03, FORM-05 ~ 06, UPLOAD-01, MY-04 |
| 시세 대시보드 `/market` | MARKET-01 ~ 05 |
| 커뮤니티 피드 `/community` | COMM-01 ~ 09, UPLOAD-01 |
| 품목 토론방 `/community/items/:id` | DISC-01 ~ 04, COMM-04 ~ 09, UPLOAD-01 |

## 부록 B. 팀 결정이 필요한 항목

1. **매물 상세 엔드포인트 분리 여부** — 구매자/판매자 화면을 `GET /listings/{id}` 하나로 쓰고 `isOwner`로 분기할지, `/my/listings/{id}`를 따로 둘지.
2. **채팅 실시간 방식** — WebSocket(STOMP) / SSE / 폴링 중 선택.
3. **시세 데이터 산출** — 거래완료(MY-03)의 `finalPrice`만 반영할지, 외부 시세도 섞을지. 중앙값/평균 기준 통일 필요(화면에 둘 다 등장).
4. **이미지 업로드 방식** — 서버 경유 multipart vs. Presigned URL 직접 업로드.
5. **ID 형식** — 목업은 `P-010-882194`, `charizard-ex-sar-sv2a-201` 같은 문자열 ID 사용. 숫자 PK + 표시용 등록번호로 나눌지.
6. **미구현 화면** (회원가입, 아이디/비번 찾기, 찜 목록, 판매자 프로필, 알림, 댓글) API를 이번 범위에 넣을지.

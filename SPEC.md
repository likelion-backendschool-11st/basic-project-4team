# SPEC: erd.md 기준 db/schema.sql 작성

> 승인: `python scripts/verify.py approve` (사람만) · 종료: `python scripts/verify.py close` (사람만)
> 승인 후 이 파일, tests/, scripts/verify.py는 잠긴다. 바꾸려면 다시 승인한다.

## 목표 결과물
`backend/docs/erd.md`(3장 확인 완료본)를 기준으로 `backend/db/schema.sql`을 다시 작성한다.
입력: 빈 MySQL 8 DB → `npm run db:init` 실행 → 출력: 테이블 14개(utf8mb4, 외래키, 인덱스, CHECK 포함).
사용자: 4팀 백엔드 개발자(로컬 DB 생성), 이후 API 구현.

**erd.md와 다르게 가는 부분 (사용자 결정, 2026-11-13)**
- 찜 테이블 이름은 3장 #6 결정대로 `wishes` (2장 본문의 `listing_wishes` 아님). 컬럼·인덱스는 2.7과 같다.
- `posts.item_id`는 이번에는 `VARCHAR(100) NULL`로 두고 외래키를 걸지 않는다. 지금 토론글 API와 `db-seed.js`가 slug 문자열을 쓰기 때문. 품목 API를 만들 때 BIGINT FK로 바꾼다.

## 범위 밖
- API·서비스 코드 수정 (토론글 API, 인증 API 포함)
- `posts.item_id`의 BIGINT FK 변경
- `reports`, `blocks`, `settings` 테이블
- 이미 만들어진 로컬 DB의 마이그레이션(ALTER). `IF NOT EXISTS`라서 기존 테이블은 바뀌지 않는다 → DB를 지우고 다시 만들어야 한다
- 새 테이블용 시드 데이터

## 합격 기준 (자동 검사)
각 줄 끝 백틱 안의 "cmd:" 뒤 명령을 verify.py가 실행한다. 모두 종료 코드 0이면 통과.
검사는 로컬 MySQL(`backend/.env` 접속 정보)에 테스트 전용 DB `repick_schema_test`를 새로 만들어 진행한다.

- [ ] 빈 DB에 `db-init.js`를 두 번 실행해도 모두 성공하고, 테이블 14개가 정확히 생기며, 기존 `db-seed.js`가 성공한다 `cmd: node --test tests/schema_apply.test.js`
- [ ] 모든 테이블이 InnoDB · `utf8mb4` · `utf8mb4_0900_ai_ci`이고, 이모지(🔥😮😂🧊)를 넣으면 그대로 읽힌다 `cmd: node --test tests/schema_charset.test.js`
- [ ] erd.md의 외래키 24개(25개 중 `posts.item_id` 제외)가 참조 테이블·삭제 규칙(CASCADE / SET NULL / RESTRICT)까지 일치하고, 없는 행 참조·참조 중인 행 삭제는 거부되며, CASCADE·SET NULL이 실제로 동작한다 `cmd: node --test tests/schema_fk.test.js`
- [ ] erd.md의 인덱스(UNIQUE·일반·FULLTEXT·복합 PK)가 이름·컬럼 순서·종류까지 일치한다 `cmd: node --test tests/schema_index.test.js`
- [ ] 정상 데이터(회원→카테고리→품목→판매글→사진→찜→토론글→댓글→리액션→투표)는 들어가고, 잘못된 값(Enum 오타, 등급 조합 오류, 거래 방식 0개, 가격 0, 인증 사진 2장, 사진 순서 범위 초과, 중복 리액션·투표·아이디)은 DB가 거부한다 `cmd: node --test tests/schema_constraints.test.js`

## 사람 확인 (자동 검사 불가)
- [ ] `schema.sql`의 컬럼 타입·NULL 여부·주석이 erd.md 2장 표와 맞는지 눈으로 검토
- [ ] 팀원에게 "기존 로컬 DB를 지우고 `npm run db:init` 다시 실행" 안내가 필요한지 결정

## 검증자 · 멈춤 조건
- 검증 순서: verify.py → reviewer 에이전트 1회 → 사람 확인
- verify 연속 5회 실패 시 자동 수정 중단, 원인 보고
- 기준이 틀렸다고 판단되면 `.harness/escalate.md`에 이유를 쓰고 멈춘다

## 추가 보호 파일 (선택)
<!-- 예: - `protect: fixtures/**/*` -->

-- RE:PICK DB 스키마 (MySQL 8.0.16 이상 — CHECK 제약이 실제로 동작하는 버전)
-- 설계 문서: docs/erd.md
-- 실행: npm run db:init
--   DB 생성(CREATE DATABASE)과 선택(USE)은 scripts/db-init.js가 .env의 DB_NAME으로 처리한다.
--   여러 번 실행해도 안전하도록 모든 문장은 IF NOT EXISTS로 작성한다.
--   주의: 이미 있는 테이블은 바뀌지 않는다. 컬럼이 바뀌었으면 로컬 DB를 지우고 다시 실행한다.
--
-- 공통 규칙
--   - 문자셋 utf8mb4 / utf8mb4_0900_ai_ci (이모지 저장, 대소문자 구분 없는 비교)
--   - 시간은 UTC로 저장 (db-common.js가 연결마다 time_zone = '+00:00')
--   - Enum은 VARCHAR + CHECK, 소문자 값
--   - 사용자가 만든 데이터는 소프트 삭제(deleted_at), 관계 테이블(찜·리액션·좋아요)은 하드 삭제
--   - condition은 MySQL 예약어라 쿼리에서 백틱(`condition`)으로 감싼다
--   - 테이블은 외래키가 참조하는 순서대로 만든다

-- ─────────────────────────────────────────────
-- 회원
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                  BIGINT       NOT NULL AUTO_INCREMENT,
  login_id            VARCHAR(30)  NOT NULL COMMENT '로그인 아이디 (소문자로 바꿔 저장)',
  password_hash       VARCHAR(255) NOT NULL COMMENT 'bcrypt 해시. 탈퇴 시 무작위 값으로 덮어씀',
  nickname            VARCHAR(30)  NOT NULL COMMENT '화면 표시 이름 (2~30자)',
  nickname_changed_at DATETIME     NULL     COMMENT '닉네임 변경 시각 (30일에 1번)',
  email               VARCHAR(255) NULL     COMMENT '가입 시 필수(앱 검사). 탈퇴 시 NULL',
  profile_image_url   VARCHAR(500) NULL,
  role                VARCHAR(20)  NOT NULL DEFAULT 'user' COMMENT 'user | admin',
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME     NULL     COMMENT '소프트 삭제(탈퇴) 시각',
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_login_id (login_id),
  UNIQUE KEY uk_users_nickname (nickname),
  UNIQUE KEY uk_users_email (email),
  CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '회원';

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         BIGINT   NOT NULL AUTO_INCREMENT,
  user_id    BIGINT   NOT NULL,
  token_hash CHAR(64) NOT NULL COMMENT 'Refresh Token의 SHA-256 해시 (원문은 저장하지 않음)',
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL     COMMENT '로그아웃·재발급으로 폐기된 시각',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_expires (expires_at),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '발급한 Refresh Token (기기마다 1행)';

-- ─────────────────────────────────────────────
-- 카테고리·품목
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  parent_id  BIGINT      NULL     COMMENT 'NULL이면 대분류',
  code       VARCHAR(30) NOT NULL COMMENT 'URL·필터용 코드 (영문 소문자·숫자·-)',
  name       VARCHAR(50) NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0,
  is_active  TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '삭제 대신 숨김',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_code (code),
  KEY idx_categories_parent_sort (parent_id, sort_order),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '카테고리 (대분류-소분류)';

CREATE TABLE IF NOT EXISTS items (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  category_id BIGINT       NOT NULL COMMENT '소분류 카테고리',
  slug        VARCHAR(150) NOT NULL COMMENT 'URL용 식별자',
  name        VARCHAR(100) NOT NULL COMMENT '품목명·모델명',
  set_name    VARCHAR(100) NULL     COMMENT '카드만',
  card_no     VARCHAR(30)  NULL     COMMENT '카드만',
  language    VARCHAR(5)   NULL     COMMENT '카드만: ko | ja | en | zh',
  rarity      VARCHAR(10)  NULL     COMMENT '카드만: SAR | UR | SR | AR | etc',
  image_url   VARCHAR(500) NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '하드 삭제 금지. 숨김만',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_items_slug (slug),
  -- 같은 카드 중복 등록 방지. 운동화·명품은 값이 NULL이라 걸리지 않음. FK(category_id) 인덱스 역할도 함
  UNIQUE KEY uk_items_card (category_id, set_name, card_no, language),
  FULLTEXT KEY ft_items_name (name, set_name) WITH PARSER ngram,
  CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT chk_items_language CHECK (language IN ('ko', 'ja', 'en', 'zh')),
  CONSTRAINT chk_items_rarity CHECK (rarity IN ('SAR', 'UR', 'SR', 'AR', 'etc'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '공식 품목';

-- ─────────────────────────────────────────────
-- 판매글
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listings (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  registration_no VARCHAR(30)   NULL     COMMENT 'RPC-{연도}-{id 6자리}. INSERT 후 같은 트랜잭션에서 UPDATE',
  seller_id       BIGINT        NOT NULL,
  item_id         BIGINT        NOT NULL COMMENT '수정 불가',
  category_id     BIGINT        NOT NULL COMMENT 'items.category_id 복사본 (카테고리 필터용)',
  title           VARCHAR(100)  NOT NULL,
  description     VARCHAR(1000) NOT NULL DEFAULT '',
  price           INT UNSIGNED  NOT NULL COMMENT '1원 ~ 10억',
  `condition`     VARCHAR(20)   NOT NULL COMMENT 'unopened | opened_raw | graded',
  grading_service VARCHAR(10)   NULL     COMMENT 'PSA | BGS | CGC | BRG (graded일 때만)',
  grade           VARCHAR(5)    NULL     COMMENT '10 | 9.5 | 9 | 8.5 | 8 | 7 (graded일 때만)',
  delivery        TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '택배 가능',
  direct          TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '직거래 가능',
  direct_location VARCHAR(100)  NULL     COMMENT '직거래 지역(동)',
  attributes      JSON          NULL     COMMENT '운동화·명품 속성',
  agreed_at       DATETIME      NOT NULL COMMENT '책임 동의 시각',
  status          VARCHAR(20)   NOT NULL DEFAULT 'selling' COMMENT 'selling | reserved | sold',
  view_count      INT UNSIGNED  NOT NULL DEFAULT 0,
  wish_count      INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '인기순 정렬용 집계 (찜 추가·해제와 같은 트랜잭션에서 ±1)',
  sold_price      INT UNSIGNED  NULL     COMMENT '최종 거래가 (시세 계산용)',
  sold_at         DATETIME      NULL,
  buyer_id        BIGINT        NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME      NULL     COMMENT '소프트 삭제. 거래완료는 삭제 불가(앱 검사)',
  PRIMARY KEY (id),
  UNIQUE KEY uk_listings_registration_no (registration_no),
  KEY idx_listings_cat_status_created (category_id, status, created_at),
  KEY idx_listings_cat_status_price (category_id, status, price),
  KEY idx_listings_item_status_price (item_id, status, price),
  KEY idx_listings_market (item_id, status, `condition`, grading_service, grade, sold_at),
  KEY idx_listings_seller_status_created (seller_id, status, created_at),
  KEY idx_listings_status_sold_at (status, sold_at),
  FULLTEXT KEY ft_listings_title (title) WITH PARSER ngram,
  CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_listings_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE RESTRICT,
  CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_listings_buyer FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_listings_status CHECK (status IN ('selling', 'reserved', 'sold')),
  CONSTRAINT chk_listings_condition CHECK (`condition` IN ('unopened', 'opened_raw', 'graded')),
  CONSTRAINT chk_listings_grading_service CHECK (grading_service IN ('PSA', 'BGS', 'CGC', 'BRG')),
  CONSTRAINT chk_listings_grade_value CHECK (grade IN ('10', '9.5', '9', '8.5', '8', '7')),
  CONSTRAINT chk_listings_price CHECK (price BETWEEN 1 AND 1000000000),
  CONSTRAINT chk_listings_sold_price CHECK (sold_price BETWEEN 1 AND 1000000000),
  -- graded이면 업체·등급 모두 있음, 아니면 둘 다 NULL
  CONSTRAINT chk_listings_grade CHECK (
    (`condition` = 'graded' AND grading_service IS NOT NULL AND grade IS NOT NULL)
    OR (`condition` <> 'graded' AND grading_service IS NULL AND grade IS NULL)
  ),
  CONSTRAINT chk_listings_trade CHECK (delivery = 1 OR direct = 1),
  CONSTRAINT chk_listings_sold CHECK (status <> 'sold' OR (sold_price IS NOT NULL AND sold_at IS NOT NULL))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '판매글';

CREATE TABLE IF NOT EXISTS listing_images (
  id          BIGINT           NOT NULL AUTO_INCREMENT,
  listing_id  BIGINT           NULL     COMMENT '업로드 시 NULL, 판매글 등록 때 연결',
  uploader_id BIGINT           NOT NULL,
  type        VARCHAR(10)      NOT NULL COMMENT 'photo | auth(실물 인증)',
  url         VARCHAR(500)     NOT NULL,
  sort_order  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0번이 대표 사진. 인증 사진은 항상 0',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- 순서 중복 방지 + 인증 사진은 sort_order가 항상 0이라 판매글당 1장 보장
  UNIQUE KEY uk_listing_images_order (listing_id, type, sort_order),
  KEY idx_listing_images_orphan (listing_id, created_at),
  CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE SET NULL,
  CONSTRAINT fk_listing_images_uploader FOREIGN KEY (uploader_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT chk_listing_images_type CHECK (type IN ('photo', 'auth')),
  CONSTRAINT chk_listing_images_sort CHECK (sort_order BETWEEN 0 AND 9),
  CONSTRAINT chk_listing_images_auth_sort CHECK (type = 'photo' OR sort_order = 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '판매글 사진·실물 인증 사진';

CREATE TABLE IF NOT EXISTS wishes (
  user_id    BIGINT   NOT NULL,
  listing_id BIGINT   NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, listing_id),
  CONSTRAINT fk_wishes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_wishes_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '찜 (1인 1찜)';

CREATE TABLE IF NOT EXISTS listing_views (
  listing_id BIGINT      NOT NULL,
  viewer_key VARCHAR(70) NOT NULL COMMENT '회원 u:{userId}, 비회원 ip:{IP의 SHA-256}',
  viewed_on  DATE        NOT NULL COMMENT '조회 날짜(KST)',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (listing_id, viewer_key, viewed_on),
  KEY idx_listing_views_date (viewed_on),
  CONSTRAINT fk_listing_views_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '조회수 중복 방지 (INSERT IGNORE 성공 시에만 view_count + 1)';

-- ─────────────────────────────────────────────
-- 토론글 (커뮤니티 피드 + 품목별 토론방)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  user_id        BIGINT       NOT NULL COMMENT '작성자',
  board          VARCHAR(20)  NOT NULL COMMENT 'pokemon | sneakers | onepiece | watch | free',
  tag            VARCHAR(20)  NULL     COMMENT 'analysis | verify | unboxing | poll | qna | info',
  -- TODO: 품목 API를 만들 때 BIGINT FK(→ items)로 바꾼다. 지금은 토론글 API·시드가 slug 문자열을 쓴다
  item_id        VARCHAR(100) NULL     COMMENT '품목 slug (자유게시판 글은 NULL)',
  title          VARCHAR(100) NULL,
  body           VARCHAR(500) NOT NULL,
  reaction_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '인기순 정렬용 집계 (리액션 API에서 갱신)',
  comment_count  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '인기순 정렬용 집계 (댓글 API에서 갱신)',
  edited_at      DATETIME     NULL     COMMENT '"(수정됨)" 표시용. updated_at은 집계 갱신 때도 바뀌어 쓸 수 없음',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME     NULL     COMMENT '소프트 삭제 시각',
  PRIMARY KEY (id),
  KEY idx_posts_board_created (board, created_at),
  KEY idx_posts_item_created (item_id, created_at),
  KEY idx_posts_created_item (created_at, item_id),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT chk_posts_board CHECK (board IN ('pokemon', 'sneakers', 'onepiece', 'watch', 'free')),
  CONSTRAINT chk_posts_tag CHECK (tag IN ('analysis', 'verify', 'unboxing', 'poll', 'qna', 'info'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '토론글';

CREATE TABLE IF NOT EXISTS post_images (
  id          BIGINT           NOT NULL AUTO_INCREMENT,
  post_id     BIGINT           NULL     COMMENT '업로드 시 NULL, 글 등록 때 연결',
  uploader_id BIGINT           NOT NULL,
  url         VARCHAR(500)     NOT NULL,
  sort_order  TINYINT UNSIGNED NOT NULL COMMENT '0~3 (글당 최대 4장)',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_post_images_order (post_id, sort_order),
  KEY idx_post_images_orphan (post_id, created_at),
  CONSTRAINT fk_post_images_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE SET NULL,
  CONSTRAINT fk_post_images_uploader FOREIGN KEY (uploader_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT chk_post_images_sort CHECK (sort_order BETWEEN 0 AND 3)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '토론글 사진';

CREATE TABLE IF NOT EXISTS post_reactions (
  user_id    BIGINT      NOT NULL,
  post_id    BIGINT      NOT NULL,
  type       VARCHAR(20) NOT NULL COMMENT 'fire | surprised | laugh | ice',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  KEY idx_post_reactions_post_type (post_id, type),
  CONSTRAINT fk_post_reactions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_post_reactions_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT chk_post_reactions_type CHECK (type IN ('fire', 'surprised', 'laugh', 'ice'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '이모지 리액션 (글당 1인 1개)';

CREATE TABLE IF NOT EXISTS comments (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  post_id    BIGINT       NOT NULL,
  user_id    BIGINT       NOT NULL,
  parent_id  BIGINT       NULL     COMMENT 'NULL = 댓글, 값 있음 = 답글. 답글의 답글 금지는 앱에서 검사',
  body       VARCHAR(500) NOT NULL,
  like_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME     NULL     COMMENT '소프트 삭제. 답글이 있으면 "삭제된 댓글입니다"로 남김',
  PRIMARY KEY (id),
  KEY idx_comments_post_parent_id (post_id, parent_id, id),
  KEY idx_comments_parent_id (parent_id, id),
  KEY idx_comments_created (created_at),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '댓글·답글 (답글 1단계)';

CREATE TABLE IF NOT EXISTS comment_likes (
  user_id    BIGINT   NOT NULL,
  comment_id BIGINT   NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, comment_id),
  CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '댓글 좋아요 (1인 1개)';

CREATE TABLE IF NOT EXISTS item_votes (
  user_id    BIGINT      NOT NULL,
  item_id    BIGINT      NOT NULL,
  vote_date  DATE        NOT NULL COMMENT '서버가 계산한 KST 날짜',
  direction  VARCHAR(10) NOT NULL COMMENT 'up(오른다) | down(내린다)',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id, vote_date),
  KEY idx_item_votes_item_date (item_id, vote_date, direction),
  CONSTRAINT fk_item_votes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_item_votes_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
  CONSTRAINT chk_item_votes_direction CHECK (direction IN ('up', 'down'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '시세 전망 투표 (품목당 하루 1회)';

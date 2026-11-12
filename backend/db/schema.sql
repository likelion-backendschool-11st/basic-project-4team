-- RE:PICK DB 스키마
-- 실행: npm run db:init
--   DB 생성(CREATE DATABASE)과 선택(USE)은 scripts/db-init.js가 .env의 DB_NAME으로 처리한다.
--   여러 번 실행해도 안전하도록 모든 문장은 IF NOT EXISTS로 작성한다.

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  login_id      VARCHAR(30)  NOT NULL COMMENT '로그인 아이디',
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 해시',
  nickname      VARCHAR(30)  NOT NULL COMMENT '화면 표시 이름',
  email         VARCHAR(255) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME     NULL COMMENT '소프트 삭제 시각',
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_login_id (login_id),
  UNIQUE KEY uk_users_nickname (nickname),
  UNIQUE KEY uk_users_email (email)
) ENGINE = InnoDB COMMENT = '회원';

-- 토론글 (커뮤니티 피드 + 품목별 토론방)
CREATE TABLE IF NOT EXISTS posts (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  user_id        BIGINT       NOT NULL COMMENT '작성자',
  board          VARCHAR(20)  NOT NULL COMMENT 'pokemon | sneakers | onepiece | watch | free',
  tag            VARCHAR(20)  NULL     COMMENT 'analysis | verify | unboxing | poll | qna | info',
  item_id        VARCHAR(100) NULL     COMMENT '품목 식별자 (품목 테이블 생기면 FK로 교체)',
  title          VARCHAR(100) NULL,
  body           TEXT         NOT NULL,
  reaction_count INT          NOT NULL DEFAULT 0 COMMENT '인기순 정렬용 집계 (리액션 API에서 갱신)',
  comment_count  INT          NOT NULL DEFAULT 0 COMMENT '인기순 정렬용 집계 (댓글 API에서 갱신)',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME     NULL COMMENT '소프트 삭제 시각',
  PRIMARY KEY (id),
  KEY idx_posts_board_created (board, created_at),
  KEY idx_posts_item_created (item_id, created_at),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB COMMENT = '토론글';

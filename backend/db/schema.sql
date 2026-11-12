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

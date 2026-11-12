-- 로컬 개발용 더미 데이터 (모든 계정 비밀번호: test1234)
-- 기본은 npm run db:seed 를 쓴다. 이 파일은 IDE·mysql 콘솔에서 직접 넣고 싶을 때용.
-- 이미 있는 아이디는 INSERT IGNORE로 건너뛴다.
USE repick;

INSERT IGNORE INTO users (login_id, password_hash, nickname, email) VALUES
('test1', '$2b$10$IOhC/QGFUV/94i/UGluqqOCdvMcWFTfxqJHoi2MV/Cg0fd.QVZcdq', '테스트유저1', 'test1@repick.com'),
('test2', '$2b$10$IOhC/QGFUV/94i/UGluqqOCdvMcWFTfxqJHoi2MV/Cg0fd.QVZcdq', '테스트유저2', 'test2@repick.com'),
('test3', '$2b$10$IOhC/QGFUV/94i/UGluqqOCdvMcWFTfxqJHoi2MV/Cg0fd.QVZcdq', '테스트유저3', 'test3@repick.com');

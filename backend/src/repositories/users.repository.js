const pool = require('../config/db');

/** DB 행(snake_case) → API용 객체(camelCase). password_hash는 내보내지 않는다. */
function toUser(row) {
  return {
    id: row.id,
    loginId: row.login_id,
    nickname: row.nickname,
    email: row.email,
    createdAt: row.created_at,
  };
}

/** 로그인용: 비밀번호 해시까지 포함해 조회. 탈퇴(소프트 삭제) 회원은 제외. */
async function findByLoginIdWithPassword(loginId) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE login_id = ? AND deleted_at IS NULL',
    [loginId],
  );
  if (rows.length === 0) return null;
  return { ...toUser(rows[0]), passwordHash: rows[0].password_hash };
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
    [id],
  );
  return rows.length === 0 ? null : toUser(rows[0]);
}

/** 중복 검사용. 탈퇴 회원도 UNIQUE 제약에 걸리므로 deleted_at 조건 없이 조회. */
async function findDuplicate({ loginId, nickname, email }) {
  const [rows] = await pool.execute(
    'SELECT login_id, nickname, email FROM users WHERE login_id = ? OR nickname = ? OR email = ?',
    [loginId, nickname, email ?? null],
  );
  return rows;
}

async function create({ loginId, passwordHash, nickname, email }) {
  const [result] = await pool.execute(
    'INSERT INTO users (login_id, password_hash, nickname, email) VALUES (?, ?, ?, ?)',
    [loginId, passwordHash, nickname, email ?? null],
  );
  return findById(result.insertId);
}

module.exports = { findByLoginIdWithPassword, findById, findDuplicate, create };

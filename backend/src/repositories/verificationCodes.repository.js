const pool = require('../config/db');

/** 트랜잭션 헬퍼: work(conn)이 던지면 롤백. */
async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** 같은 용도로 가장 최근에 발급한 코드의 발급 시각 (재발송 대기 시간 계산용). 없으면 null. */
async function findLatestCreatedAt(userId, purpose) {
  const [rows] = await pool.execute(
    'SELECT created_at FROM verification_codes WHERE user_id = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
    [userId, purpose],
  );
  return rows.length === 0 ? null : rows[0].created_at;
}

/** 새 코드 발급. 같은 용도의 안 쓴 이전 코드는 같은 트랜잭션에서 무효로 만든다 — 항상 마지막 메일의 코드만 유효. */
function replaceCode({ userId, purpose, codeHash, ttlMinutes }) {
  return withTransaction(async (conn) => {
    await conn.execute(
      'UPDATE verification_codes SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND purpose = ? AND used_at IS NULL',
      [userId, purpose],
    );
    await conn.execute(
      `INSERT INTO verification_codes (user_id, purpose, code_hash, expires_at)
       VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE)`,
      [userId, purpose, codeHash, ttlMinutes],
    );
  });
}

/**
 * 인증코드 확인. 행을 잠가(FOR UPDATE) 동시에 여러 번 시도해도 틀린 횟수가 정확히 세어지게 한다.
 * - resetTokenHash가 없으면(아이디 찾기) 성공 시 코드를 바로 사용 완료 처리한다.
 * - 있으면(비밀번호 찾기) 성공 시 재설정 토큰을 저장하고 만료를 tokenTtlMinutes 뒤로 미룬다.
 * 반환: true(성공) | false(코드 없음·만료·이미 사용·틀림·잠김 — 구분하지 않음)
 */
function verifyCode({ userId, purpose, codeHash, maxAttempts, resetTokenHash = null, tokenTtlMinutes = 0 }) {
  return withTransaction(async (conn) => {
    const [rows] = await conn.execute(
      `SELECT id, code_hash, attempt_count FROM verification_codes
        WHERE user_id = ? AND purpose = ? AND used_at IS NULL AND verified_at IS NULL
          AND expires_at > UTC_TIMESTAMP() AND attempt_count < ?
        ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [userId, purpose, maxAttempts],
    );
    if (rows.length === 0) return false;
    const row = rows[0];
    if (row.code_hash !== codeHash) {
      await conn.execute('UPDATE verification_codes SET attempt_count = attempt_count + 1 WHERE id = ?', [row.id]);
      return false;
    }
    if (resetTokenHash) {
      await conn.execute(
        `UPDATE verification_codes
            SET verified_at = UTC_TIMESTAMP(), reset_token_hash = ?, expires_at = UTC_TIMESTAMP() + INTERVAL ? MINUTE
          WHERE id = ?`,
        [resetTokenHash, tokenTtlMinutes, row.id],
      );
    } else {
      await conn.execute(
        'UPDATE verification_codes SET verified_at = UTC_TIMESTAMP(), used_at = UTC_TIMESTAMP() WHERE id = ?',
        [row.id],
      );
    }
    return true;
  });
}

/** 재설정 토큰으로 비밀번호 변경. 토큰은 한 번만 쓸 수 있다. 성공하면 true. */
function consumeResetToken({ tokenHash, passwordHash }) {
  return withTransaction(async (conn) => {
    const [rows] = await conn.execute(
      `SELECT id, user_id FROM verification_codes
        WHERE reset_token_hash = ? AND purpose = 'reset_password' AND verified_at IS NOT NULL
          AND used_at IS NULL AND expires_at > UTC_TIMESTAMP()
        FOR UPDATE`,
      [tokenHash],
    );
    if (rows.length === 0) return false;
    const [result] = await conn.execute(
      'UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL',
      [passwordHash, rows[0].user_id],
    );
    if (result.affectedRows === 0) return false; // 그 사이 탈퇴한 회원
    await conn.execute('UPDATE verification_codes SET used_at = UTC_TIMESTAMP() WHERE id = ?', [rows[0].id]);
    return true;
  });
}

module.exports = { findLatestCreatedAt, replaceCode, verifyCode, consumeResetToken };

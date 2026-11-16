const pool = require('../config/db');

/** 가장 최근에 발급한 코드의 발급 시각 (재발송 대기 시간 계산용). 없으면 null. */
async function findLatestCreatedAt(userId) {
  const [rows] = await pool.execute(
    'SELECT created_at FROM password_reset_codes WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [userId],
  );
  return rows.length === 0 ? null : rows[0].created_at;
}

/** 새 코드 발급. 아직 안 쓴 이전 코드는 같은 트랜잭션에서 무효로 만든다 — 항상 마지막 메일의 코드만 유효. */
async function replaceCode({ userId, codeHash, ttlMinutes }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      'UPDATE password_reset_codes SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND used_at IS NULL',
      [userId],
    );
    await conn.execute(
      'INSERT INTO password_reset_codes (user_id, code_hash, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE)',
      [userId, codeHash, ttlMinutes],
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 인증코드를 확인하고 맞으면 비밀번호를 바꾼다. 한 트랜잭션에서 행을 잠가(FOR UPDATE)
 * 동시에 여러 번 시도해도 시도 횟수가 정확히 세어지게 한다.
 * 반환: 'ok' | 'invalid'(코드 없음·만료·이미 사용) | 'mismatch'(틀림, 남은 횟수 있음) | 'locked'(이번에 5회째 틀림)
 */
async function consumeCode({ userId, codeHash, passwordHash, maxAttempts }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      `SELECT id, code_hash, attempt_count FROM password_reset_codes
        WHERE user_id = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP() AND attempt_count < ?
        ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [userId, maxAttempts],
    );
    if (rows.length === 0) {
      await conn.commit();
      return { result: 'invalid' };
    }
    const row = rows[0];
    if (row.code_hash !== codeHash) {
      const attempts = row.attempt_count + 1;
      await conn.execute('UPDATE password_reset_codes SET attempt_count = ? WHERE id = ?', [attempts, row.id]);
      await conn.commit();
      return attempts >= maxAttempts ? { result: 'locked' } : { result: 'mismatch', remaining: maxAttempts - attempts };
    }
    await conn.execute('UPDATE password_reset_codes SET used_at = UTC_TIMESTAMP() WHERE id = ?', [row.id]);
    await conn.execute('UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL', [passwordHash, userId]);
    await conn.commit();
    return { result: 'ok' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { findLatestCreatedAt, replaceCode, consumeCode };

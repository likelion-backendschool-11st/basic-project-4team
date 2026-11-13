const pool = require('../config/db');

/** DB 행(snake_case) → API용 Report(camelCase). */
function toReport(row) {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    detail: row.detail,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** 신고 저장. 같은 사람이 같은 대상을 다시 신고하면 MySQL이 ER_DUP_ENTRY를 던진다(uk_reports_target). */
async function create({ reporterId, targetType, targetId, reason, detail }) {
  const [result] = await pool.execute(
    'INSERT INTO reports (reporter_id, target_type, target_id, reason, detail) VALUES (?, ?, ?, ?, ?)',
    [reporterId, targetType, targetId, reason, detail],
  );
  const [[row]] = await pool.execute('SELECT * FROM reports WHERE id = ?', [result.insertId]);
  return toReport(row);
}

module.exports = { create };

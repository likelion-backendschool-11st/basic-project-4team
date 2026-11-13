const reportService = require('./report.service');
const HttpError = require('../utils/HttpError');

const REASONS = ['fraud', 'spam', 'abuse', 'inappropriate', 'etc'];
const DETAIL_MAX = 500;

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 신고 본문 검증. 사유가 기타(etc)면 상세 내용이 필수다. */
function parseReport(input) {
  const { targetType, targetId, reason, detail } = input ?? {};
  if (!reportService.TARGET_TYPES.includes(targetType)) {
    throw badRequest(`targetType 값이 올바르지 않습니다. (${reportService.TARGET_TYPES.join(', ')})`);
  }
  if (!Number.isInteger(targetId) || targetId < 1) throw badRequest('targetId는 양의 정수여야 합니다.');
  if (!REASONS.includes(reason)) throw badRequest(`reason 값이 올바르지 않습니다. (${REASONS.join(', ')})`);
  if (detail !== undefined && detail !== null && typeof detail !== 'string') {
    throw badRequest('detail은 문자열이어야 합니다.');
  }
  const trimmed = typeof detail === 'string' ? detail.trim() : '';
  if (trimmed.length > DETAIL_MAX) throw badRequest(`상세 내용은 ${DETAIL_MAX}자 이하여야 합니다.`);
  if (reason === 'etc' && trimmed.length === 0) throw badRequest('기타 사유는 상세 내용을 입력해 주세요.');
  return { targetType, targetId, reason, detail: trimmed || null };
}

/** POST /api/reports — 토론글·댓글 신고. */
async function create(req, res) {
  const report = await reportService.createReport(req.user.id, parseReport(req.body));
  res.status(201).json({ data: { report } });
}

module.exports = { create };

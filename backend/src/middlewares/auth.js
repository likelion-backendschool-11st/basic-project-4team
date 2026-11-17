const jwt = require('jsonwebtoken');
const env = require('../config/env');
const HttpError = require('../utils/HttpError');

const TOKEN_COOKIE = 'accessToken';

/** 토큰 payload → req.user. role이 없는 예전 토큰은 일반 회원으로 본다. */
const toRequestUser = (payload) => ({ id: Number(payload.sub), role: payload.role === 'admin' ? 'admin' : 'user' });

/** 쿠키의 JWT를 검증하고 req.user = { id, role } 를 채운다. 없거나 잘못되면 401. */
function requireAuth(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) {
    return next(new HttpError(401, 'UNAUTHORIZED', '로그인이 필요합니다.'));
  }
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = toRequestUser(payload);
    return next();
  } catch {
    return next(new HttpError(401, 'INVALID_TOKEN', '로그인이 만료되었거나 유효하지 않습니다.'));
  }
}

/** 로그인 여부와 관계없이 통과시킨다. 유효한 토큰이 있을 때만 req.user를 채운다. */
function optionalAuth(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwt.secret);
      req.user = toRequestUser(payload);
    } catch {
      // 만료·위조 토큰은 비로그인으로 취급한다 — 공개 조회 API가 401로 막히지 않게.
    }
  }
  next();
}

/** requireAuth 뒤에 붙인다. 토큰의 role만 보고 관리자가 아니면 403 (spec-gaps A3 — DB 조회 없음). */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new HttpError(403, 'FORBIDDEN', '관리자만 사용할 수 있습니다.'));
  }
  return next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin, TOKEN_COOKIE };

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const HttpError = require('../utils/HttpError');

const TOKEN_COOKIE = 'accessToken';

/** 쿠키의 JWT를 검증하고 req.user = { id } 를 채운다. 없거나 잘못되면 401. */
function requireAuth(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) {
    return next(new HttpError(401, 'UNAUTHORIZED', '로그인이 필요합니다.'));
  }
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: Number(payload.sub) };
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
      req.user = { id: Number(payload.sub) };
    } catch {
      // 만료·위조 토큰은 비로그인으로 취급한다 — 공개 조회 API가 401로 막히지 않게.
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, TOKEN_COOKIE };

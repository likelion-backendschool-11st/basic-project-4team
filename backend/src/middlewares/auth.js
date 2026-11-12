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

module.exports = { requireAuth, TOKEN_COOKIE };

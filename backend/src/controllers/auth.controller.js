const env = require('../config/env');
const authService = require('../services/auth.service');
const { TOKEN_COOKIE } = require('../middlewares/auth');
const HttpError = require('../utils/HttpError');

const LOGIN_ID_PATTERN = /^[a-z0-9_]{4,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt는 72바이트 이후를 무시한다
const NICKNAME_MAX = 30;

// JS에서 접근 못 하는 httpOnly 쿠키에 토큰을 담아 XSS로 탈취되지 않게 한다.
const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
};

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function signup(req, res) {
  const loginId = asTrimmedString(req.body?.loginId);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const nickname = asTrimmedString(req.body?.nickname);
  const email = asTrimmedString(req.body?.email) || null;

  if (!LOGIN_ID_PATTERN.test(loginId)) {
    throw badRequest('아이디는 영문 소문자·숫자·밑줄(_) 4~30자여야 합니다.');
  }
  if (password.length < PASSWORD_MIN || Buffer.byteLength(password) > PASSWORD_MAX) {
    throw badRequest(`비밀번호는 ${PASSWORD_MIN}자 이상, ${PASSWORD_MAX}바이트 이하여야 합니다.`);
  }
  if (nickname.length === 0 || nickname.length > NICKNAME_MAX) {
    throw badRequest(`닉네임은 1~${NICKNAME_MAX}자여야 합니다.`);
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    throw badRequest('이메일 형식이 올바르지 않습니다.');
  }

  const user = await authService.signup({ loginId, password, nickname, email });
  res.status(201).json({ data: { user } });
}

async function login(req, res) {
  const loginId = asTrimmedString(req.body?.loginId);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!loginId || !password) {
    throw badRequest('아이디와 비밀번호를 모두 입력해 주세요.');
  }

  const { user, token } = await authService.login({ loginId, password });
  res.cookie(TOKEN_COOKIE, token, cookieOptions);
  res.json({ data: { user } });
}

function logout(req, res) {
  res.clearCookie(TOKEN_COOKIE, cookieOptions);
  res.status(204).end();
}

async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  res.json({ data: { user } });
}

module.exports = { signup, login, logout, me };

const env = require('../config/env');
const authService = require('../services/auth.service');
const accountRecoveryService = require('../services/accountRecovery.service');
const { TOKEN_COOKIE } = require('../middlewares/auth');
const HttpError = require('../utils/HttpError');

const LOGIN_ID_PATTERN = /^[a-z0-9_]{4,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt는 72바이트 이후를 무시한다
const NICKNAME_MAX = 30;
const EMAIL_MAX = 255;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

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

/** 아이디·이메일은 소문자로 바꿔 저장·비교한다 (spec-gaps 3장 users). */
function asLowerString(value) {
  return asTrimmedString(value).toLowerCase();
}

function asPassword(value) {
  return typeof value === 'string' ? value : '';
}

function assertPassword(password) {
  if (password.length < PASSWORD_MIN || Buffer.byteLength(password) > PASSWORD_MAX) {
    throw badRequest(`비밀번호는 ${PASSWORD_MIN}자 이상, ${PASSWORD_MAX}바이트 이하여야 합니다.`);
  }
}

function assertEmail(email) {
  if (!email) {
    throw badRequest('이메일을 입력해 주세요.');
  }
  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    throw badRequest('이메일 형식이 올바르지 않습니다.');
  }
}

async function signup(req, res) {
  const loginId = asLowerString(req.body?.loginId);
  const password = asPassword(req.body?.password);
  const nickname = asTrimmedString(req.body?.nickname);
  const email = asLowerString(req.body?.email);

  if (!LOGIN_ID_PATTERN.test(loginId)) {
    throw badRequest('아이디는 영문 소문자·숫자·밑줄(_) 4~30자여야 합니다.');
  }
  assertPassword(password);
  if (nickname.length === 0 || nickname.length > NICKNAME_MAX) {
    throw badRequest(`닉네임은 1~${NICKNAME_MAX}자여야 합니다.`);
  }
  // 아이디·비밀번호 찾기에 쓰므로 가입 시 필수 (REQ-LOGIN-004)
  assertEmail(email);

  const user = await authService.signup({ loginId, password, nickname, email });
  res.status(201).json({ data: { user } });
}

async function login(req, res) {
  const loginId = asLowerString(req.body?.loginId);
  const password = asPassword(req.body?.password);
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

function readCode(value) {
  const code = asTrimmedString(value);
  if (!VERIFICATION_CODE_PATTERN.test(code)) {
    throw badRequest('인증코드 6자리 숫자를 입력해 주세요.');
  }
  return code;
}

function readLoginId(value) {
  const loginId = asLowerString(value);
  if (!loginId) {
    throw badRequest('아이디를 입력해 주세요.');
  }
  return loginId;
}

function readEmail(value) {
  const email = asLowerString(value);
  assertEmail(email);
  return email;
}

/** 아이디 찾기 1단계: 인증코드 메일 요청 — 가입 여부와 관계없이 같은 응답. */
async function requestFindId(req, res) {
  const email = readEmail(req.body?.email);
  res.json({ data: await accountRecoveryService.requestFindId(email) });
}

/** 아이디 찾기 2단계: 인증코드 확인 → 아이디. */
async function verifyFindId(req, res) {
  const email = readEmail(req.body?.email);
  const code = readCode(req.body?.code);
  res.json({ data: await accountRecoveryService.verifyFindId({ email, code }) });
}

/** 비밀번호 찾기 1단계: 인증코드 메일 요청 — 일치 여부와 관계없이 같은 응답. */
async function requestPasswordReset(req, res) {
  const loginId = readLoginId(req.body?.loginId);
  const email = readEmail(req.body?.email);
  res.json({ data: await accountRecoveryService.requestPasswordReset({ loginId, email }) });
}

/** 비밀번호 찾기 2단계: 인증코드 확인 → 재설정 토큰. */
async function verifyPasswordReset(req, res) {
  const loginId = readLoginId(req.body?.loginId);
  const email = readEmail(req.body?.email);
  const code = readCode(req.body?.code);
  res.json({ data: await accountRecoveryService.verifyPasswordReset({ loginId, email, code }) });
}

/** 비밀번호 찾기 3단계: 재설정 토큰 + 새 비밀번호 저장. */
async function confirmPasswordReset(req, res) {
  const resetToken = asTrimmedString(req.body?.resetToken);
  const newPassword = asPassword(req.body?.newPassword);
  if (!resetToken) {
    throw badRequest('재설정 토큰이 없습니다. 인증코드 확인부터 다시 진행해 주세요.');
  }
  assertPassword(newPassword);
  await accountRecoveryService.confirmPasswordReset({ resetToken, newPassword });
  res.status(204).end();
}

module.exports = {
  signup,
  login,
  logout,
  me,
  requestFindId,
  verifyFindId,
  requestPasswordReset,
  verifyPasswordReset,
  confirmPasswordReset,
};

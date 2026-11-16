const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const usersRepository = require('../repositories/users.repository');
const verificationCodesRepository = require('../repositories/verificationCodes.repository');
const { sendMailInBackground } = require('../utils/mailer');
const { verificationCodeMail } = require('../utils/mailTemplates');
const HttpError = require('../utils/HttpError');

const BCRYPT_ROUNDS = 10;
const CODE_TTL_MINUTES = 10;
const CODE_MAX_ATTEMPTS = 5;
// 같은 회원·같은 용도로 인증 메일을 연달아 보내지 않도록 하는 최소 간격
const RESEND_SECONDS = 60;
// 인증 성공 후 새 비밀번호를 입력할 수 있는 시간
const RESET_TOKEN_TTL_MINUTES = 10;

const PURPOSE = { findId: 'find_id', resetPassword: 'reset_password' };

/** 요청 단계 공통 응답. 가입 여부와 관계없이 같은 값을 준다. */
const REQUEST_RESPONSE = { sent: true, resendAfterSeconds: RESEND_SECONDS, expiresInSeconds: CODE_TTL_MINUTES * 60 };

// "코드 틀림"과 "코드 없음(없는 계정 포함)"을 같은 에러로 묶는다 — 다르면 이메일 가입 여부가 드러난다.
const invalidCode = () =>
  new HttpError(
    400,
    'INVALID_VERIFICATION_CODE',
    `인증코드가 올바르지 않거나 만료되었습니다. ${CODE_MAX_ATTEMPTS}회 잘못 입력하면 인증코드를 다시 받아야 합니다.`,
  );

/** 6자리 코드는 경우의 수가 적어 단순 해시로는 DB 유출 시 바로 역산된다. 서버 비밀키로 HMAC 한다. */
function hashCode(purpose, userId, code) {
  return crypto.createHmac('sha256', env.jwt.secret).update(`${purpose}:${userId}:${code}`).digest('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** 인증코드를 만들어 저장하고 메일로 보낸다. 재발송 대기 시간 안이면 조용히 넘어간다. */
async function issueCode(user, purpose) {
  const lastSentAt = await verificationCodesRepository.findLatestCreatedAt(user.id, purpose);
  if (lastSentAt && Date.now() - new Date(lastSentAt).getTime() < RESEND_SECONDS * 1000) {
    return; // 직전 메일의 코드가 아직 유효하다
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await verificationCodesRepository.replaceCode({
    userId: user.id,
    purpose,
    codeHash: hashCode(purpose, user.id, code),
    ttlMinutes: CODE_TTL_MINUTES,
  });
  sendMailInBackground({
    to: user.email,
    ...verificationCodeMail({ purpose, nickname: user.nickname, code, ttlMinutes: CODE_TTL_MINUTES }),
  });
}

/** 아이디 찾기 1단계: 가입된 이메일이면 인증코드 메일 발송. */
async function requestFindId(email) {
  const user = await usersRepository.findByEmail(email);
  if (user) await issueCode(user, PURPOSE.findId);
  return REQUEST_RESPONSE;
}

/** 아이디 찾기 2단계: 코드가 맞으면 아이디를 돌려준다. */
async function verifyFindId({ email, code }) {
  const user = await usersRepository.findByEmail(email);
  if (!user) throw invalidCode();
  const ok = await verificationCodesRepository.verifyCode({
    userId: user.id,
    purpose: PURPOSE.findId,
    codeHash: hashCode(PURPOSE.findId, user.id, code),
    maxAttempts: CODE_MAX_ATTEMPTS,
  });
  if (!ok) throw invalidCode();
  return { loginId: user.loginId, createdAt: user.createdAt };
}

/** 비밀번호 찾기 1단계: 아이디·이메일이 같은 회원이면 인증코드 메일 발송. */
async function requestPasswordReset({ loginId, email }) {
  const user = await usersRepository.findByLoginIdAndEmail(loginId, email);
  if (user) await issueCode(user, PURPOSE.resetPassword);
  return REQUEST_RESPONSE;
}

/** 비밀번호 찾기 2단계: 코드가 맞으면 새 비밀번호 저장에 쓸 일회용 재설정 토큰을 발급한다. */
async function verifyPasswordReset({ loginId, email, code }) {
  const user = await usersRepository.findByLoginIdAndEmail(loginId, email);
  if (!user) throw invalidCode();
  const resetToken = crypto.randomBytes(32).toString('base64url');
  const ok = await verificationCodesRepository.verifyCode({
    userId: user.id,
    purpose: PURPOSE.resetPassword,
    codeHash: hashCode(PURPOSE.resetPassword, user.id, code),
    maxAttempts: CODE_MAX_ATTEMPTS,
    resetTokenHash: hashToken(resetToken),
    tokenTtlMinutes: RESET_TOKEN_TTL_MINUTES,
  });
  if (!ok) throw invalidCode();
  return { resetToken, expiresInSeconds: RESET_TOKEN_TTL_MINUTES * 60 };
}

/** 비밀번호 찾기 3단계: 재설정 토큰으로 새 비밀번호 저장. */
async function confirmPasswordReset({ resetToken, newPassword }) {
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const ok = await verificationCodesRepository.consumeResetToken({ tokenHash: hashToken(resetToken), passwordHash });
  if (!ok) {
    throw new HttpError(400, 'INVALID_RESET_TOKEN', '비밀번호 변경 가능 시간이 지났거나 이미 변경했습니다. 처음부터 다시 진행해 주세요.');
  }
}

module.exports = {
  requestFindId,
  verifyFindId,
  requestPasswordReset,
  verifyPasswordReset,
  confirmPasswordReset,
};

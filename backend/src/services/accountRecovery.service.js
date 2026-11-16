const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const usersRepository = require('../repositories/users.repository');
const passwordResetCodesRepository = require('../repositories/passwordResetCodes.repository');
const { sendMailInBackground } = require('../utils/mailer');
const HttpError = require('../utils/HttpError');

const BCRYPT_ROUNDS = 10;
const RESET_CODE_TTL_MINUTES = 10;
const RESET_CODE_MAX_ATTEMPTS = 5;
// 같은 회원에게 인증 메일을 연달아 보내지 않도록 하는 최소 간격
const RESET_CODE_RESEND_SECONDS = 60;

/** 6자리 코드는 경우의 수가 적어 단순 해시로는 DB 유출 시 바로 역산된다. 서버 비밀키로 HMAC 한다. */
function hashCode(userId, code) {
  return crypto.createHmac('sha256', env.jwt.secret).update(`${userId}:${code}`).digest('hex');
}

/** 아이디 찾기 (REQ-LOGIN-004). 가입된 이메일이면 그 메일로 아이디를 보낸다. 가입 여부는 응답으로 알려주지 않는다. */
async function sendLoginIdReminder(email) {
  const user = await usersRepository.findByEmail(email);
  if (!user) return;
  sendMailInBackground({
    to: user.email,
    subject: '[RE:PICK] 아이디 안내',
    text: [
      `${user.nickname}님, RE:PICK 아이디를 안내해 드립니다.`,
      '',
      `아이디: ${user.loginId}`,
      '',
      '본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다.',
    ].join('\n'),
  });
}

/** 비밀번호 찾기 1단계: 아이디·이메일이 맞으면 인증코드를 메일로 보낸다. 일치 여부는 응답으로 알려주지 않는다. */
async function requestPasswordReset({ loginId, email }) {
  const user = await usersRepository.findByLoginIdAndEmail(loginId, email);
  if (!user) return;

  const lastSentAt = await passwordResetCodesRepository.findLatestCreatedAt(user.id);
  if (lastSentAt && Date.now() - new Date(lastSentAt).getTime() < RESET_CODE_RESEND_SECONDS * 1000) {
    return; // 직전 메일의 코드가 아직 유효하므로 조용히 넘어간다
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await passwordResetCodesRepository.replaceCode({
    userId: user.id,
    codeHash: hashCode(user.id, code),
    ttlMinutes: RESET_CODE_TTL_MINUTES,
  });
  sendMailInBackground({
    to: user.email,
    subject: '[RE:PICK] 비밀번호 재설정 인증코드',
    text: [
      `${user.nickname}님, 비밀번호 재설정 인증코드입니다.`,
      '',
      `인증코드: ${code}`,
      '',
      `${RESET_CODE_TTL_MINUTES}분 안에 입력해 주세요. 본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다.`,
    ].join('\n'),
  });
}

/** 비밀번호 찾기 2단계: 인증코드가 맞으면 새 비밀번호로 바꾼다. */
async function resetPassword({ loginId, code, newPassword }) {
  const invalid = new HttpError(400, 'INVALID_RESET_CODE', '인증코드가 올바르지 않거나 만료되었습니다. 인증코드를 다시 받아 주세요.');
  const user = await usersRepository.findByLoginId(loginId);
  if (!user) throw invalid;

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const outcome = await passwordResetCodesRepository.consumeCode({
    userId: user.id,
    codeHash: hashCode(user.id, code),
    passwordHash,
    maxAttempts: RESET_CODE_MAX_ATTEMPTS,
  });

  if (outcome.result === 'mismatch') {
    throw new HttpError(400, 'RESET_CODE_MISMATCH', `인증코드가 일치하지 않습니다. (남은 시도 ${outcome.remaining}회)`);
  }
  if (outcome.result === 'locked') {
    throw new HttpError(429, 'RESET_CODE_LOCKED', '인증코드를 5회 잘못 입력했습니다. 인증코드를 다시 받아 주세요.');
  }
  if (outcome.result !== 'ok') throw invalid;
}

module.exports = {
  sendLoginIdReminder,
  requestPasswordReset,
  resetPassword,
  RESET_CODE_RESEND_SECONDS,
};

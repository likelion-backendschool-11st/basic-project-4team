const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usersRepository = require('../repositories/users.repository');
const HttpError = require('../utils/HttpError');

const BCRYPT_ROUNDS = 10;
// 존재하지 않는 아이디로 로그인할 때도 bcrypt 비교 시간을 들여, 응답 시간으로 아이디 존재 여부를 알 수 없게 한다.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', BCRYPT_ROUNDS);

function issueToken(userId) {
  return jwt.sign({}, env.jwt.secret, { subject: String(userId), expiresIn: env.jwt.expiresIn });
}

/** 회원가입. 아이디·닉네임·이메일 중복이면 409. */
async function signup({ loginId, password, nickname, email }) {
  const duplicates = await usersRepository.findDuplicate({ loginId, nickname, email });
  if (duplicates.some((row) => row.login_id === loginId)) {
    throw new HttpError(409, 'DUPLICATE_LOGIN_ID', '이미 사용 중인 아이디입니다.');
  }
  if (duplicates.some((row) => row.nickname === nickname)) {
    throw new HttpError(409, 'DUPLICATE_NICKNAME', '이미 사용 중인 닉네임입니다.');
  }
  if (email && duplicates.some((row) => row.email === email)) {
    throw new HttpError(409, 'DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return usersRepository.create({ loginId, passwordHash, nickname, email });
}

/** 로그인. 성공하면 { user, token } 반환. 아이디·비밀번호 중 무엇이 틀렸는지는 알려주지 않는다. */
async function login({ loginId, password }) {
  const found = await usersRepository.findByLoginIdWithPassword(loginId);
  const matches = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);
  if (!found || !matches) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.');
  }
  const { passwordHash: _omit, ...user } = found;
  return { user, token: issueToken(user.id) };
}

/** 토큰의 회원 ID로 내 정보 조회. 그 사이 탈퇴했다면 401. */
async function getMe(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new HttpError(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
  }
  return user;
}

module.exports = { signup, login, getMe };

const bcrypt = require('bcryptjs');
const mypageRepository = require('./mypage.repository');
const HttpError = require('../utils/HttpError');

const BCRYPT_ROUNDS = 10;
// spec-gaps 3장 users: 닉네임 변경은 30일에 1번
const NICKNAME_CHANGE_INTERVAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function unauthorized() {
  return new HttpError(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
}

/** 마지막 변경 시각 → 다음에 바꿀 수 있는 시각. 바꾼 적 없으면 null(바로 가능). */
function nextNicknameChangeAt(changedAt) {
  if (!changedAt) return null;
  return new Date(new Date(changedAt).getTime() + NICKNAME_CHANGE_INTERVAL_DAYS * DAY_MS);
}

function toProfile(raw) {
  const { nicknameChangedAt, ...profile } = raw;
  const next = nextNicknameChangeAt(nicknameChangedAt);
  return {
    ...profile,
    nicknameChangedAt,
    // 지금 바꿀 수 있으면 null
    nicknameChangeAvailableAt: next && next.getTime() > Date.now() ? next.toISOString() : null,
  };
}

/** 마이페이지 첫 화면: 프로필 + 활동 숫자. */
async function getSummary(userId) {
  const [profile, counts] = await Promise.all([
    mypageRepository.findProfile(userId),
    mypageRepository.countActivity(userId),
  ]);
  if (!profile) throw unauthorized();
  return { profile: toProfile(profile), counts };
}

const withPaging = (result, { page, size }) => ({ ...result, page, size });

async function listMyListings(userId, query) {
  return withPaging(await mypageRepository.findMyListings(userId, query), query);
}

async function listMyPurchases(userId, paging) {
  return withPaging(await mypageRepository.findMyPurchases(userId, paging), paging);
}

async function listMyPosts(userId, paging) {
  return withPaging(await mypageRepository.findMyPosts(userId, paging), paging);
}

async function listMyComments(userId, paging) {
  return withPaging(await mypageRepository.findMyComments(userId, paging), paging);
}

/** 닉네임 변경. 30일에 1번, 중복 불가. 바뀐 프로필을 돌려준다. */
async function changeNickname(userId, nickname) {
  const current = await mypageRepository.findProfile(userId);
  if (!current) throw unauthorized();
  if (current.nickname === nickname) {
    throw new HttpError(400, 'SAME_NICKNAME', '지금 쓰고 있는 닉네임과 같습니다.');
  }
  const next = nextNicknameChangeAt(current.nicknameChangedAt);
  if (next && next.getTime() > Date.now()) {
    throw new HttpError(
      409,
      'NICKNAME_CHANGE_TOO_SOON',
      `닉네임은 ${NICKNAME_CHANGE_INTERVAL_DAYS}일에 한 번만 바꿀 수 있습니다.`,
      { availableAt: next.toISOString() },
    );
  }
  if (await mypageRepository.isNicknameTaken(nickname, userId)) {
    throw new HttpError(409, 'DUPLICATE_NICKNAME', '이미 사용 중인 닉네임입니다.');
  }
  try {
    await mypageRepository.updateNickname(userId, nickname);
  } catch (err) {
    // 중복 확인과 UPDATE 사이에 다른 사람이 같은 닉네임을 가져간 경우
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'DUPLICATE_NICKNAME', '이미 사용 중인 닉네임입니다.');
    }
    throw err;
  }
  return toProfile(await mypageRepository.findProfile(userId));
}

/** 비밀번호 변경. 현재 비밀번호를 확인한다. */
async function changePassword(userId, { currentPassword, newPassword }) {
  const hash = await mypageRepository.findPasswordHash(userId);
  if (!hash) throw unauthorized();
  // 401은 프론트에서 "로그아웃됨"으로 처리하므로, 틀린 현재 비밀번호는 400으로 준다.
  if (!(await bcrypt.compare(currentPassword, hash))) {
    throw new HttpError(400, 'INVALID_CURRENT_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');
  }
  if (await bcrypt.compare(newPassword, hash)) {
    throw new HttpError(400, 'SAME_PASSWORD', '현재 비밀번호와 다른 비밀번호를 입력해 주세요.');
  }
  await mypageRepository.updatePasswordHash(userId, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
}

module.exports = {
  getSummary,
  listMyListings,
  listMyPurchases,
  listMyPosts,
  listMyComments,
  changeNickname,
  changePassword,
};

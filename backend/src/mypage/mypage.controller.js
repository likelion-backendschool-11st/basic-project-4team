const mypageService = require('./mypage.service');
const HttpError = require('../utils/HttpError');

const LISTING_STATUSES = ['selling', 'reserved', 'sold'];
const NICKNAME_MAX = 30;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt는 72바이트 이후를 무시한다

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** page·size 쿼리 — page ≥ 1, size 1~50 (찜 목록과 같은 규칙). */
function parsePaging(query) {
  const read = (value, fallback) => (value === undefined ? fallback : /^[1-9]\d*$/.test(String(value)) ? Number(value) : NaN);
  const page = read(query.page, 1);
  const size = read(query.size, 10);
  if (!Number.isSafeInteger(page)) throw badRequest('page는 1 이상의 정수여야 합니다.');
  if (!Number.isSafeInteger(size) || size > 50) throw badRequest('size는 1~50 사이의 정수여야 합니다.');
  return { page, size };
}

/** GET /users/me/summary — 프로필 + 활동 숫자. */
async function summary(req, res) {
  res.json({ data: await mypageService.getSummary(req.user.id) });
}

/** GET /users/me/listings?status= — 내 판매글. */
async function listings(req, res) {
  const { status } = req.query;
  if (status !== undefined && !LISTING_STATUSES.includes(status)) {
    throw badRequest('status는 selling, reserved, sold 중 하나여야 합니다.');
  }
  res.json({ data: await mypageService.listMyListings(req.user.id, { status: status ?? null, ...parsePaging(req.query) }) });
}

/** GET /users/me/purchases — 구매 내역. */
async function purchases(req, res) {
  res.json({ data: await mypageService.listMyPurchases(req.user.id, parsePaging(req.query)) });
}

/** GET /users/me/posts — 내 토론글. */
async function posts(req, res) {
  res.json({ data: await mypageService.listMyPosts(req.user.id, parsePaging(req.query)) });
}

/** GET /users/me/comments — 내 댓글. */
async function comments(req, res) {
  res.json({ data: await mypageService.listMyComments(req.user.id, parsePaging(req.query)) });
}

/** PATCH /users/me/nickname — 닉네임 변경 (30일에 1번). */
async function changeNickname(req, res) {
  const nickname = typeof req.body?.nickname === 'string' ? req.body.nickname.trim() : '';
  if (nickname.length === 0 || nickname.length > NICKNAME_MAX || /\s{2,}|[\r\n]/.test(nickname)) {
    throw badRequest(`닉네임은 1~${NICKNAME_MAX}자, 연속 공백·줄바꿈 없이 입력해 주세요.`);
  }
  const profile = await mypageService.changeNickname(req.user.id, nickname);
  res.json({ data: { profile } });
}

/** PATCH /users/me/password — 비밀번호 변경. */
async function changePassword(req, res) {
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (!currentPassword) throw badRequest('현재 비밀번호를 입력해 주세요.');
  if (newPassword.length < PASSWORD_MIN || Buffer.byteLength(newPassword) > PASSWORD_MAX) {
    throw badRequest(`비밀번호는 ${PASSWORD_MIN}자 이상, ${PASSWORD_MAX}바이트 이하여야 합니다.`);
  }
  await mypageService.changePassword(req.user.id, { currentPassword, newPassword });
  res.status(204).end();
}

module.exports = { summary, listings, purchases, posts, comments, changeNickname, changePassword };

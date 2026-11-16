const wishService = require('./wish.service');
const HttpError = require('../utils/HttpError');

/** 경로의 listingId — 1 이상의 정수만 허용한다 (/listings/abc/wishes → 400). */
function parseListingId(req) {
  const { listingId } = req.params;
  if (!/^[1-9]\d*$/.test(listingId)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'listingId는 1 이상의 정수여야 합니다.');
  }
  return Number(listingId);
}

/** POST /api/listings/:listingId/wishes — 찜하기 (LIST-02). 새로 찜했으면 201, 이미 찜한 상태면 200. */
async function add(req, res) {
  const { created, wish } = await wishService.addWish(parseListingId(req), req.user.id);
  res.status(created ? 201 : 200).json({ data: wish });
}

/** DELETE /api/listings/:listingId/wishes — 찜 해제 (LIST-03). 찜하지 않은 상태여도 200. */
async function remove(req, res) {
  const wish = await wishService.removeWish(parseListingId(req), req.user.id);
  res.json({ data: wish });
}

/** page·size 쿼리 — page ≥ 1, size 1~50. */
function parsePaging(query) {
  const read = (value, fallback) => (value === undefined ? fallback : /^[1-9]\d*$/.test(String(value)) ? Number(value) : NaN);
  const page = read(query.page, 1);
  const size = read(query.size, 20);
  if (!Number.isSafeInteger(page)) throw new HttpError(400, 'VALIDATION_ERROR', 'page는 1 이상의 정수여야 합니다.');
  if (!Number.isSafeInteger(size) || size > 50) throw new HttpError(400, 'VALIDATION_ERROR', 'size는 1~50 사이의 정수여야 합니다.');
  return { page, size };
}

/** GET /api/users/me/wishes — 내 찜 목록 (LIST-04). */
async function listMine(req, res) {
  res.json({ data: await wishService.listMyWishes(req.user.id, parsePaging(req.query)) });
}

module.exports = { add, remove, listMine };

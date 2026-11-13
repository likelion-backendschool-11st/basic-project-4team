const sellService = require('./sell.service');
const HttpError = require('../utils/HttpError');

/** 경로의 listingId. 양의 정수가 아니면 존재할 수 없는 판매글이므로 404로 응답한다. */
function parseListingId(req) {
  const { listingId } = req.params;
  if (!/^[1-9]\d*$/.test(listingId)) {
    throw new HttpError(404, 'LISTING_NOT_FOUND', '판매글을 찾을 수 없습니다.');
  }
  return Number(listingId);
}

/** GET /api/listings/:listingId — 판매글 상세 (LISTING-02). */
async function detail(req, res) {
  const listing = await sellService.getListingDetail(parseListingId(req), {
    viewerId: req.user?.id,
    ip: req.ip,
  });
  res.json({ data: listing });
}

module.exports = { detail };

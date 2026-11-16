const wishRepository = require('./wish.repository');
const HttpError = require('../utils/HttpError');

function listingNotFound() {
  return new HttpError(404, 'LISTING_NOT_FOUND', '판매글을 찾을 수 없습니다.');
}

/**
 * 찜하기 (LIST-02). 멱등 — 이미 찜했으면 created: false.
 * 삭제된 판매글, 내 판매글, 거래완료 판매글은 찜할 수 없다.
 */
async function addWish(listingId, userId) {
  return wishRepository.withListingLock(listingId, async (listing, tx) => {
    if (!listing || listing.deletedAt !== null) throw listingNotFound();
    if (listing.sellerId === userId) {
      throw new HttpError(403, 'CANNOT_WISH_OWN_LISTING', '내 판매글은 찜할 수 없습니다.');
    }
    if (listing.status === 'sold') {
      throw new HttpError(409, 'LISTING_SOLD', '거래가 완료된 판매글은 찜할 수 없습니다.');
    }

    const created = await tx.insertWish(listingId, userId);
    const wishCount = created ? await tx.changeWishCount(listingId, 1) : listing.wishCount;
    return { created, wish: { listingId, isWished: true, wishCount } };
  });
}

/**
 * 찜 해제 (LIST-03). 멱등 — 찜하지 않은 상태여도 성공.
 * 삭제된 판매글도 허용한다 (남은 찜을 정리할 수 있도록).
 */
async function removeWish(listingId, userId) {
  return wishRepository.withListingLock(listingId, async (listing, tx) => {
    if (!listing) throw listingNotFound();

    const deleted = await tx.deleteWish(listingId, userId);
    const wishCount = deleted ? await tx.changeWishCount(listingId, -1) : listing.wishCount;
    return { listingId, isWished: false, wishCount };
  });
}

/** 내 찜 목록 (LIST-04). */
async function listMyWishes(userId, { page, size }) {
  const { items, totalCount } = await wishRepository.findMyWishes(userId, { page, size });
  return { items, page, size, totalCount };
}

module.exports = { addWish, removeWish, listMyWishes };

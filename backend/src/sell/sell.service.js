const crypto = require('crypto');
const sellRepository = require('./sell.repository');
const HttpError = require('../utils/HttpError');

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function listingNotFound() {
  return new HttpError(404, 'LISTING_NOT_FOUND', '판매글을 찾을 수 없습니다.');
}

/** 조회수 중복 방지 키. IP 원문은 개인정보라 해시로만 저장한다. */
function toViewerKey({ viewerId, ip }) {
  if (viewerId !== undefined) return `u:${viewerId}`;
  return `ip:${crypto.createHash('sha256').update(ip ?? '').digest('hex')}`;
}

/** 오늘 날짜(KST) — YYYY-MM-DD. 조회수는 KST 하루 단위로 센다. */
function todayKst() {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 시세 대비 차이율(%, 소수 1자리). 음수 = 시세보다 저렴. */
function toPriceDiffRate(price, marketPrice) {
  if (!marketPrice) return null;
  const rate = ((price - marketPrice.averagePrice) / marketPrice.averagePrice) * 100;
  // Math.round는 음수 .5를 0 쪽으로 올리므로(-6.25 → -6.2) 절댓값으로 반올림해 부호를 되돌린다.
  return (Math.sign(rate) * Math.round(Math.abs(rate) * 10)) / 10;
}

/** LISTING-01 판매글 검색·목록. category는 code로 받아 하위 카테고리까지 포함한다. */
async function listListings({ category, ...filter }, { sort, page, size, viewerId }) {
  let categoryIds = null;
  if (category) {
    categoryIds = await sellRepository.findCategoryIdsByCode(category);
    if (!categoryIds) throw new HttpError(404, 'CATEGORY_NOT_FOUND', '존재하지 않는 카테고리입니다.');
  }
  const { listings, totalCount } = await sellRepository.findMany(
    { ...filter, categoryIds },
    { sort, limit: size, offset: (page - 1) * size, viewerId },
  );
  const items = listings.map(({ marketAveragePrice, ...listing }) => ({
    ...listing,
    priceDiffRate: toPriceDiffRate(listing.price, marketAveragePrice === null ? null : { averagePrice: marketAveragePrice }),
  }));
  return { items, page, size, totalCount };
}

/**
 * 판매글 상세(LISTING-02). 작성자가 아니면 조회수를 올린다.
 * viewerId는 비로그인이면 undefined.
 */
async function getListingDetail(listingId, { viewerId, ip }) {
  const listing = await sellRepository.findDetailById(listingId);
  if (!listing) throw listingNotFound();

  const isOwner = viewerId !== undefined && listing.seller.id === viewerId;

  const [{ images, authImage }, marketPrice, soldCount, isWished, viewIncreased] = await Promise.all([
    sellRepository.findImages(listingId),
    sellRepository.findMarketPrice({
      itemId: listing.item.id,
      condition: listing.condition,
      gradingService: listing.gradingService,
      grade: listing.grade,
    }),
    sellRepository.countSoldBySeller(listing.seller.id),
    viewerId === undefined ? false : sellRepository.isWishedBy(listingId, viewerId),
    isOwner ? false : sellRepository.increaseViewCount(listingId, toViewerKey({ viewerId, ip }), todayKst()),
  ]);

  return {
    ...listing,
    thumbnailUrl: images[0]?.url ?? null,
    isWished,
    priceDiffRate: toPriceDiffRate(listing.price, marketPrice),
    images,
    authImage,
    marketPrice,
    viewCount: listing.viewCount + (viewIncreased ? 1 : 0),
    seller: { ...listing.seller, soldCount },
    isOwner,
    // 체결가는 작성자에게만 보여준다.
    soldPrice: isOwner ? listing.soldPrice : null,
  };
}

module.exports = { listListings, getListingDetail };

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const sellRepository = require('./sell.repository');
const itemCommunityService = require('../itemcommunity/itemcommunity.service');
const env = require('../config/env');
const HttpError = require('../utils/HttpError');
const notificationService = require('../notification/notification.service');

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const LISTING_IMAGE_DIR = 'listings';
const IMAGE_MAX_SIDE = 1600;
const IMAGE_WEBP_QUALITY = 80;
const ALLOWED_IMAGE_FORMATS = ['jpeg', 'png', 'webp'];

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

/**
 * 원본 이미지 → 긴 변 1600px 이하 WebP.
 * 확장자·MIME은 클라이언트가 속일 수 있어서 실제 파일 내용(sharp metadata)으로 형식을 다시 확인한다.
 * sharp는 기본으로 EXIF(촬영 위치 등)를 지우므로, 회전 정보만 먼저 픽셀에 반영한다.
 */
async function resizeImage(buffer) {
  let format;
  try {
    ({ format } = await sharp(buffer).metadata());
  } catch {
    format = null;
  }
  if (!ALLOWED_IMAGE_FORMATS.includes(format)) {
    throw new HttpError(415, 'UNSUPPORTED_IMAGE_TYPE', 'JPEG, PNG, WebP 이미지만 올릴 수 있습니다.');
  }
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: IMAGE_MAX_SIDE, height: IMAGE_MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMAGE_WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new HttpError(400, 'INVALID_IMAGE', '이미지 파일이 손상되어 읽을 수 없습니다.');
  }
}

/** UPLOAD-01 이미지 업로드. 리사이즈한 파일을 저장하고 아직 판매글에 연결되지 않은 이미지 행을 만든다. */
async function uploadImage({ uploaderId, type, buffer }) {
  const resized = await resizeImage(buffer);
  const fileName = `${crypto.randomUUID()}.webp`;
  const dir = path.join(env.uploadDir, LISTING_IMAGE_DIR);
  const filePath = path.join(dir, fileName);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, resized);

  const url = `${env.publicBaseUrl}/uploads/${LISTING_IMAGE_DIR}/${fileName}`;
  try {
    const imageId = await sellRepository.insertImage({ uploaderId, type, url });
    return { imageId, url, type };
  } catch (err) {
    // DB 저장에 실패하면 주인 없는 파일이 남지 않게 지운다.
    await fs.unlink(filePath).catch(() => {});
    throw err;
  }
}

function imageNotFound() {
  return new HttpError(404, 'IMAGE_NOT_FOUND', '없는 이미지이거나 내가 올린 이미지가 아닙니다.');
}

function imageAlreadyUsed() {
  return new HttpError(409, 'IMAGE_ALREADY_USED', '이미 다른 판매글에 사용된 이미지입니다.');
}

/** 등록 전에 이미지 소유자·종류·연결 여부를 확인해 상황에 맞는 에러를 낸다. */
async function assertImagesLinkable(sellerId, { imageIds, authImageId }) {
  const rows = await sellRepository.findImagesByIds([...imageIds, authImageId]);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const expected = [
    ...imageIds.map((id) => ({ id, type: 'photo' })),
    { id: authImageId, type: 'auth' },
  ];
  for (const { id, type } of expected) {
    const row = byId.get(id);
    if (!row || row.uploaderId !== sellerId) throw imageNotFound();
    if (row.type !== type) {
      const field = type === 'auth' ? 'authImageId' : 'imageIds';
      const label = type === 'auth' ? '실물 인증 사진(type=auth)' : '상품 사진(type=photo)';
      throw new HttpError(400, 'VALIDATION_ERROR', `${field}에는 ${label}으로 올린 이미지만 쓸 수 있습니다.`, [
        { field, message: `이미지 ${id}의 type이 ${row.type}입니다.` },
      ]);
    }
    if (row.listingId !== null) throw imageAlreadyUsed();
  }
}

/** LISTING-03 판매글 등록. 카테고리는 품목에서 정해진다. */
async function createListing(sellerId, input) {
  const item = await sellRepository.findActiveItem(input.itemId);
  if (!item) throw new HttpError(404, 'ITEM_NOT_FOUND', '존재하지 않는 품목입니다.');

  await assertImagesLinkable(sellerId, input);

  const created = await sellRepository.createListing(
    {
      sellerId,
      itemId: item.id,
      categoryId: item.categoryId,
      title: input.title,
      description: input.description,
      price: input.price,
      condition: input.condition,
      gradingService: input.gradingService,
      grade: input.grade,
      delivery: input.delivery,
      direct: input.direct,
      directLocation: input.directLocation,
      registrationYear: todayKst().slice(0, 4),
    },
    { imageIds: input.imageIds, authImageId: input.authImageId },
  );
  // 위 검사 이후 같은 이미지로 동시에 등록한 요청이 먼저 연결한 경우
  if (!created) throw imageAlreadyUsed();
  return created;
}


function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 수정·삭제 공통 검사: 존재 → 작성자 본인(REQ-COMMON-002) → 거래완료 아님. */
function assertEditable(listing, userId) {
  if (!listing) throw listingNotFound();
  if (listing.sellerId !== userId) throw new HttpError(403, 'FORBIDDEN', '본인이 작성한 판매글만 수정·삭제할 수 있습니다.');
  // 거래완료 판매글은 시세 계산에 쓰이므로 바꾸거나 지울 수 없다.
  if (listing.status === 'sold') throw new HttpError(409, 'LISTING_ALREADY_SOLD', '거래완료된 판매글은 수정·삭제할 수 없습니다.');
}

/**
 * 수정 후 상태 기준으로 상태·등급·거래 방식을 검사하고, DB에 쓸 필드를 돌려준다.
 * 보내지 않은 필드는 현재 값을 쓴다.
 */
function resolveListingFields(current, fields) {
  const resolved = { ...fields };

  const condition = fields.condition ?? current.condition;
  if (condition !== current.condition && !(current.condition === 'unopened' && condition === 'graded')) {
    throw badRequest('상태는 미개봉 → 그레이딩으로만 바꿀 수 있습니다.');
  }
  if (condition === 'graded') {
    const gradingService = fields.gradingService !== undefined ? fields.gradingService : current.gradingService;
    const grade = fields.grade !== undefined ? fields.grade : current.grade;
    if (!gradingService || !grade) throw badRequest('그레이딩 상태는 gradingService와 grade가 모두 필요합니다.');
  } else {
    if (fields.gradingService || fields.grade) throw badRequest('gradingService와 grade는 그레이딩 상태일 때만 입력할 수 있습니다.');
    delete resolved.gradingService;
    delete resolved.grade;
  }

  const delivery = fields.delivery ?? current.delivery;
  const direct = fields.direct ?? current.direct;
  if (!delivery && !direct) throw badRequest('택배·직거래 중 하나 이상 선택해야 합니다.');
  if (direct) {
    const directLocation = fields.directLocation !== undefined ? fields.directLocation : current.directLocation;
    if (!directLocation) throw badRequest('직거래를 선택하면 직거래 지역을 입력해야 합니다.');
  } else if (fields.direct === false || fields.directLocation !== undefined) {
    // 직거래가 아니면 지역은 무시하고 비운다.
    resolved.directLocation = null;
  }
  return resolved;
}

/** 연결할 이미지 검사: 내가 올렸고, 아직 연결 전이거나 이 판매글의 이미지이며, 종류(photo·auth)가 맞아야 한다. */
async function assertAttachableImages(connection, listingId, userId, { imageIds = [], authImageId }) {
  const ids = authImageId === undefined ? imageIds : [...imageIds, authImageId];
  if (ids.length === 0) return;
  if (authImageId !== undefined && imageIds.includes(authImageId)) {
    throw badRequest('실물 인증 사진과 상품 사진에 같은 이미지를 쓸 수 없습니다.');
  }
  const images = new Map(
    (await sellRepository.findImagesForUpdate(connection, ids)).map((image) => [image.id, image]),
  );
  for (const id of ids) {
    const image = images.get(id);
    if (!image || image.uploaderId !== userId) {
      throw new HttpError(404, 'IMAGE_NOT_FOUND', `이미지를 찾을 수 없습니다: ${id}`);
    }
    if (image.listingId !== null && image.listingId !== listingId) {
      throw new HttpError(409, 'IMAGE_ALREADY_USED', `다른 판매글에 이미 연결된 이미지입니다: ${id}`);
    }
    const expectedType = id === authImageId ? 'auth' : 'photo';
    if (image.type !== expectedType) {
      throw badRequest(`${expectedType === 'auth' ? '실물 인증 사진' : '상품 사진'}으로 올린 이미지가 아닙니다: ${id}`);
    }
  }
}

/** LISTING-04 판매글 수정. 카테고리·품목은 바꿀 수 없다(controller에서 막음). 수정된 상세를 돌려준다. */
async function updateListing(listingId, userId, fields) {
  await sellRepository.withTransaction(async (connection) => {
    const current = await sellRepository.findForUpdate(connection, listingId);
    assertEditable(current, userId);

    const { imageIds, authImageId, ...rest } = fields;
    const listingFields = resolveListingFields(current, rest);
    await assertAttachableImages(connection, listingId, userId, { imageIds, authImageId });

    await sellRepository.updateListing(connection, listingId, listingFields);
    if (imageIds) await sellRepository.replacePhotos(connection, listingId, imageIds);
    if (authImageId !== undefined) await sellRepository.replaceAuthImage(connection, listingId, authImageId);
    // 가격이 바뀌면 이 판매글을 찜한 회원에게 알림 (REQ-EDIT-003)
    if (rest.price !== undefined) {
      await notificationService.notifyPriceChange(connection, {
        listingId, sellerId: current.sellerId, oldPrice: current.price, newPrice: rest.price,
      });
    }
  });
  // 작성자 본인 조회라 조회수는 오르지 않는다.
  return getListingDetail(listingId, { viewerId: userId });
}

/** LISTING-05 판매글 삭제 (소프트 삭제). */
async function deleteListing(listingId, userId) {
  await sellRepository.withTransaction(async (connection) => {
    assertEditable(await sellRepository.findForUpdate(connection, listingId), userId);
    await sellRepository.softDelete(connection, listingId);
  });
}

/** ITEM-01 카테고리 트리 — 대분류 아래 소분류를 children으로 묶는다. */
async function getCategoryTree() {
  const categories = await sellRepository.findCategories();
  return categories
    .filter((category) => category.parentId === null)
    .map(({ id, code, name }) => ({
      id,
      code,
      name,
      children: categories.filter((child) => child.parentId === id),
    }));
}

/**
 * ITEM-02 품목 검색. category는 code로 받아 하위 카테고리까지 포함한다.
 * 판매글 등록(공식 품목 검색)과 토론글 시세 태그 선택이 함께 쓰므로,
 * 품목마다 전체 조건 최근 체결가·변동률(ITEM-03 marketSummary와 같은 계산)을 붙인다.
 */
async function searchItems({ q, tokens, category }, { page, size }) {
  let categoryIds = null;
  if (category) {
    categoryIds = await sellRepository.findCategoryIdsByCode(category);
    if (!categoryIds) throw new HttpError(404, 'CATEGORY_NOT_FOUND', '존재하지 않는 카테고리입니다.');
  }
  const { items, totalCount } = await sellRepository.searchItems(
    { q, tokens, categoryIds },
    { limit: size, offset: (page - 1) * size },
  );
  const summaries = await Promise.all(items.map((item) => itemCommunityService.getMarketSummary(item.id, {})));
  return {
    items: items.map((item, i) => ({
      ...item,
      latestPrice: summaries[i]?.latestPrice ?? null,
      changeRate: summaries[i]?.changeRate ?? 0,
    })),
    page,
    size,
    totalCount,
  };
}

module.exports = {
  listListings,
  getListingDetail,
  uploadImage,
  createListing,
  updateListing,
  deleteListing,
  getCategoryTree,
  searchItems,
};

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

const LIST_SORTS = ['latest', 'priceAsc', 'priceDesc', 'popular'];
const LIST_CONDITIONS = ['unopened', 'opened_raw', 'graded'];
const LIST_GRADING_SERVICES = ['PSA', 'BGS', 'CGC', 'BRG'];
const LIST_GRADES = ['10', '9.5', '9', '8.5', '8', '7'];
const LIST_TRADE_METHODS = ['delivery', 'direct'];
const DEFAULT_LIST_SIZE = 10;
const MAX_LIST_SIZE = 50;
const Q_MAX = 100;

function listBadRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

/** 쿼리 문자열의 0 이상 정수. 비어 있으면 null. */
function parseQueryInt(value, label, { min = 0 } = {}) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < min) {
    throw listBadRequest(`${label}은(는) ${min} 이상의 정수여야 합니다.`);
  }
  return Number(value);
}

/** 쉼표로 구분된 목록. 허용되지 않은 값이 있으면 400. */
function parseQueryList(value, allowed, label) {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') throw listBadRequest(`${label} 형식이 올바르지 않습니다.`);
  const values = [...new Set(value.split(',').map((v) => v.trim()).filter(Boolean))];
  const invalid = values.filter((v) => !allowed.includes(v));
  if (invalid.length > 0) throw listBadRequest(`${label} 값이 올바르지 않습니다: ${invalid.join(', ')} (${allowed.join(', ')})`);
  return values;
}

/** "PSA-10,BGS-9.5" → [{ gradingService, grade }]. */
function parseGrades(value) {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') throw listBadRequest('grades 형식이 올바르지 않습니다.');
  return value.split(',').map((token) => {
    const [gradingService, grade, extra] = token.trim().split('-');
    if (extra !== undefined || !LIST_GRADING_SERVICES.includes(gradingService) || !LIST_GRADES.includes(grade)) {
      throw listBadRequest(`grades는 {그레이딩사}-{등급} 형식이어야 합니다 (예: PSA-10,BGS-9.5): ${token}`);
    }
    return { gradingService, grade };
  });
}

function parseQueryBoolean(value, label, defaultValue) {
  if (value === undefined || value === '') return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw listBadRequest(`${label}은(는) true 또는 false여야 합니다.`);
}

/** GET /api/listings — 판매글 검색·목록 (LISTING-01). */
async function list(req, res) {
  const query = req.query;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q.length > Q_MAX) throw listBadRequest(`검색어는 ${Q_MAX}자 이하여야 합니다.`);
  if (query.category !== undefined && typeof query.category !== 'string') throw listBadRequest('category 형식이 올바르지 않습니다.');

  const minPrice = parseQueryInt(query.minPrice, 'minPrice');
  const maxPrice = parseQueryInt(query.maxPrice, 'maxPrice');
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw listBadRequest('minPrice는 maxPrice보다 클 수 없습니다.');
  }
  const page = parseQueryInt(query.page, 'page', { min: 1 }) ?? 1;
  const size = parseQueryInt(query.size, 'size', { min: 1 }) ?? DEFAULT_LIST_SIZE;
  if (size > MAX_LIST_SIZE) throw listBadRequest(`size는 ${MAX_LIST_SIZE} 이하여야 합니다.`);
  const sort = query.sort === undefined || query.sort === '' ? 'latest' : query.sort;
  if (!LIST_SORTS.includes(sort)) throw listBadRequest(`sort 값이 올바르지 않습니다. (${LIST_SORTS.join(', ')})`);

  const result = await sellService.listListings(
    {
      q: q || null,
      category: query.category || null,
      itemId: parseQueryInt(query.itemId, 'itemId', { min: 1 }),
      conditions: parseQueryList(query.condition, LIST_CONDITIONS, 'condition'),
      grades: parseGrades(query.grades),
      minPrice,
      maxPrice,
      tradeMethods: parseQueryList(query.tradeMethod, LIST_TRADE_METHODS, 'tradeMethod'),
      excludeSold: parseQueryBoolean(query.excludeSold, 'excludeSold', true),
    },
    { sort, page, size, viewerId: req.user?.id },
  );
  res.json({ data: result });
}

/** GET /api/listings/:listingId — 판매글 상세 (LISTING-02). */
async function detail(req, res) {
  const listing = await sellService.getListingDetail(parseListingId(req), {
    viewerId: req.user?.id,
    ip: req.ip,
  });
  res.json({ data: listing });
}

const IMAGE_TYPES = ['photo', 'auth'];

/** POST /api/uploads/images — 이미지 업로드 (UPLOAD-01). multipart: image(파일), type(photo|auth). */
async function uploadImage(req, res) {
  const type = req.body?.type === undefined || req.body.type === '' ? 'photo' : req.body.type;
  if (!IMAGE_TYPES.includes(type)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `type은 ${IMAGE_TYPES.join(' 또는 ')}이어야 합니다.`);
  }
  if (!req.file) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'image 필드에 이미지 파일을 담아 보내주세요.');
  }
  const image = await sellService.uploadImage({ uploaderId: req.user.id, type, buffer: req.file.buffer });
  res.status(201).json({ data: image });
}

const MIN_IMAGES = 1;
const MAX_IMAGES = 10;
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;
const DIRECT_LOCATION_MAX = 100;
const MIN_PRICE = 1;
const MAX_PRICE = 1_000_000_000;

const isPositiveInt = (value) => Number.isSafeInteger(value) && value > 0;

/**
 * LISTING-03 요청 본문 검사. 위반 사항을 모두 모아 details로 돌려준다.
 * 통과하면 저장에 쓸 값(공백 제거, 조건부 필드 정리)을 반환한다.
 */
function parseCreateBody(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', '요청 본문은 JSON 객체여야 합니다.');
  }
  const details = [];
  const fail = (field, message) => details.push({ field, message });

  if (!isPositiveInt(body.itemId)) fail('itemId', 'itemId는 양의 정수여야 합니다.');

  const { imageIds } = body;
  const isMissing = (value) => value === undefined || value === null;
  if (isMissing(imageIds) || (Array.isArray(imageIds) && imageIds.length === 0)) {
    fail('imageIds', '상품 사진을 1장 이상 등록해주세요.');
  } else if (!Array.isArray(imageIds) || imageIds.length > MAX_IMAGES) {
    fail('imageIds', `상품 사진은 ${MIN_IMAGES}~${MAX_IMAGES}장이어야 합니다.`);
  } else if (!imageIds.every(isPositiveInt)) {
    fail('imageIds', 'imageIds는 양의 정수 배열이어야 합니다.');
  } else if (new Set(imageIds).size !== imageIds.length) {
    fail('imageIds', '같은 사진을 두 번 넣을 수 없습니다.');
  }

  if (isMissing(body.authImageId)) {
    fail('authImageId', '실물 인증 사진을 등록해주세요.');
  } else if (!isPositiveInt(body.authImageId)) {
    fail('authImageId', 'authImageId는 양의 정수여야 합니다.');
  } else if (Array.isArray(imageIds) && imageIds.includes(body.authImageId)) {
    fail('authImageId', '실물 인증 사진은 상품 사진과 다른 이미지여야 합니다.');
  }

  const { condition } = body;
  if (!LIST_CONDITIONS.includes(condition)) {
    fail('condition', `condition은 ${LIST_CONDITIONS.join(', ')} 중 하나여야 합니다.`);
  }
  const hasGradingService = body.gradingService !== undefined && body.gradingService !== null;
  const hasGrade = body.grade !== undefined && body.grade !== null;
  if (condition === 'graded') {
    if (!LIST_GRADING_SERVICES.includes(body.gradingService)) {
      fail('gradingService', `그레이딩 슬랩은 gradingService(${LIST_GRADING_SERVICES.join(', ')})가 필요합니다.`);
    }
    if (!LIST_GRADES.includes(body.grade)) {
      fail('grade', `그레이딩 슬랩은 grade(${LIST_GRADES.join(', ')})가 필요합니다.`);
    }
  } else if (LIST_CONDITIONS.includes(condition)) {
    if (hasGradingService) fail('gradingService', 'condition이 graded일 때만 gradingService를 보낼 수 있습니다.');
    if (hasGrade) fail('grade', 'condition이 graded일 때만 grade를 보낼 수 있습니다.');
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 1 || title.length > TITLE_MAX) fail('title', `제목은 1~${TITLE_MAX}자여야 합니다.`);

  if (!Number.isSafeInteger(body.price) || body.price < MIN_PRICE || body.price > MAX_PRICE) {
    fail('price', `가격은 ${MIN_PRICE.toLocaleString('ko-KR')}원 이상 ${MAX_PRICE.toLocaleString('ko-KR')}원 이하의 정수여야 합니다.`);
  }

  let description = '';
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') fail('description', 'description은 문자열이어야 합니다.');
    else if (body.description.length > DESCRIPTION_MAX) fail('description', `상세 설명은 ${DESCRIPTION_MAX}자 이하여야 합니다.`);
    else description = body.description;
  }

  if (typeof body.delivery !== 'boolean') fail('delivery', 'delivery는 true 또는 false여야 합니다.');
  if (typeof body.direct !== 'boolean') fail('direct', 'direct는 true 또는 false여야 합니다.');
  if (body.delivery === false && body.direct === false) {
    fail('tradeMethod', '택배 거래와 직거래 중 하나 이상 선택해야 합니다.');
  }

  let directLocation = null;
  if (body.direct === true) {
    directLocation = typeof body.directLocation === 'string' ? body.directLocation.trim() : '';
    if (directLocation.length < 1 || directLocation.length > DIRECT_LOCATION_MAX) {
      fail('directLocation', `직거래 지역은 1~${DIRECT_LOCATION_MAX}자여야 합니다.`);
    }
  }

  if (body.agreed !== true) fail('agreed', '판매자 책임 동의가 필요합니다.');

  if (details.length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', details[0].message, details);
  }
  return {
    itemId: body.itemId,
    imageIds,
    authImageId: body.authImageId,
    condition,
    gradingService: condition === 'graded' ? body.gradingService : null,
    grade: condition === 'graded' ? body.grade : null,
    title,
    price: body.price,
    description,
    delivery: body.delivery,
    direct: body.direct,
    directLocation,
  };
}

/** POST /api/listings — 판매글 등록 (LISTING-03). */
async function create(req, res) {
  const input = parseCreateBody(req.body);
  const created = await sellService.createListing(req.user.id, input);
  res.status(201).json({ data: created });
}

const PRICE_MIN = 1;
const PRICE_MAX = 1_000_000_000;
const MAX_PHOTOS = 10;
// 카테고리는 품목에서 정해지므로 품목과 함께 수정할 수 없다 (REQ-EDIT-002).
const IMMUTABLE_FIELDS = ['itemId', 'categoryId'];

function parseBoolean(value, label) {
  if (typeof value !== 'boolean') throw listBadRequest(`${label}은(는) true 또는 false여야 합니다.`);
  return value;
}

/** 수정 항목별 형식 검사. 현재 값과 엮인 규칙(상태 변경, 거래 방식 등)은 service에서 본다. */
const UPDATE_FIELD_PARSERS = {
  imageIds(value) {
    if (!Array.isArray(value) || value.length < 1 || value.length > MAX_PHOTOS || !value.every(isPositiveInt)) {
      throw listBadRequest(`imageIds는 1 ~ ${MAX_PHOTOS}개의 이미지 id 배열이어야 합니다.`);
    }
    if (new Set(value).size !== value.length) throw listBadRequest('imageIds에 같은 이미지가 중복되어 있습니다.');
    return value;
  },
  authImageId(value) {
    if (!isPositiveInt(value)) throw listBadRequest('authImageId는 이미지 id여야 합니다.');
    return value;
  },
  condition(value) {
    if (!LIST_CONDITIONS.includes(value)) throw listBadRequest(`condition 값이 올바르지 않습니다. (${LIST_CONDITIONS.join(', ')})`);
    return value;
  },
  gradingService(value) {
    if (value !== null && !LIST_GRADING_SERVICES.includes(value)) {
      throw listBadRequest(`gradingService 값이 올바르지 않습니다. (${LIST_GRADING_SERVICES.join(', ')})`);
    }
    return value;
  },
  grade(value) {
    if (value !== null && !LIST_GRADES.includes(value)) throw listBadRequest(`grade 값이 올바르지 않습니다. (${LIST_GRADES.join(', ')})`);
    return value;
  },
  title(value) {
    const title = typeof value === 'string' ? value.trim() : '';
    if (title.length < 1 || title.length > TITLE_MAX) throw listBadRequest(`제목은 1 ~ ${TITLE_MAX}자여야 합니다.`);
    return title;
  },
  price(value) {
    if (!Number.isInteger(value) || value < PRICE_MIN || value > PRICE_MAX) {
      throw listBadRequest('가격은 1원 이상 1,000,000,000원 이하의 정수여야 합니다.');
    }
    return value;
  },
  description(value) {
    if (typeof value !== 'string' || value.length > DESCRIPTION_MAX) {
      throw listBadRequest(`상세 설명은 ${DESCRIPTION_MAX}자 이하여야 합니다.`);
    }
    return value;
  },
  delivery: (value) => parseBoolean(value, 'delivery'),
  direct: (value) => parseBoolean(value, 'direct'),
  directLocation(value) {
    if (value === null) return null;
    if (typeof value !== 'string') throw listBadRequest('directLocation 형식이 올바르지 않습니다.');
    const location = value.trim();
    if (location.length > DIRECT_LOCATION_MAX) throw listBadRequest(`직거래 지역은 ${DIRECT_LOCATION_MAX}자 이하여야 합니다.`);
    // 빈 문자열은 "지역 없음"으로 본다. direct = true인데 비어 있으면 service에서 막는다.
    return location || null;
  },
};
const UPDATABLE_FIELDS = Object.keys(UPDATE_FIELD_PARSERS);

/** PATCH /api/listings/:listingId — 판매글 수정 (LISTING-04). 보낸 필드만 바꾼다. */
async function update(req, res) {
  const listingId = parseListingId(req);
  const input = req.body ?? {};
  if (IMMUTABLE_FIELDS.some((key) => input[key] !== undefined)) {
    throw listBadRequest('카테고리와 품목은 수정할 수 없습니다. 변경하려면 삭제 후 다시 등록해 주세요.');
  }
  const fields = Object.fromEntries(
    UPDATABLE_FIELDS
      .filter((key) => input[key] !== undefined)
      .map((key) => [key, UPDATE_FIELD_PARSERS[key](input[key])]),
  );
  if (Object.keys(fields).length === 0) {
    throw listBadRequest(`수정할 항목이 없습니다. (${UPDATABLE_FIELDS.join(', ')})`);
  }
  res.json({ data: await sellService.updateListing(listingId, req.user.id, fields) });
}

/** DELETE /api/listings/:listingId — 판매글 삭제 (LISTING-05). */
async function remove(req, res) {
  await sellService.deleteListing(parseListingId(req), req.user.id);
  res.status(204).end();
}

/** GET /api/categories — 카테고리 트리 (ITEM-01). 판매글 등록 카테고리 선택. */
async function categories(req, res) {
  res.json({ data: await sellService.getCategoryTree() });
}

const ITEM_SEARCH_Q_MAX = 100;
const ITEM_SEARCH_MAX_TOKENS = 5;
const ITEM_SEARCH_DEFAULT_SIZE = 10;
const ITEM_SEARCH_MAX_SIZE = 50;

/**
 * 검색어 → 단어 목록. 공백으로 나누고, 카드번호 앞의 #(예: "#201")은 뗀다.
 * 너무 많은 단어는 LIKE 조건만 늘리므로 앞에서부터 5개까지만 쓴다.
 */
function toSearchTokens(q) {
  return q
    .split(/\s+/)
    .map((token) => token.replace(/^#+/, ''))
    .filter(Boolean)
    .slice(0, ITEM_SEARCH_MAX_TOKENS);
}

/** GET /api/items — 품목 검색 (ITEM-02). 판매글 등록 "공식 품목 DB 검색", 토론글 시세 태그 선택. */
async function searchItems(req, res) {
  const { query } = req;
  if (query.q !== undefined && typeof query.q !== 'string') throw listBadRequest('q 형식이 올바르지 않습니다.');
  const q = (query.q ?? '').trim();
  if (q.length > ITEM_SEARCH_Q_MAX) throw listBadRequest(`검색어는 ${ITEM_SEARCH_Q_MAX}자 이하여야 합니다.`);
  if (query.category !== undefined && typeof query.category !== 'string') {
    throw listBadRequest('category 형식이 올바르지 않습니다.');
  }
  const page = parseQueryInt(query.page, 'page', { min: 1 }) ?? 1;
  const size = parseQueryInt(query.size, 'size', { min: 1 }) ?? ITEM_SEARCH_DEFAULT_SIZE;
  if (size > ITEM_SEARCH_MAX_SIZE) throw listBadRequest(`size는 ${ITEM_SEARCH_MAX_SIZE} 이하여야 합니다.`);

  const result = await sellService.searchItems(
    { q: q || null, tokens: toSearchTokens(q), category: query.category || null },
    { page, size },
  );
  res.json({ data: result });
}

module.exports = { list, detail, uploadImage, create, update, remove, categories, searchItems };

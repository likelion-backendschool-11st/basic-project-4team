const itemRequestRepository = require('./itemrequest.repository');
const { maskProfanity } = require('../utils/profanity');
const HttpError = require('../utils/HttpError');

/**
 * 품목 등록 요청 (ITEM-06). 소분류만 받고, 이미 있는 품목·내 대기 중 같은 요청은 409.
 * 중복 비교는 사용자가 쓴 원문 제목으로 하고, 저장할 때만 욕설을 가린다.
 */
async function createRequest(userId, { categoryId, title, body, referenceUrl }) {
  const category = await itemRequestRepository.findActiveCategory(categoryId);
  if (!category) throw new HttpError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (category.parentId === null) {
    throw new HttpError(400, 'VALIDATION_ERROR', '소분류 카테고리를 선택해 주세요.');
  }

  const existing = await itemRequestRepository.findActiveItemByName(categoryId, title);
  if (existing) {
    throw new HttpError(409, 'ITEM_ALREADY_EXISTS', '이미 등록된 품목이에요. 검색 결과에서 선택해 주세요.', {
      item: { id: existing.id, slug: existing.slug, name: existing.name },
    });
  }
  if (await itemRequestRepository.hasPendingDuplicate(userId, categoryId, title)) {
    throw new HttpError(409, 'ITEM_REQUEST_DUPLICATE', '같은 품목 요청이 이미 검토 중이에요.');
  }

  return itemRequestRepository.create({
    userId,
    categoryId,
    title: maskProfanity(title),
    body: maskProfanity(body),
    referenceUrl,
  });
}

/** 내 품목 등록 요청 목록 (ITEM-07). */
async function listMyRequests(userId, { status, page, size }) {
  const { items, totalCount } = await itemRequestRepository.listByUser(userId, { status, page, size });
  return { items, page, size, totalCount };
}

module.exports = { createRequest, listMyRequests };

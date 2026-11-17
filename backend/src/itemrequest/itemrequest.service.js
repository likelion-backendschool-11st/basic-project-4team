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

/* ───────── 관리자 (ITEM-08·09, #34) ───────── */

const CARD_PARENT_CODE = 'cards';
const CARD_FIELDS = ['setName', 'cardNo', 'language', 'rarity'];

/** 관리자 목록 (ITEM-08). */
async function listRequests({ status, page, size }) {
  const { items, totalCount } = await itemRequestRepository.listAll({ status, page, size });
  return { items, page, size, totalCount };
}

/** 잠근 요청이 없거나 이미 처리됐으면 에러. */
function assertPending(request) {
  if (!request) throw new HttpError(404, 'ITEM_REQUEST_NOT_FOUND', '품목 등록 요청을 찾을 수 없습니다.');
  if (request.status !== 'pending') {
    throw new HttpError(409, 'ITEM_REQUEST_ALREADY_PROCESSED', '이미 처리된 요청입니다.');
  }
}

function itemExists(item) {
  return new HttpError(409, 'ITEM_ALREADY_EXISTS', '이미 등록된 품목이에요. 기존 품목에 연결해 주세요.', {
    item: { id: item.id, slug: item.slug, name: item.name },
  });
}

/** 승인할 품목 id. itemId면 기존 품목에 연결, item이면 요청의 소분류로 새로 만든다. */
async function resolveItemId(conn, request, { itemId, item }) {
  if (itemId) {
    const existing = await itemRequestRepository.findActiveItemById(conn, itemId);
    if (!existing) throw new HttpError(404, 'ITEM_NOT_FOUND', '품목을 찾을 수 없습니다.');
    return { id: existing.id, created: false };
  }
  if (request.parentCode !== CARD_PARENT_CODE && CARD_FIELDS.some((field) => item[field] !== null)) {
    throw new HttpError(400, 'VALIDATION_ERROR', '세트명·카드번호·언어·희귀도는 카드 카테고리에만 입력할 수 있습니다.');
  }
  const target = { categoryId: request.categoryId, ...item };
  const conflict = await itemRequestRepository.findConflictingItem(conn, target);
  if (conflict) throw itemExists(conflict);
  const id = await itemRequestRepository.insertItem(conn, { requestId: request.id, ...target });
  return { id, created: true };
}

/**
 * 승인·반려 (ITEM-09). 승인하면 공식 품목을 만들거나(기존 품목에 연결) 같은 제목의 대기 요청까지 함께 승인한다.
 * 승인 후 바로 품목 검색(ITEM-02)에 나온다.
 */
async function processRequest(adminId, requestId, input) {
  const outcome = await itemRequestRepository.withTransaction(async (conn) => {
    const request = await itemRequestRepository.findForUpdate(conn, requestId);
    assertPending(request);
    if (input.action === 'reject') {
      await itemRequestRepository.reject(conn, { id: requestId, adminId, rejectReason: maskProfanity(input.rejectReason) });
      return null;
    }
    const resolved = await resolveItemId(conn, request, input);
    const approvedCount = await itemRequestRepository.approveWithSameTitle(conn, {
      categoryId: request.categoryId,
      title: request.title,
      itemId: resolved.id,
      adminId,
    });
    return { itemCreated: resolved.created, approvedCount };
  });
  const itemRequest = await itemRequestRepository.findAdminById(requestId);
  return outcome ? { itemRequest, ...outcome } : { itemRequest };
}

module.exports = { createRequest, listMyRequests, listRequests, processRequest };

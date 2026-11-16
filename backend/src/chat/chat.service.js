const chatRepository = require('./chat.repository');
const chatSocket = require('./chat.socket');
const HttpError = require('../utils/HttpError');
const { maskProfanity } = require('../utils/profanity');
const { maskContact } = require('../utils/contactFilter');

const ROOM_LIST_LIMIT = 100;

function roomNotFound() {
  return new HttpError(404, 'CHAT_ROOM_NOT_FOUND', '채팅방을 찾을 수 없습니다.');
}

/** 참여한 방이면 { room, role, partnerId }, 아니면 404. */
async function getMembership(roomId, userId) {
  const room = await chatRepository.findMembership(roomId, userId);
  if (!room) throw roomNotFound();
  const role = room.buyer_id === userId ? 'buyer' : 'seller';
  return { room, role, partnerId: role === 'buyer' ? room.seller_id : room.buyer_id };
}

/** 이 회원의 안 읽은 수를 다시 세서 열린 소켓에 알린다. */
async function pushUnread(userId) {
  chatSocket.sendToUser(userId, { type: 'unread', unreadCount: await chatRepository.countUnread(userId) });
}

/**
 * CHAT-01 채팅방 만들기. 이미 있으면 기존 방 (created: false).
 * 내 판매글은 403, 판매완료·삭제된 판매글은 새 방만 막는다 (기존 방은 계속 쓸 수 있다).
 */
async function openRoom(userId, listingId) {
  const listing = await chatRepository.findListing(listingId);
  if (listing && listing.seller_id === userId) {
    throw new HttpError(403, 'CANNOT_CHAT_OWN_LISTING', '내 판매글에는 채팅할 수 없습니다.');
  }
  const existingId = await chatRepository.findRoomId(listingId, userId);
  if (existingId) return { created: false, room: await chatRepository.findRoomView(existingId, userId) };

  if (!listing || listing.deleted_at !== null) {
    throw new HttpError(404, 'LISTING_NOT_FOUND', '판매글을 찾을 수 없습니다.');
  }
  if (listing.status === 'sold') {
    throw new HttpError(409, 'LISTING_SOLD', '판매가 완료된 판매글입니다.');
  }
  const newId = await chatRepository.insertRoom({ listingId, buyerId: userId, sellerId: listing.seller_id });
  // null = 같은 방을 동시에 만들어 다른 요청이 먼저 넣음 → 그 방을 돌려준다.
  const roomId = newId ?? (await chatRepository.findRoomId(listingId, userId));
  return { created: newId !== null, room: await chatRepository.findRoomView(roomId, userId) };
}

/** CHAT-02 내 채팅방 목록 + 전체 안 읽은 수. */
async function listRooms(userId) {
  const [items, unreadCount] = await Promise.all([
    chatRepository.listRoomViews(userId, ROOM_LIST_LIMIT),
    chatRepository.countUnread(userId),
  ]);
  return { items, unreadCount };
}

/** CHAT-06 채팅방 하나. */
async function getRoom(roomId, userId) {
  const room = await chatRepository.findRoomView(roomId, userId);
  if (!room) throw roomNotFound();
  return room;
}

/** CHAT-03 메시지 목록 (오래된 순). 한 개 더 읽어서 더 이전 메시지가 있는지 본다. */
async function listMessages(roomId, userId, { before, size }) {
  await getMembership(roomId, userId);
  const rows = await chatRepository.listMessages(roomId, { before, limit: size + 1 });
  const hasMore = rows.length > size;
  return { items: hasMore ? rows.slice(1) : rows, hasMore };
}

/** 욕설 → 전화번호·외부 메신저 순서로 가린다. */
function filterText(body) {
  const withoutProfanity = maskProfanity(body);
  const { text } = maskContact(withoutProfanity);
  return { text, filtered: text !== body };
}

/**
 * CHAT-04 메시지 보내기. 저장 후 두 사람에게 message 이벤트,
 * 상대에게 read 이벤트(보낸 사람이 여기까지 읽음)와 두 사람에게 안 읽은 수를 보낸다.
 */
async function sendMessage(roomId, userId, input) {
  const { role, partnerId } = await getMembership(roomId, userId);
  const { text, filtered } = input.type === 'text' ? filterText(input.body) : { text: null, filtered: false };
  let message;
  try {
    message = await chatRepository.insertMessage({
      roomId, senderId: userId, senderRole: role, type: input.type, body: text, imageId: input.imageId,
    });
  } catch (err) {
    if (err instanceof chatRepository.ImageNotAvailableError) {
      throw new HttpError(400, 'IMAGE_NOT_AVAILABLE', '보낼 수 없는 사진입니다. 사진을 다시 올려 주세요.');
    }
    throw err;
  }

  const event = { type: 'message', roomId, message };
  chatSocket.sendToUser(userId, event);
  chatSocket.sendToUser(partnerId, event);
  chatSocket.sendToUser(partnerId, { type: 'read', roomId, readerId: userId, lastReadMessageId: message.id });
  await Promise.all([pushUnread(partnerId), pushUnread(userId)]);
  return { message, filtered };
}

/** CHAT-07 이 방 모두 읽음. 전체 안 읽은 수를 돌려준다. */
async function markRead(roomId, userId) {
  const { role, partnerId } = await getMembership(roomId, userId);
  const readId = await chatRepository.markRead(roomId, role);
  const unreadCount = await chatRepository.countUnread(userId);
  if (readId !== null) {
    chatSocket.sendToUser(partnerId, { type: 'read', roomId, readerId: userId, lastReadMessageId: readId });
    // 다른 탭의 배지도 맞춘다.
    chatSocket.sendToUser(userId, { type: 'unread', unreadCount });
  }
  return { unreadCount };
}

/** CHAT-08 안 읽은 수. */
async function getUnreadCount(userId) {
  return { unreadCount: await chatRepository.countUnread(userId) };
}

module.exports = { openRoom, listRooms, getRoom, listMessages, sendMessage, markRead, getUnreadCount };

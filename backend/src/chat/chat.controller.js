const chatService = require('./chat.service');
const HttpError = require('../utils/HttpError');

const BODY_MAX = 1000;
const SIZE = { default: 30, max: 100 };

const badRequest = (message) => new HttpError(400, 'VALIDATION_ERROR', message);
const isPositiveInt = (value) => /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value));

function parseId(value, label) {
  if (!isPositiveInt(value)) throw badRequest(`${label}는 1 이상의 정수여야 합니다.`);
  return Number(value);
}

/** POST /api/chat/rooms — 채팅방 만들기 (CHAT-01). 새 방 201, 기존 방 200. */
async function openRoom(req, res) {
  const listingId = parseId(req.body?.listingId, 'listingId');
  const { created, room } = await chatService.openRoom(req.user.id, listingId);
  res.status(created ? 201 : 200).json({ data: { room } });
}

/** GET /api/chat/rooms — 내 채팅방 목록 (CHAT-02). */
async function listRooms(req, res) {
  res.json({ data: await chatService.listRooms(req.user.id) });
}

/** GET /api/chat/rooms/:roomId — 채팅방 하나 (CHAT-06). */
async function getRoom(req, res) {
  const room = await chatService.getRoom(parseId(req.params.roomId, 'roomId'), req.user.id);
  res.json({ data: { room } });
}

/** GET /api/chat/rooms/:roomId/messages?before=&size= — 메시지 목록 (CHAT-03). */
async function listMessages(req, res) {
  const roomId = parseId(req.params.roomId, 'roomId');
  const { before, size } = req.query;
  if (before !== undefined && !isPositiveInt(before)) throw badRequest('before는 1 이상의 정수여야 합니다.');
  if (size !== undefined && (!isPositiveInt(size) || Number(size) > SIZE.max)) {
    throw badRequest(`size는 1~${SIZE.max} 사이의 정수여야 합니다.`);
  }
  const page = await chatService.listMessages(roomId, req.user.id, {
    before: before === undefined ? undefined : Number(before),
    size: size === undefined ? SIZE.default : Number(size),
  });
  res.json({ data: page });
}

/** 메시지 본문: { type: 'text', body } 또는 { type: 'image', imageId }. */
function parseMessage(input) {
  if (input?.type === 'text') {
    const body = typeof input.body === 'string' ? input.body.trim() : '';
    if (body.length === 0 || body.length > BODY_MAX) throw badRequest(`메시지는 1~${BODY_MAX}자여야 합니다.`);
    return { type: 'text', body };
  }
  if (input?.type === 'image') {
    return { type: 'image', imageId: parseId(input.imageId, 'imageId') };
  }
  throw badRequest("type은 'text' 또는 'image'여야 합니다.");
}

/** POST /api/chat/rooms/:roomId/messages — 메시지 보내기 (CHAT-04). */
async function sendMessage(req, res) {
  const roomId = parseId(req.params.roomId, 'roomId');
  const result = await chatService.sendMessage(roomId, req.user.id, parseMessage(req.body));
  res.status(201).json({ data: result });
}

/** PUT /api/chat/rooms/:roomId/read — 이 방 모두 읽음 (CHAT-07). */
async function markRead(req, res) {
  res.json({ data: await chatService.markRead(parseId(req.params.roomId, 'roomId'), req.user.id) });
}

/** GET /api/chat/unread-count — 안 읽은 메시지 수 (CHAT-08). */
async function unreadCount(req, res) {
  res.json({ data: await chatService.getUnreadCount(req.user.id) });
}

module.exports = { openRoom, listRooms, getRoom, listMessages, sendMessage, markRead, unreadCount };

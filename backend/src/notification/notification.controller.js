const notificationService = require('./notification.service');
const HttpError = require('../utils/HttpError');

const SIZE_DEFAULT = 20;
const SIZE_MAX = 50;

function badRequest(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

function parseSize(value) {
  if (value === undefined) return SIZE_DEFAULT;
  if (!/^[1-9]\d*$/.test(String(value)) || Number(value) > SIZE_MAX) {
    throw badRequest(`size는 1~${SIZE_MAX} 사이의 정수여야 합니다.`);
  }
  return Number(value);
}

function parseId(req) {
  const { notificationId } = req.params;
  if (!/^[1-9]\d*$/.test(notificationId)) throw badRequest('notificationId는 1 이상의 정수여야 합니다.');
  return Number(notificationId);
}

/** GET /api/notifications — 최근 알림 + 안 읽은 수 (NOTI-01). */
async function list(req, res) {
  res.json({ data: await notificationService.listNotifications(req.user.id, parseSize(req.query.size)) });
}

/** GET /api/notifications/unread-count — 헤더 배지용 안 읽은 수 (NOTI-02). */
async function unreadCount(req, res) {
  res.json({ data: await notificationService.getUnreadCount(req.user.id) });
}

/** PATCH /api/notifications/:notificationId/read — 하나 읽음 (NOTI-03). */
async function markRead(req, res) {
  await notificationService.markRead(req.user.id, parseId(req));
  res.status(204).end();
}

/** POST /api/notifications/read-all — 모두 읽음 (NOTI-04). */
async function markAllRead(req, res) {
  await notificationService.markAllRead(req.user.id);
  res.status(204).end();
}

module.exports = { list, unreadCount, markRead, markAllRead };

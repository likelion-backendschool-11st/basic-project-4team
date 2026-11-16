const notificationRepository = require('./notification.repository');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');

/**
 * 댓글·답글 알림. 댓글이면 글 작성자에게(comment), 답글이면 부모 댓글 작성자에게(reply) 보내고,
 * 글 작성자가 부모 댓글 작성자와 다르면 글 작성자에게도 comment 알림을 보낸다. 본인에게는 보내지 않는다.
 * 알림 저장이 실패해도 댓글 작성은 성공으로 둔다 (부가 기능).
 */
async function notifyComment({ postId, commentId, parentId, actorId }) {
  try {
    const { postAuthorId, parentAuthorId } = await notificationRepository.findCommentTargets(postId, parentId);
    const rows = [];
    if (parentAuthorId !== null && parentAuthorId !== actorId) {
      rows.push({ userId: parentAuthorId, type: 'reply', actorId, postId, commentId });
    }
    if (postAuthorId !== null && postAuthorId !== actorId && postAuthorId !== parentAuthorId) {
      rows.push({ userId: postAuthorId, type: 'comment', actorId, postId, commentId });
    }
    await notificationRepository.insertMany(pool, rows);
  } catch (err) {
    console.error('[notification] 댓글 알림 저장 실패', err);
  }
}

/** 찜한 판매글 가격 변동 알림. 판매글 수정 트랜잭션 안에서 같이 저장한다. */
async function notifyPriceChange(connection, { listingId, sellerId, oldPrice, newPrice }) {
  if (oldPrice === newPrice) return;
  const wisherIds = await notificationRepository.findWisherIds(connection, listingId, sellerId);
  await notificationRepository.insertMany(
    connection,
    wisherIds.map((userId) => ({ userId, type: 'price_change', actorId: sellerId, listingId, oldPrice, newPrice })),
  );
}

async function listNotifications(userId, size) {
  const [items, unreadCount] = await Promise.all([
    notificationRepository.findRecent(userId, size),
    notificationRepository.countUnread(userId),
  ]);
  return { items, unreadCount };
}

async function getUnreadCount(userId) {
  return { unreadCount: await notificationRepository.countUnread(userId) };
}

async function markRead(userId, notificationId) {
  if (!(await notificationRepository.markRead(userId, notificationId))) {
    throw new HttpError(404, 'NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없습니다.');
  }
}

async function markAllRead(userId) {
  await notificationRepository.markAllRead(userId);
}

module.exports = { notifyComment, notifyPriceChange, listNotifications, getUnreadCount, markRead, markAllRead };

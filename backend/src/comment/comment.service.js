const commentRepository = require('./comment.repository');
const HttpError = require('../utils/HttpError');

// 댓글마다 함께 내려주는 답글 미리보기 개수. 나머지는 답글 더보기 API로.
const REPLY_PREVIEW_SIZE = 3;

function postNotFound() {
  return new HttpError(404, 'POST_NOT_FOUND', '토론글을 찾을 수 없습니다.');
}

function commentNotFound() {
  return new HttpError(404, 'COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');
}

/** DB 행 → 응답 Comment. 로그인 사용자 기준 isMine을 붙인다. */
function decorate(row, viewerId) {
  const comment = commentRepository.toComment(row);
  return {
    ...comment,
    isMine: viewerId !== undefined && comment.author !== null && comment.author.id === viewerId,
  };
}

/** size + 1개를 읽어 다음 페이지가 있는지 판단한다. */
function toPage(rows, size) {
  const hasNext = rows.length > size;
  const pageRows = hasNext ? rows.slice(0, size) : rows;
  return { pageRows, hasNext, nextCursor: hasNext ? String(pageRows[pageRows.length - 1].id) : null };
}

/** 댓글(답글 제외) 행에 replyCount, replies(미리보기)를 붙인다. */
async function decorateTopLevel(rows, viewerId) {
  const { previews, counts } = await commentRepository.findReplyPreviews(
    rows.map((row) => row.id),
    REPLY_PREVIEW_SIZE,
  );
  return rows.map((row) => ({
    ...decorate(row, viewerId),
    replyCount: counts.get(row.id) ?? 0,
    replies: previews
      .filter((reply) => reply.parent_id === row.id)
      .map((reply) => decorate(reply, viewerId)),
  }));
}

/** 댓글 목록 (커서 페이징). totalCount는 게시글의 commentCount(댓글 + 답글). */
async function listComments(postId, { cursor, size }, viewerId) {
  if (!(await commentRepository.existsPost(postId))) throw postNotFound();
  const rows = await commentRepository.findTopLevel(postId, { cursor, limit: size + 1 });
  const { pageRows, hasNext, nextCursor } = toPage(rows, size);
  const [items, totalCount] = await Promise.all([
    decorateTopLevel(pageRows, viewerId),
    commentRepository.findPostCommentCount(postId),
  ]);
  return { items, nextCursor, hasNext, totalCount };
}

/** 답글 더보기. 삭제됐어도 답글이 남아 있는 댓글이면 조회할 수 있다. */
async function listReplies(commentId, { cursor, size }, viewerId) {
  const parent = await commentRepository.findRawById(commentId);
  if (!parent || parent.parent_id !== null) throw commentNotFound();
  if (parent.deleted_at !== null && !(await commentRepository.hasLiveReplies(commentId))) {
    throw commentNotFound();
  }
  const rows = await commentRepository.findReplies(commentId, { cursor, limit: size + 1 });
  const { pageRows, hasNext, nextCursor } = toPage(rows, size);
  return {
    items: pageRows.map((row) => decorate(row, viewerId)),
    nextCursor,
    hasNext,
  };
}

/** 응답용 Comment 1건. 댓글이면 replyCount·replies까지 붙인다. */
async function getComment(commentId, viewerId) {
  const row = await commentRepository.findRawById(commentId);
  if (row.parent_id === null) {
    const [comment] = await decorateTopLevel([row], viewerId);
    return comment;
  }
  return decorate(row, viewerId);
}

/** 댓글·답글 작성. 답글은 같은 게시글의, 삭제되지 않은 댓글에만 달 수 있다 (답글의 답글 금지). */
async function createComment(postId, userId, { body, parentId }) {
  if (!(await commentRepository.existsPost(postId))) throw postNotFound();
  if (parentId !== null) {
    const parent = await commentRepository.findRawById(parentId);
    if (!parent || parent.deleted_at !== null) throw commentNotFound();
    if (parent.post_id !== postId || parent.parent_id !== null) {
      throw new HttpError(400, 'INVALID_PARENT_COMMENT', '이 댓글에는 답글을 달 수 없습니다.');
    }
  }
  const { id, commentCount } = await commentRepository.create({ postId, userId, parentId, body });
  return { comment: await getComment(id, userId), commentCount };
}

/** 삭제되지 않은 댓글의 원본 행. 없으면 404. */
async function getLiveComment(commentId) {
  const row = await commentRepository.findRawById(commentId);
  if (!row || row.deleted_at !== null) throw commentNotFound();
  return row;
}

/** 본인의 삭제되지 않은 댓글인지 확인하고 원본 행을 돌려준다. 없으면 404, 남의 댓글이면 403. */
async function getOwnComment(commentId, userId) {
  const row = await getLiveComment(commentId);
  if (row.user_id !== userId) {
    throw new HttpError(403, 'FORBIDDEN', '본인이 작성한 댓글만 수정·삭제할 수 있습니다.');
  }
  return row;
}

async function updateComment(commentId, userId, body) {
  await getOwnComment(commentId, userId);
  await commentRepository.updateBody(commentId, body);
  return getComment(commentId, userId);
}

async function deleteComment(commentId, userId) {
  const row = await getOwnComment(commentId, userId);
  await commentRepository.softDelete(commentId, row.post_id);
}

module.exports = {
  listComments,
  listReplies,
  createComment,
  updateComment,
  deleteComment,
};

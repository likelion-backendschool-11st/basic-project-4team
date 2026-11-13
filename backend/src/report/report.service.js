const reportRepository = require('./report.repository');
const communityRepository = require('../community/community.repository');
const commentService = require('../comment/comment.service');
const HttpError = require('../utils/HttpError');

/** 대상 종류별로 "삭제되지 않은 대상의 작성자 id"를 찾는다. 없으면 null. */
const TARGETS = {
  post: {
    findAuthorId: async (id) => (await communityRepository.findById(id))?.author.id ?? null,
    notFound: () => new HttpError(404, 'POST_NOT_FOUND', '토론글을 찾을 수 없습니다.'),
  },
  comment: {
    findAuthorId: (id) => commentService.findLiveAuthorId(id),
    notFound: () => new HttpError(404, 'COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.'),
  },
};

/** 신고 접수. 본인 글·댓글은 신고할 수 없고, 같은 대상은 1인 1회. */
async function createReport(reporterId, { targetType, targetId, reason, detail }) {
  const target = TARGETS[targetType];
  const authorId = await target.findAuthorId(targetId);
  if (authorId === null) throw target.notFound();
  if (authorId === reporterId) {
    throw new HttpError(400, 'CANNOT_REPORT_OWN', '본인이 작성한 글이나 댓글은 신고할 수 없습니다.');
  }
  try {
    return await reportRepository.create({ reporterId, targetType, targetId, reason, detail });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'ALREADY_REPORTED', '이미 신고한 내용입니다.');
    }
    throw err;
  }
}

module.exports = { createReport, TARGET_TYPES: Object.keys(TARGETS) };

const HttpError = require('../utils/HttpError');

/** 모든 에러를 { error: { code, message } } 형식으로 응답한다. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  // express.json()이 잘못된 JSON 본문을 받은 경우
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: '요청 본문이 올바른 JSON이 아닙니다.' } });
  }
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } });
}

module.exports = errorHandler;

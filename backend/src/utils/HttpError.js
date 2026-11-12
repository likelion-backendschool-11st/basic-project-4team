/** 상태 코드·에러 코드를 담은 에러. errorHandler가 응답으로 바꾼다. */
class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = HttpError;

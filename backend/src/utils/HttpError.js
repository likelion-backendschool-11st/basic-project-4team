/** 상태 코드·에러 코드를 담은 에러. errorHandler가 응답으로 바꾼다. */
class HttpError extends Error {
  /** details: 필드별 사유 등 추가 정보 (예: [{ field, message }]). 있으면 응답의 error.details로 나간다. */
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = HttpError;

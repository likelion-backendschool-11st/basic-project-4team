const multer = require('multer');
const HttpError = require('../utils/HttpError');

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// 원본은 디스크에 남기지 않는다. 메모리에서 리사이즈한 결과만 저장(service)한다.
// 형식 검사는 MIME(클라이언트마다 다르고 속일 수 있음) 대신 service에서 파일 내용으로 한다.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
}).single('image');

/** multipart의 image 필드 1개를 req.file(buffer)로 받는다. multer 에러는 API 에러 형식으로 바꾼다. */
function uploadSingleImage(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new HttpError(413, 'IMAGE_TOO_LARGE', '이미지는 10MB 이하만 올릴 수 있습니다.'));
      }
      return next(new HttpError(400, 'VALIDATION_ERROR', 'image 필드에 이미지 1장만 보내주세요.'));
    }
    return next(err);
  });
}

module.exports = { uploadSingleImage, MAX_IMAGE_BYTES };

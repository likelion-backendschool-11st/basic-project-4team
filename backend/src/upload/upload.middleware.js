const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const HttpError = require('../utils/HttpError');

/** 업로드 파일 저장 위치 (backend/uploads). git에는 올라가지 않는다(.gitignore). */
const UPLOAD_ROOT = env.uploadDir;
const POST_IMAGE_DIR = path.join(UPLOAD_ROOT, 'posts');
/** 응답·DB에 저장하는 경로 접두어. app.js가 이 경로로 UPLOAD_ROOT를 제공한다. */
const PUBLIC_PREFIX = '/uploads';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

fs.mkdirSync(POST_IMAGE_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: POST_IMAGE_DIR,
    // 사용자가 보낸 파일명은 쓰지 않는다 (경로 조작·덮어쓰기 방지).
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    return cb(new HttpError(400, 'INVALID_FILE_TYPE', 'JPG, PNG, WebP 이미지만 올릴 수 있습니다.'));
  },
});

/** multipart의 image 필드 1개를 받는다. multer 에러는 공통 에러 형식으로 바꾼다. */
function singlePostImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof HttpError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new HttpError(400, 'FILE_TOO_LARGE', '이미지는 5MB 이하만 올릴 수 있습니다.'));
    }
    return next(new HttpError(400, 'VALIDATION_ERROR', '이미지 파일 1개를 image 필드로 보내 주세요.'));
  });
}

module.exports = { singlePostImage, UPLOAD_ROOT, POST_IMAGE_DIR, PUBLIC_PREFIX };

const crypto = require('crypto');
const multer = require('multer');
const fileStorage = require('../file/file.storage');
const HttpError = require('../utils/HttpError');

/** 저장 폴더는 파일 서버(file.storage)가 정하고 서버 시작 시 만든다. */
const POST_IMAGE_DIR = fileStorage.dirPath(fileStorage.UPLOAD_DIRS.posts);
const CHAT_IMAGE_DIR = fileStorage.dirPath(fileStorage.UPLOAD_DIRS.chat);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

/** destination 폴더에 이미지 1장을 저장하는 multer. 토론글·채팅 사진이 같은 규칙(형식·용량)을 쓴다. */
const imageUploader = (destination) => multer({
  storage: multer.diskStorage({
    destination,
    // 사용자가 보낸 파일명은 쓰지 않는다 (경로 조작·덮어쓰기 방지).
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    return cb(new HttpError(400, 'INVALID_FILE_TYPE', 'JPG, PNG, WebP 이미지만 올릴 수 있습니다.'));
  },
});

/** multipart의 image 필드 1개를 받는 미들웨어. multer 에러는 공통 에러 형식으로 바꾼다. */
const singleImage = (uploader) => (req, res, next) => {
  uploader.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof HttpError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new HttpError(400, 'FILE_TOO_LARGE', '이미지는 5MB 이하만 올릴 수 있습니다.'));
    }
    return next(new HttpError(400, 'VALIDATION_ERROR', '이미지 파일 1개를 image 필드로 보내 주세요.'));
  });
};

const singlePostImage = singleImage(imageUploader(POST_IMAGE_DIR));
const singleChatImage = singleImage(imageUploader(CHAT_IMAGE_DIR));

module.exports = { singlePostImage, singleChatImage };

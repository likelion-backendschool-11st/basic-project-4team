const uploadService = require('./upload.service');
const HttpError = require('../utils/HttpError');
const { PUBLIC_PREFIX } = require('./upload.middleware');

/** POST /api/uploads/post-images — 토론글 사진 1장 업로드. 글 등록 때 imageIds로 연결한다. */
async function postImage(req, res) {
  if (!req.file) throw new HttpError(400, 'VALIDATION_ERROR', '이미지 파일 1개를 image 필드로 보내 주세요.');
  const image = await uploadService.registerPostImage(
    req.user.id,
    req.file,
    `${PUBLIC_PREFIX}/posts/${req.file.filename}`,
  );
  res.status(201).json({ data: { image } });
}

/** POST /api/uploads/chat-images — 채팅 사진 1장 업로드 (UPLOAD-03). 메시지를 보낼 때 imageId로 쓴다. */
async function chatImage(req, res) {
  if (!req.file) throw new HttpError(400, 'VALIDATION_ERROR', '이미지 파일 1개를 image 필드로 보내 주세요.');
  const image = await uploadService.registerChatImage(
    req.user.id,
    req.file,
    `${PUBLIC_PREFIX}/chat/${req.file.filename}`,
  );
  res.status(201).json({ data: { image } });
}

module.exports = { postImage, chatImage };
